import { Router } from "express";
import {
  login,
  logout,
  register,
  verifyAccount,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.post("/verify/:id", verifyAccount);

export default router;
