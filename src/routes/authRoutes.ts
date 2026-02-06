import { Router } from "express";
import { signup, login, refreshToken } from "../controllers/authController.js";

const router = Router();

// 1.1 User Signup
router.post("/signup", signup);

// 1.2 User Login
router.post("/login", login);

// 1.3 Refresh Token
router.post("/refresh", refreshToken);

export default router;
