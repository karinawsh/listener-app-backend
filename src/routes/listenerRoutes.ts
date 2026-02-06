import { Router } from "express";
import {
  getAllListeners,
  getListenerDetails,
  getListenerReviews,
  becomeListener,
  updateListenerProfile,
} from "../controllers/listenerController.js";
import { authenticateJWT, requireListener } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
// 2.1 Get All Listeners (Browse)
router.get("/", getAllListeners);

// 2.2 Get Listener Details
router.get("/:listenerId", getListenerDetails);

// 2.3 Get Listener Reviews
router.get("/:listenerId/reviews", getListenerReviews);

// Protected routes (require authentication)
// 2.4 Become a Listener (Onboarding)
router.post("/onboard", authenticateJWT, becomeListener);

// 2.5 Update Listener Profile (requires listener role)
router.patch("/me", authenticateJWT, requireListener, updateListenerProfile);

export default router;
