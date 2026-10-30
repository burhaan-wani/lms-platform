import { AppError } from "../utils/AppError.js";
import { envSchema } from "../validators/env.schema.js";

const parsedResult = envSchema.safeParse(process.env);
if (!parsedResult.success) {
  throw new AppError("Env variables not set properly", 400);
}

export const env = parsedResult.data;
