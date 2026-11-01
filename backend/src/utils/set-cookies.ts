import type { CookieOptions, Response } from "express";
import { env } from "../config/env.config.js";

const options: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

export const setCookies = (
  accessToken: string,
  refreshToken: string,
  res: Response,
) => {
  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: 30 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: 7 * 24 * 3600 * 1000,
  });
};
