import mongoose from "mongoose";
import { env } from "./env.config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URL);
    console.log("Connected to mongoDB");
  } catch (error) {
    console.log("Error connecting to mongoDB");
    throw error;
  }
};
