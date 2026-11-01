import User from "../models/user.model.js";
import { generateRandomNumber } from "../utils/math.js";
import { RegisterInput } from "../validators/auth.schema.js";

export const createUser = async function (data: RegisterInput) {
  const newUser = await User.create(data);
  const activationCode = generateRandomNumber(1000, 9999, true);
  const expirationDate = new Date(Date.now() + 10 * 60 * 1000);

  const updatedUser = await User.findByIdAndUpdate(newUser._id, {
    $set: {
      verificationCode: activationCode,
      verifyCodeExpiration: expirationDate,
    },
  });

  return { user: updatedUser, activationCode };
};
