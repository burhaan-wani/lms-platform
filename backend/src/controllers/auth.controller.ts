import type { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/CatchAsync.js";
import { AppError, ValidationError } from "../utils/AppError.js";
import {
  activationCodeSchema,
  loginSchema,
  registerSchema,
} from "../validators/auth.schema.js";
import {
  loginService,
  registerService,
  verifyActivationCode,
} from "../services/auth.service.js";
import { generateRandomNumber } from "../utils/math.js";
import { sendEmail, verifyMailTemplate } from "../config/email.config.js";
import { env } from "../config/env.config.js";
import { Types } from "mongoose";
import { setCookies } from "../utils/set-cookies.js";

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
