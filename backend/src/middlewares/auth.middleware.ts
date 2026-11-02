import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { catchAsync } from "../utils/CatchAsync.js";
import { env } from "../config/env.config.js";
import { AppError } from "../utils/AppError.js";
import { redisClient } from "../config/redis.config.js";
import User from "../models/user.model.js";

export const isAuthenticated = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return next(
        new AppError("You are not logged in. Please login first.", 401),
      );
    }

    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN);
    if (!decoded) {
      return next(new AppError("Access token is invalid", 401));
    }
    const userDetails = await redisClient.get("user");
    const userId = JSON.parse(userDetails as string)._id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("The bearer of this token does not exist", 401));
    }
    req.user = { id: user._id, role: user.role };
    next();
  },
);

export const accessTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};
