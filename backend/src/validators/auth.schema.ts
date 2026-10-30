import { z } from "zod";

export const registerSchema = z.strictObject({
  name: z.string().min(3),
  email: z.string().lowercase().pipe(z.email()),
  password: z.string().min(7),
});

export type RegisterInput = z.infer<typeof registerSchema>;
