import { Router } from "express";
import {
  getMyProfile,
  getNewAccessToken,
  login,
  logout,
  register,
  updatePassword,
  uploadAvatar,
  verifyAccount,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.config.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.get("/refresh-token", getNewAccessToken);
router.get("/me", isAuthenticated, getMyProfile);
router.post("/avatar", isAuthenticated, upload.single("avatar"), uploadAvatar);
router.post("/update-password", isAuthenticated, updatePassword);
router.post("/verify/:id", verifyAccount);

export default router;
