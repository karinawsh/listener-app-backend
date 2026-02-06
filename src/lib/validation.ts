import { z } from "zod";

// Auth validation schemas
export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthYear: z.string().regex(/^\d{4}$/, "Invalid birth year"),
  birthMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid birth month"),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
});

// Listener validation schemas
export const listenerOnboardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  experience: z.string().optional(),
  industry: z.string().optional(),
  pricePerHour: z.number().positive("Price per hour must be positive"),
  price30Min: z.number().positive("Price for 30 min must be positive"),
  price60Min: z.number().positive("Price for 60 min must be positive"),
  price120Min: z.number().positive("Price for 120 min must be positive"),
  tone: z.array(z.string()).optional(),
  relationalEnergy: z.array(z.string()).optional(),
  approach: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  bankDetails: z
    .object({
      accountName: z.string(),
      accountNumber: z.string(),
      routingNumber: z.string().optional(),
    })
    .optional(),
  availability: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
          })
        ),
      })
    )
    .optional(),
});

export const updateListenerProfileSchema = listenerOnboardSchema.partial();
