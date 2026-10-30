import User from "../models/user.model.js";
import { RegisterInput } from "../validators/auth.schema.js";

export const createUser = async function (data: RegisterInput) {
  await User.create(data);
};
