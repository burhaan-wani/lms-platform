import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../config/env.config.js";

export const generateAccessToken = (userId: Types.ObjectId) => {
  return jwt.sign({ userId }, env.ACCESS_TOKEN, {
    expiresIn: 30 * 60 * 1000,
  });
};

export const generateRefreshToken = (userId: Types.ObjectId) => {
  return jwt.sign({ userId }, env.REFRESH_TOKEN, {
    expiresIn: 7 * 24 * 60 * 60 * 1000,
  });
};
