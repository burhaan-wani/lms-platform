import type { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/CatchAsync.js";
import { ValidationError } from "../utils/AppError.js";
import { registerSchema } from "../validators/auth.schema.js";
import { registerService } from "../services/auth.service.js";
import { generateRandomNumber } from "../utils/math.js";
import { sendEmail, verifyMailTemplate } from "../config/email.config.js";
import { env } from "../config/env.config.js";

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
