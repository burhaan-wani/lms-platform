import { z } from "zod";

export const registerSchema = z.strictObject({
  name: z.string().min(3),
  email: z.string().lowercase().pipe(z.email()),
  password: z.string().min(7),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const activationCodeSchema = z.strictObject({
  activationCode: z.string().transform((val) => Number(val)),
});

export type ActivationCodeInput = z.infer<typeof activationCodeSchema>;

export const loginSchema = z.strictObject({
  email: z.string().pipe(z.email().lowercase()),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
