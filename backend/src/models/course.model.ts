import mongoose, { Schema, Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  comment: string;
  commentReplies: IComment[];
}

export interface IReview {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

export interface ILink {
  _id: Types.ObjectId;
  title: string;
  url: string;
}

export interface ICourseData {
  _id: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

export interface ICourse {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: {
    url: string;
    public_id: string;
  };
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased?: number;
}

const commentSchema = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    commentReplies: {},
  },
  { timestamps: true },
);

commentSchema.add({
  commentReplies: [commentSchema],
});

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    commentReplies: [commentSchema],
  },
  { timestamps: true },
);

const linkSchema = new Schema<ILink>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const courseDataSchema = new Schema<ICourseData>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    videoThumbnail: { type: Object, required: true },
    videoSection: { type: String, required: true },
    videoLength: { type: Number, required: true },
    videoPlayer: { type: String, required: true },
    links: [linkSchema],
    suggestion: { type: String },
    questions: [commentSchema],
  },
  { timestamps: true },
);

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedPrice: { type: Number },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    tags: { type: String, required: true },
    level: { type: String, required: true },
    demoUrl: { type: String, required: true },
    benefits: [{ title: { type: String, required: true } }],
    prerequisites: [{ title: { type: String, required: true } }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;
