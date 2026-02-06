import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticateJWT);

// 1.4 Get User Profile
router.get("/me", getUserProfile);

// 1.5 Update User Profile
router.patch("/me", updateUserProfile);

export default router;
