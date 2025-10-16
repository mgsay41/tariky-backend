"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// POST /api/users/create-or-update - Create or update user from Clerk
router.post("/create-or-update", userController_1.UserController.createOrUpdateUser);
// GET /api/users/profile/:clerkId - Get user profile by Clerk ID
router.get("/profile/:clerkId", userController_1.UserController.getProfile);
// PUT /api/users/complete-onboarding/:clerkId - Complete user onboarding
router.put("/complete-onboarding/:clerkId", userController_1.UserController.completeOnboarding);
// GET /api/users/check-profile/:clerkId - Check if profile is complete
router.get("/check-profile/:clerkId", userController_1.UserController.checkProfile);
exports.default = router;
