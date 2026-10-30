import mongoose, { Schema, Types, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface Avatar {
  url: string;
  public_id: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: Avatar | null;
  isVerified: boolean;
  courses: Array<{ courseId: Types.ObjectId }>;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods {
  comparePasswords: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser, Model<IUser>, UserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be atleast 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      maxlength: [254, "Password length cannot exceed 254 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      url: {
        type: String,
        required: [true, "Avatar url is required"],
      },
      public_id: {
        type: String,
        required: [true, "Avatar must have a public_id"],
      },
    },
    courses: [
      {
        courseId: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePasswords = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
