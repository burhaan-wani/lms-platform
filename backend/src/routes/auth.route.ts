import { Router } from "express";
import {
  getMyProfile,
  getNewAccessToken,
  login,
  logout,
  register,
  uploadAvatar,
  verifyAccount,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.get("/refresh-token", getNewAccessToken);
router.get("/me", getMyProfile);
router.get("/avatar", uploadAvatar);
router.post("/verify/:id", verifyAccount);

export default router;
