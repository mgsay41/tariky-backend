import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";

export class UserController {
  /**
   * POST /api/users/create-or-update
   * Create user after Clerk OAuth or update existing user
   */
  static async createOrUpdateUser(req: Request, res: Response) {
    try {
      const { clerkId, email, firstName, lastName, profilePhoto } = req.body;

      // Validate required fields
      if (!clerkId || !email) {
        return sendError(res, "clerkId and email are required", 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, "Invalid email format", 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (existingUser) {
        // Update existing user
        const updatedUser = await prisma.user.update({
          where: { clerkId },
          data: {
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            profilePhoto: profilePhoto || existingUser.profilePhoto,
            email: email || existingUser.email,
          },
        });

        return sendSuccess(
          res,
          { user: updatedUser, isNewUser: false },
          "User updated successfully",
          200
        );
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          profilePhoto: profilePhoto || null,
          isProfileComplete: false,
        },
      });

      return sendSuccess(
        res,
        { user: newUser, isNewUser: true },
        "User created successfully",
        201
      );
    } catch (error) {
      console.error("Error creating/updating user:", error);

      // Handle unique constraint errors
      if ((error as any).code === "P2002") {
        const target = (error as any).meta?.target;
        if (target?.includes("email")) {
          return sendError(res, "Email already exists", 409);
        }
        if (target?.includes("clerkId")) {
          return sendError(res, "Clerk ID already exists", 409);
        }
      }

      return sendError(res, "Failed to create/update user", 500);
    }
  }

  /**
   * GET /api/users/profile/:clerkId
   * Get user profile by Clerk ID
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const { clerkId } = req.params;

      if (!clerkId) {
        return sendError(res, "Clerk ID is required", 400);
      }

      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          clerkId: true,
          inceptumId: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          profilePhoto: true,
          age: true,
          bio: true,
          college: true,
          semester: true,
          university: true,
          isProfileComplete: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      return sendSuccess(res, { user }, "User profile retrieved successfully");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return sendError(res, "Failed to fetch user profile", 500);
    }
  }

  /**
   * PUT /api/users/complete-onboarding/:clerkId
   * Complete user onboarding with additional info
   */
  static async completeOnboarding(req: Request, res: Response) {
    try {
      const { clerkId } = req.params;
      const { phoneNumber, college, semester, university } = req.body;

      // Validate required fields
      if (!clerkId) {
        return sendError(res, "Clerk ID is required", 400);
      }

      if (!phoneNumber || !college || !semester || !university) {
        return sendError(
          res,
          "Phone number, college, semester, and university are required",
          400
        );
      }

      // Validate phone number format (Ethiopian: +251XXXXXXXXX)
      const phoneRegex = /^\+251[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return sendError(
          res,
          "Invalid Ethiopian phone number format. Expected: +251XXXXXXXXX",
          400
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!existingUser) {
        return sendError(res, "User not found", 404);
      }

      // Check if phone number is already taken by another user
      const phoneExists = await prisma.user.findFirst({
        where: {
          phoneNumber,
          NOT: {
            clerkId,
          },
        },
      });

      if (phoneExists) {
        return sendError(res, "Phone number already in use", 409);
      }

      // Update user with onboarding data
      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          phoneNumber,
          college,
          semester,
          university,
          isProfileComplete: true,
        },
      });

      return sendSuccess(
        res,
        { user: updatedUser },
        "Onboarding completed successfully",
        200
      );
    } catch (error) {
      console.error("Error completing onboarding:", error);

      // Handle unique constraint error for phone number
      if ((error as any).code === "P2002") {
        const target = (error as any).meta?.target;
        if (target?.includes("phoneNumber")) {
          return sendError(res, "Phone number already in use", 409);
        }
      }

      return sendError(res, "Failed to complete onboarding", 500);
    }
  }

  /**
   * GET /api/users/check-profile/:clerkId
   * Check if user has completed onboarding
   */
  static async checkProfile(req: Request, res: Response) {
    try {
      const { clerkId } = req.params;

      if (!clerkId) {
        return sendError(res, "Clerk ID is required", 400);
      }

      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          email: true,
          isProfileComplete: true,
          phoneNumber: true,
          college: true,
          semester: true,
          university: true,
        },
      });

      if (!user) {
        return sendSuccess(
          res,
          { isComplete: false, user: null },
          "User not found",
          200
        );
      }

      return sendSuccess(
        res,
        { isComplete: user.isProfileComplete, user },
        "Profile status checked successfully",
        200
      );
    } catch (error) {
      console.error("Error checking profile:", error);
      return sendError(res, "Failed to check profile status", 500);
    }
  }
}
