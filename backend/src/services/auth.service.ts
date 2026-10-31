import User from "../models/user.model.js";
import { createUser } from "../repository/auth.repository.js";
import { AppError } from "../utils/AppError.js";
import { RegisterInput } from "../validators/auth.schema.js";

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
