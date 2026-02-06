import type { Response } from "express";
import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../lib/response.js";
import { updateProfileSchema } from "../lib/validation.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// 1.4 Get User Profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("UNAUTHORIZED", "User not authenticated"));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        displayName: true,
        bio: true,
        profileImage: true,
        birthYear: true,
        birthMonth: true,
        gender: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json(errorResponse("NOT_FOUND", "User not found"));
      return;
    }

    res.status(200).json(
      successResponse({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        profileImage: user.profileImage,
        birthYear: user.birthYear,
        birthMonth: user.birthMonth,
        gender: user.gender,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      })
    );
  } catch (error: any) {
    console.error("Get user profile error:", error);
    res.status(500).json(errorResponse("INTERNAL_ERROR", "Failed to get user profile"));
  }
};

// 1.5 Update User Profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("UNAUTHORIZED", "User not authenticated"));
      return;
    }

    // Validate request body
    const validatedData = updateProfileSchema.parse(req.body);

    // Filter out undefined values to satisfy Prisma's exactOptionalPropertyTypes
    const updateData: {
      displayName?: string;
      bio?: string;
      profileImage?: string;
    } = {};

    if (validatedData.displayName !== undefined) {
      updateData.displayName = validatedData.displayName;
    }
    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio;
    }
    if (validatedData.profileImage !== undefined) {
      updateData.profileImage = validatedData.profileImage;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        displayName: true,
        bio: true,
        profileImage: true,
      },
    });

    res.status(200).json(
      successResponse({
        userId: updatedUser.id,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json(
        errorResponse("VALIDATION_ERROR", "Invalid input", error.errors)
      );
    } else {
      console.error("Update user profile error:", error);
      res.status(500).json(errorResponse("INTERNAL_ERROR", "Failed to update user profile"));
    }
  }
};
