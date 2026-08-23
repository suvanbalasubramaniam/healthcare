import { z } from "zod";

export const createDoctorSchema = z.object({
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
    .optional(),

  specialization: z
    .string()
    .trim()
    .min(1, "Specialization is required")
    .max(100),

  licenseNumber: z
    .string()
    .trim()
    .max(100)
    .optional(),

  bio: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  slotDurationMinutes: z
    .number()
    .int()
    .min(10)
    .max(120)
    .default(30)
});

export const updateDoctorSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  phone: z
    .string()
    .trim()
    .optional(),

  specialization: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  licenseNumber: z
    .string()
    .trim()
    .max(100)
    .optional(),

  bio: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  slotDurationMinutes: z
    .number()
    .int()
    .min(10)
    .max(120)
    .optional(),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .optional()
});

export const doctorSearchSchema = z.object({
  specialization: z
    .string()
    .trim()
    .optional()
});

export const workingHoursSchema = z.object({
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
  ]),

  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Start time must use HH:mm format"
    ),

  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "End time must use HH:mm format"
    )
});


export const workingHoursUpdateSchema = z.object({
  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Start time must use HH:mm format"
    )
    .optional(),

  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "End time must use HH:mm format"
    )
    .optional()
});