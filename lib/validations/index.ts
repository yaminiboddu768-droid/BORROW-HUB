import { z } from 'zod';

export const UserRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'BUSINESS', 'ADMIN']).optional().default('USER'),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ItemCreateSchema = z.object({
  name: z.string().min(3, 'Item title must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  pricePerDay: z.number().positive('Price per day must be greater than 0'),
  pricePerHour: z.number().positive().optional(),
  penaltyPerDay: z.number().nonnegative().optional(),
  penaltyPerHour: z.number().nonnegative().optional(),
  marketPrice: z.number().positive().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  source: z.enum(['NEIGHBOUR', 'ONLINE']).optional().default('NEIGHBOUR'),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  condition: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
});

export const BorrowRequestSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedCost: z.number().nonnegative().optional(),
});

export const PartnerRegistrationSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  address: z.string().min(5, 'Address is required'),
  gstNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  upiId: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export const AdminActionSchema = z.object({
  partnerId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['APPROVED', 'REJECTED', 'BLOCKED', 'PENDING']),
  reason: z.string().optional(),
});
