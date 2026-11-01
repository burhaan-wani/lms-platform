import mongoose, { Schema, Types, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface Avatar {
  url: string | null;
  public_id: string | null;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string | null;
  avatar: Avatar | null;
  isVerified: boolean;
  verificationCode: number | null;
  verifyCodeExpiration: Date | null;
  // courses: Array<{ courseId: Types.ObjectId }>;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePasswords: (password: string) => Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
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
    verificationCode: {
      type: Number,
      default: null,
    },
    verifyCodeExpiration: {
      type: Date,
      default: null,
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      public_id: {
        type: String,
        default: null,
      },
    },
    // courses: [
    //   {
    //     courseId: Schema.Types.ObjectId,
    //     ref: "Course",
    //   },
    // ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePasswords = async function (password: string) {
  return await bcrypt.compare(password, this.password as string);
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
