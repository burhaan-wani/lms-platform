import { Types } from "mongoose";
import User, { IUser } from "../models/user.model.js";
import { createUser } from "../repository/auth.repository.js";
import { AppError } from "../utils/AppError.js";
import {
  ActivationCodeInput,
  LoginInput,
  RegisterInput,
} from "../validators/auth.schema.js";
import { sendEmail, verifyMailTemplate } from "../config/email.config.js";
import { generateRandomNumber } from "../utils/math.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { redisClient } from "../config/redis.config.js";
import { env } from "../config/env.config.js";

export const registerService = async (input: RegisterInput) => {
  try {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const data = await createUser(input);

    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyActivationCode = async (
  input: ActivationCodeInput,
  userId: Types.ObjectId,
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Account is already verified", 400);
    }

    const { activationCode } = input;
    const now = Date.now();
    const expirationTime = user.verifyCodeExpiration
      ? new Date(user.verifyCodeExpiration).getTime()
      : 0;

    if (expirationTime < now) {
      throw new AppError("Activation code has expired", 400);
    }
    if (user.verificationCode !== activationCode) {
      throw new AppError("Invalid activation code", 400);
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verifyCodeExpiration = null;

    await user.save();
  } catch (error) {
    throw error;
  }
};

export const loginService = async (
  input: LoginInput,
): Promise<{
  verification: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: Omit<IUser, "password"> | null;
}> => {
  try {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new AppError("No such email exists", 400);
    }

    const activationCode = generateRandomNumber(1000, 9999, true);
    const url = `${env.ORIGIN_URL}/verify/${user._id}`;
    if (user && !user.isVerified) {
      await sendEmail({
        to: input.email,
        subject: "Email Verification",
        html: verifyMailTemplate(activationCode, url),
      });
      return {
        verification: true,
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }

    if (!user || !(await user.comparePasswords(input.password))) {
      throw new AppError("email or password is incorrect", 401);
    }

    user.password = null;
    await redisClient.set("user", JSON.stringify(user));

    return {
      verification: false,
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user,
    };
  } catch (error) {
    throw error;
  }
};
