import { z } from "zod";

export const envSchema = z.object({
  PORT: z
    .string()
    .default("3002")
    .transform((val) => +val),
  NODE_ENV: z
    .string()
    .default("development")
    .pipe(z.enum(["development", "production"])),
  MONGO_URL: z.string(),
  REDIS_URL: z.string(),
  ORIGIN_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  MAILTRAP_HOST: z.string(),
  MAILTRAP_USER: z.string(),
  MAILTRAP_PASS: z.string(),
});
