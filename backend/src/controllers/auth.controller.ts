import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { catchAsync } from "../utils/CatchAsync.js";
import { AppError, ValidationError } from "../utils/AppError.js";
import {
  activationCodeSchema,
  loginSchema,
  registerSchema,
  updatePasswordSchema,
} from "../validators/auth.schema.js";
import {
  loginService,
  registerService,
  verifyActivationCode,
} from "../services/auth.service.js";
import { sendEmail, verifyMailTemplate } from "../config/email.config.js";
import { env } from "../config/env.config.js";
import { Types } from "mongoose";
import { clearCookies, setCookies } from "../utils/set-cookies.js";
import { redisClient } from "../config/redis.config.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import User from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../utils/uploadToCloudinary.js";

// Register User
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = registerSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(new ValidationError(parsedResult.error));
    }
    const { email } = parsedResult.data;
    const { user, activationCode } = await registerService(parsedResult.data);

    const verificationUrl = `${env.ORIGIN_URL}/verify/${user?._id}`;
    await sendEmail({
      to: email,
      subject: "Email Verification",
      html: verifyMailTemplate(activationCode, verificationUrl),
    });

    res.status(201).json({
      status: "success",
      message: "A verification email has been sent to your email.",
    });
  },
);

// Verify Account
export const verifyAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = new Types.ObjectId(req.params.id as string);

    const parsedResult = activationCodeSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(new AppError("Invalid activation code", 400));
    }

    await verifyActivationCode(parsedResult.data, userId);

    res.status(200).json({
      status: "success",
      message: "Account verification successful",
    });
  },
);

// Login
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = loginSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(new ValidationError(parsedResult.error));
    }

    const { verification, accessToken, refreshToken } = await loginService(
      parsedResult.data,
    );
    if (verification) {
      res.status(200).json({
        status: "success",
        message:
          "A verification email has been sent to your email. Please verify before login.",
      });
      return;
    }

    setCookies(accessToken as string, refreshToken as string, res);

    res.status(200).json({
      status: "success",
      message: "login successful",
    });
  },
);

// Logout
export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    clearCookies(res);
    await redisClient.del("user");

    res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  },
);

// Generate new access and refresh token
export const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.trefreshToken;
    if (!token) {
      return next(new AppError("Refresh token not provided", 403));
    }
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN) as JwtPayload;
      if (!decoded) {
        return next(new AppError("Invalid refresh token", 403));
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.isVerified) {
        clearCookies(res);
        return next(
          new AppError(
            "User belonging to this token no longer exists or is unverified.",
            401,
          ),
        );
      }

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      setCookies(accessToken, refreshToken, res);
      res.status(200).json({
        status: "success",
        message: "Access token refreshed successfully",
      });
    } catch (error) {
      clearCookies(res);
      await redisClient.del("user");
      return next(error);
    }
  },
);

export const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.password = null;
    res.status(200).json({
      status: "success",
      user,
    });
  },
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = updatePasswordSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(new ValidationError(parsedResult.error));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.password = parsedResult.data.newPassword;
    await user.save();

    res.status(201).json({
      status: "success",
      message: "password update successful",
    });
  },
);

export const uploadAvatar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file?.buffer;
    if (!file) {
      return next(new AppError("Please upload an avatar", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    const response = await uploadBufferToCloudinary(file);

    user.avatar = {
      url: response.secure_url,
      public_id: response.public_id,
    };

    await user.save();

    const { password: _password, ...userObject } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "User avatar updated successfully",
      user: userObject,
    });
  },
);
