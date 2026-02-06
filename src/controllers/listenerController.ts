import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/index.js";
import { successResponse, errorResponse } from "../lib/response.js";
import {
  listenerOnboardSchema,
  updateListenerProfileSchema,
} from "../lib/validation.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// Helper function to map day names to enum values
const dayNameToEnum: Record<string, string> = {
  monday: "MONDAY",
  tuesday: "TUESDAY",
  wednesday: "WEDNESDAY",
  thursday: "THURSDAY",
  friday: "FRIDAY",
  saturday: "SATURDAY",
  sunday: "SUNDAY",
};

// 2.1 Get All Listeners (Browse)
export const getAllListeners = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      tone,
      relationalEnergy,
      approach,
      verifiedOnly,
      minRating,
      availability,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { title: { contains: search as string, mode: "insensitive" } },
        { bio: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (verifiedOnly === "true") {
      where.verified = true;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    if (availability) {
      where.availability = (availability as string).toUpperCase();
    }

    if (minPrice || maxPrice) {
      where.pricePerHour = {};
      if (minPrice) where.pricePerHour.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerHour.lte = parseFloat(maxPrice as string);
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            name: { equals: category as string, mode: "insensitive" },
          },
        },
      };
    }

    // Get listeners
    const [listeners, total] = await Promise.all([
      prisma.listenerProfile.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          attributes: true,
        },
        orderBy: {
          rating: "desc",
        },
      }),
      prisma.listenerProfile.count({ where }),
    ]);

    // Format response
    const formattedListeners = listeners.map((listener) => ({
      id: listener.id,
      name: listener.name,
      title: listener.title,
      bio: listener.bio,
      categories: listener.categories.map((c) => c.category.name),
      rating: listener.rating,
      reviewCount: listener.reviewCount,
      pricePerHour: parseFloat(listener.pricePerHour.toString()),
      availability: listener.availability.toLowerCase(),
      image: listener.image,
      verified: listener.verified,
      experience: listener.experience,
      industry: listener.industry,
      tone: listener.attributes
        .filter((a) => a.type === "TONE")
        .map((a) => a.value),
      relationalEnergy: listener.attributes
        .filter((a) => a.type === "RELATIONAL_ENERGY")
        .map((a) => a.value),
      approach: listener.attributes
        .filter((a) => a.type === "APPROACH")
        .map((a) => a.value),
    }));

    res.status(200).json(
      successResponse({
        listeners: formattedListeners,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      })
    );
  } catch (error: any) {
    console.error("Get all listeners error:", error);
    res
      .status(500)
      .json(errorResponse("INTERNAL_ERROR", "Failed to get listeners"));
  }
};

// 2.2 Get Listener Details
export const getListenerDetails = async (req: Request, res: Response) => {
  try {
    const { listenerId } = req.params as { listenerId: string };

    // Define the query args with proper typing
    const listenerWithRelationsArgs = Prisma.validator<Prisma.ListenerProfileDefaultArgs>()({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        attributes: true,
        availabilitySlots: true,
      },
    });

    type ListenerWithRelations = Prisma.ListenerProfileGetPayload<typeof listenerWithRelationsArgs>;

    const listener = await prisma.listenerProfile.findUnique({
      where: { id: listenerId },
      ...listenerWithRelationsArgs,
    }) as ListenerWithRelations | null;

    if (!listener) {
      res.status(404).json(errorResponse("NOT_FOUND", "Listener not found"));
      return;
    }



    // Format availability schedule
    const availabilitySchedule: any = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      const daySlots = listener.availabilitySlots.filter(
        (slot) => slot.dayOfWeek === dayNameToEnum[day]
      );

      availabilitySchedule[day] = {
        enabled: daySlots.some((slot) => slot.enabled),
        slots: daySlots.map((slot) => ({
          start: slot.startTime,
          end: slot.endTime,
        })),
      };
    });

    res.status(200).json(
      successResponse({
        id: listener.id,
        name: listener.name,
        title: listener.title,
        bio: listener.bio,
        categories: listener.categories.map((c) => c.category.name),
        rating: listener.rating,
        reviewCount: listener.reviewCount,
        pricePerHour: parseFloat(listener.pricePerHour.toString()),
        price30Min: parseFloat(listener.price30Min.toString()),
        price60Min: parseFloat(listener.price60Min.toString()),
        price120Min: parseFloat(listener.price120Min.toString()),
        availability: listener.availability.toLowerCase(),
        image: listener.image,
        verified: listener.verified,
        experience: listener.experience,
        industry: listener.industry,
        tone: listener.attributes
          .filter((a) => a.type === "TONE")
          .map((a) => a.value),
        relationalEnergy: listener.attributes
          .filter((a) => a.type === "RELATIONAL_ENERGY")
          .map((a) => a.value),
        approach: listener.attributes
          .filter((a) => a.type === "APPROACH")
          .map((a) => a.value),
        portfolioUrl: listener.portfolioUrl,
        availabilitySchedule,
      })
    );
  } catch (error: any) {
    console.error("Get listener details error:", error);
    res
      .status(500)
      .json(errorResponse("INTERNAL_ERROR", "Failed to get listener details"));
  }
};

// 2.3 Get Listener Reviews
export const getListenerReviews = async (req: Request, res: Response) => {
  try {
    const { listenerId } = req.params as { listenerId: string };
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Define the query args with proper typing
    const reviewWithUserArgs = Prisma.validator<Prisma.ReviewDefaultArgs>()({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    type ReviewWithUser = Prisma.ReviewGetPayload<typeof reviewWithUserArgs>;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listenerId },
        skip,
        take: limitNum,
        ...reviewWithUserArgs,
        orderBy: {
          createdAt: "desc",
        },
      }) as Promise<ReviewWithUser[]>,
      prisma.review.count({ where: { listenerId } }),
    ]);

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString(),
    }));

    res.status(200).json(
      successResponse({
        reviews: formattedReviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
        },
      })
    );
  } catch (error: any) {
    console.error("Get listener reviews error:", error);
    res
      .status(500)
      .json(errorResponse("INTERNAL_ERROR", "Failed to get listener reviews"));
  }
};

// 2.4 Become a Listener (Onboarding)
export const becomeListener = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("UNAUTHORIZED", "User not authenticated"));
      return;
    }

    // Validate request body
    const validatedData = listenerOnboardSchema.parse(req.body);

    // Check if user already has a listener profile
    const existingProfile = await prisma.listenerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingProfile) {
      res
        .status(409)
        .json(
          errorResponse("CONFLICT", "User already has a listener profile")
        );
      return;
    }

    // Create listener profile in a transaction
    const listenerProfile = await prisma.$transaction(async (tx) => {
      // Create listener profile
      const profile = await tx.listenerProfile.create({
        data: {
          userId: req.user!.userId,
          name: validatedData.name,
          title: validatedData.title,
          bio: validatedData.bio,
          pricePerHour: validatedData.pricePerHour,
          price30Min: validatedData.price30Min,
          price60Min: validatedData.price60Min,
          price120Min: validatedData.price120Min,
          ...(validatedData.experience !== undefined && { experience: validatedData.experience }),
          ...(validatedData.industry !== undefined && { industry: validatedData.industry }),
          ...(validatedData.portfolioUrl !== undefined && { portfolioUrl: validatedData.portfolioUrl }),
          ...(validatedData.bankDetails !== undefined && { bankDetails: validatedData.bankDetails as any }),
        },
      });

      // Add categories
      if (validatedData.categories && validatedData.categories.length > 0) {
        for (const categoryName of validatedData.categories) {
          // Find or create category
          let category = await tx.category.findUnique({
            where: { name: categoryName },
          });

          if (!category) {
            category = await tx.category.create({
              data: { name: categoryName },
            });
          }

          // Link listener to category
          await tx.listenerCategory.create({
            data: {
              listenerId: profile.id,
              categoryId: category.id,
            },
          });
        }
      }

      // Add attributes
      const attributes: Array<{ type: string; value: string }> = [];

      if (validatedData.tone) {
        validatedData.tone.forEach((value) => {
          attributes.push({ type: "TONE", value });
        });
      }

      if (validatedData.relationalEnergy) {
        validatedData.relationalEnergy.forEach((value) => {
          attributes.push({ type: "RELATIONAL_ENERGY", value });
        });
      }

      if (validatedData.approach) {
        validatedData.approach.forEach((value) => {
          attributes.push({ type: "APPROACH", value });
        });
      }

      if (attributes.length > 0) {
        await tx.listenerAttribute.createMany({
          data: attributes.map((attr) => ({
            listenerId: profile.id,
            type: attr.type as any,
            value: attr.value,
          })),
        });
      }

      // Add availability slots
      if (validatedData.availability) {
        const slots: Array<{
          listenerId: string;
          dayOfWeek: string;
          startTime: string;
          endTime: string;
          enabled: boolean;
        }> = [];

        Object.entries(validatedData.availability).forEach(([day, config]: [string, any]) => {
          const dayEnum = dayNameToEnum[day.toLowerCase()];
          if (dayEnum && config.slots) {
            config.slots.forEach((slot: any) => {
              slots.push({
                listenerId: profile.id,
                dayOfWeek: dayEnum,
                startTime: slot.start,
                endTime: slot.end,
                enabled: config.enabled,
              });
            });
          }
        });

        if (slots.length > 0) {
          await tx.availabilitySlot.createMany({
            data: slots as any,
          });
        }
      }

      // Update user role to LISTENER
      await tx.user.update({
        where: { id: req.user!.userId },
        data: { role: "LISTENER" },
      });

      return profile;
    });

    res.status(201).json(
      successResponse({
        listenerId: listenerProfile.id,
        status: "pending_verification",
        message: "Your listener profile has been submitted for verification",
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      res
        .status(400)
        .json(errorResponse("VALIDATION_ERROR", "Invalid input", error.errors));
    } else {
      console.error("Become listener error:", error);
      res
        .status(500)
        .json(
          errorResponse("INTERNAL_ERROR", "Failed to create listener profile")
        );
    }
  }
};

// 2.5 Update Listener Profile
export const updateListenerProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("UNAUTHORIZED", "User not authenticated"));
      return;
    }

    // Validate request body
    const validatedData = updateListenerProfileSchema.parse(req.body);

    // Get listener profile
    const listenerProfile = await prisma.listenerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!listenerProfile) {
      res
        .status(404)
        .json(errorResponse("NOT_FOUND", "Listener profile not found"));
      return;
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update basic profile info
      const updateData: any = {};
      if (validatedData.name) updateData.name = validatedData.name;
      if (validatedData.title) updateData.title = validatedData.title;
      if (validatedData.bio) updateData.bio = validatedData.bio;
      if (validatedData.pricePerHour)
        updateData.pricePerHour = validatedData.pricePerHour;
      if (validatedData.price30Min)
        updateData.price30Min = validatedData.price30Min;
      if (validatedData.price60Min)
        updateData.price60Min = validatedData.price60Min;
      if (validatedData.price120Min)
        updateData.price120Min = validatedData.price120Min;
      if (validatedData.experience)
        updateData.experience = validatedData.experience;
      if (validatedData.industry) updateData.industry = validatedData.industry;
      if (validatedData.portfolioUrl)
        updateData.portfolioUrl = validatedData.portfolioUrl;
      if (validatedData.bankDetails)
        updateData.bankDetails = validatedData.bankDetails;

      if (Object.keys(updateData).length > 0) {
        await tx.listenerProfile.update({
          where: { id: listenerProfile.id },
          data: updateData,
        });
      }

      // Update categories if provided
      if (validatedData.categories) {
        // Remove existing categories
        await tx.listenerCategory.deleteMany({
          where: { listenerId: listenerProfile.id },
        });

        // Add new categories
        for (const categoryName of validatedData.categories) {
          let category = await tx.category.findUnique({
            where: { name: categoryName },
          });

          if (!category) {
            category = await tx.category.create({
              data: { name: categoryName },
            });
          }

          await tx.listenerCategory.create({
            data: {
              listenerId: listenerProfile.id,
              categoryId: category.id,
            },
          });
        }
      }

      // Update attributes if provided
      if (
        validatedData.tone ||
        validatedData.relationalEnergy ||
        validatedData.approach
      ) {
        // Remove existing attributes
        await tx.listenerAttribute.deleteMany({
          where: { listenerId: listenerProfile.id },
        });

        // Add new attributes
        const attributes: Array<{ type: string; value: string }> = [];

        if (validatedData.tone) {
          validatedData.tone.forEach((value) => {
            attributes.push({ type: "TONE", value });
          });
        }

        if (validatedData.relationalEnergy) {
          validatedData.relationalEnergy.forEach((value) => {
            attributes.push({ type: "RELATIONAL_ENERGY", value });
          });
        }

        if (validatedData.approach) {
          validatedData.approach.forEach((value) => {
            attributes.push({ type: "APPROACH", value });
          });
        }

        if (attributes.length > 0) {
          await tx.listenerAttribute.createMany({
            data: attributes.map((attr) => ({
              listenerId: listenerProfile.id,
              type: attr.type as any,
              value: attr.value,
            })),
          });
        }
      }

      // Update availability if provided
      if (validatedData.availability) {
        // Remove existing slots
        await tx.availabilitySlot.deleteMany({
          where: { listenerId: listenerProfile.id },
        });

        // Add new slots
        const slots: Array<{
          listenerId: string;
          dayOfWeek: string;
          startTime: string;
          endTime: string;
          enabled: boolean;
        }> = [];

        Object.entries(validatedData.availability).forEach(([day, config]: [string, any]) => {
          const dayEnum = dayNameToEnum[day.toLowerCase()];
          if (dayEnum && config.slots) {
            config.slots.forEach((slot: any) => {
              slots.push({
                listenerId: listenerProfile.id,
                dayOfWeek: dayEnum,
                startTime: slot.start,
                endTime: slot.end,
                enabled: config.enabled,
              });
            });
          }
        });

        if (slots.length > 0) {
          await tx.availabilitySlot.createMany({
            data: slots as any,
          });
        }
      }
    });

    res.status(200).json(
      successResponse({
        listenerId: listenerProfile.id,
        message: "Profile updated successfully",
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      res
        .status(400)
        .json(errorResponse("VALIDATION_ERROR", "Invalid input", error.errors));
    } else {
      console.error("Update listener profile error:", error);
      res
        .status(500)
        .json(
          errorResponse("INTERNAL_ERROR", "Failed to update listener profile")
        );
    }
  }
};
