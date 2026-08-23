import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50),

  phone: z
    .string()
    .trim()
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required")
});