import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { successResponse, errorResponse } from "../lib/response.js";
import { signupSchema, loginSchema, refreshTokenSchema } from "../lib/validation.js";

// 1.1 User Signup
export const signup = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(409).json(errorResponse("CONFLICT", "Email already registered"));
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        passwordHash,
        birthYear: validatedData.birthYear,
        birthMonth: validatedData.birthMonth,
        gender: validatedData.gender,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json(
      successResponse({
        userId: user.id,
        email: user.email,
        accessToken,
        refreshToken,
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json(
        errorResponse("VALIDATION_ERROR", "Invalid input", error.errors)
      );
    } else {
      console.error("Signup error:", error);
      res.status(500).json(errorResponse("INTERNAL_ERROR", "Failed to create user"));
    }
  }
};

// 1.2 User Login
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        listenerProfile: true,
      },
    });

    if (!user) {
      res.status(401).json(errorResponse("UNAUTHORIZED", "Invalid email or password"));
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      res.status(401).json(errorResponse("UNAUTHORIZED", "Invalid email or password"));
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Check if profile is complete
    const profileComplete = !!(
      user.displayName &&
      user.bio &&
      user.profileImage
    );

    res.status(200).json(
      successResponse({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessToken,
        refreshToken,
        profileComplete,
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json(
        errorResponse("VALIDATION_ERROR", "Invalid input", error.errors)
      );
    } else {
      console.error("Login error:", error);
      res.status(500).json(errorResponse("INTERNAL_ERROR", "Failed to login"));
    }
  }
};

// 1.3 Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = verifyRefreshToken(validatedData.refreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    res.status(200).json(
      successResponse({
        accessToken,
        refreshToken: newRefreshToken,
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json(
        errorResponse("VALIDATION_ERROR", "Invalid input", error.errors)
      );
    } else if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      res.status(401).json(errorResponse("INVALID_TOKEN", "Invalid or expired refresh token"));
    } else {
      console.error("Refresh token error:", error);
      res.status(500).json(errorResponse("INTERNAL_ERROR", "Failed to refresh token"));
    }
  }
};
