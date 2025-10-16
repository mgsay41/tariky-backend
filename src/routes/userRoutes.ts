import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

// POST /api/users/create-or-update - Create or update user from Clerk
router.post("/create-or-update", UserController.createOrUpdateUser);

// GET /api/users/profile/:clerkId - Get user profile by Clerk ID
router.get("/profile/:clerkId", UserController.getProfile);

// PUT /api/users/complete-onboarding/:clerkId - Complete user onboarding
router.put("/complete-onboarding/:clerkId", UserController.completeOnboarding);

// GET /api/users/check-profile/:clerkId - Check if profile is complete
router.get("/check-profile/:clerkId", UserController.checkProfile);

export default router;
