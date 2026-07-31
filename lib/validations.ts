import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.enum([
    "TOOLS", "ELECTRONICS", "SPORTS", "BOOKS", "COOKWARE", "OUTDOORS",
    "FURNITURE", "TRAVEL", "PARTY", "FITNESS", "VEHICLES", "APPLIANCES", "OTHER"
  ]),
  description: z.string().optional(),
  marketPrice: z.number().positive("Market price must be positive").optional(),
  pricePerHour: z.number().positive("Price per hour must be positive").optional(),
  pricePerDay: z.number().positive("Price per day must be positive"),
  penaltyPerHour: z.number().nonnegative("Penalty cannot be negative").optional(),
  penaltyPerDay: z.number().nonnegative("Penalty cannot be negative").optional(),
  source: z.enum(["NEIGHBOUR", "ONLINE"]),
  platformName: z.string().optional(),
  distanceKm: z.number().optional(),
  imageUrl: z.string().optional(),
  imageUrls: z.string().optional(), // JSON string array
});

export const borrowRequestSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  estimatedCost: z.number().min(0, "Estimated cost cannot be negative"),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(["REQUESTED", "ACCEPTED", "PICKED_UP", "RETURNED", "DECLINED"]),
});

// Generic API Error Response shape
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
