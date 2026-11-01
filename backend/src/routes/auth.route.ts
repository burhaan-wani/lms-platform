import { Router } from "express";
import {
  login,
  register,
  verifyAccount,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify/:id", verifyAccount);

export default router;
