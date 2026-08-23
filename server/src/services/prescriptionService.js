import { prisma } from "../config/prisma.js";

const calculateNextReminder = (frequency, fromDate = new Date()) => {
  const value = frequency.toLowerCase().trim();

  const next = new Date(fromDate);

  if (
    value.includes("twice daily") ||
    value.includes("2 times daily") ||
    value.includes("2x daily")
  ) {
    next.setHours(next.getHours() + 12);
    return next;
  }

  if (
    value.includes("three times daily") ||
    value.includes("3 times daily") ||
    value.includes("3x daily")
  ) {
    next.setHours(next.getHours() + 8);
    return next;
  }

  if (
    value.includes("four times daily") ||
    value.includes("4 times daily") ||
    value.includes("4x daily")
  ) {
    next.setHours(next.getHours() + 6);
    return next;
  }

  if (
    value.includes("once daily") ||
    value.includes("once a day") ||
    value.includes("daily")
  ) {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (value.includes("every 6 hours")) {
    next.setHours(next.getHours() + 6);
    return next;
  }

  if (value.includes("every 8 hours")) {
    next.setHours(next.getHours() + 8);
    return next;
  }

  if (value.includes("every 12 hours")) {
    next.setHours(next.getHours() + 12);
    return next;
  }

  next.setDate(next.getDate() + 1);

  return next;
};

const getDoctorProfile = async (userId) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

export const createPrescription = async (doctorUserId, data) => {
  const {
    visitId,
    medicationName,
    dosage,
    frequency,
    duration,
    instructions,
  } = data;

  if (!visitId) {
    throw new Error("Visit ID is required");
  }

  if (!medicationName?.trim()) {
    throw new Error("Medication name is required");
  }

  if (!dosage?.trim()) {
    throw new Error("Dosage is required");
  }

  if (!frequency?.trim()) {
    throw new Error("Frequency is required");
  }

  const doctor = await getDoctorProfile(doctorUserId);

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      appointment: true,
    },
  });

  if (!visit) {
    throw new Error("Visit not found");
  }

  if (visit.appointment.doctorId !== doctor.id) {
    throw new Error("You do not have permission to access this visit");
  }

  const prescription = await prisma.prescription.create({
    data: {
      visitId,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration?.trim() || null,
      instructions: instructions?.trim() || null,

      medications: {
  create: {
    reminderStatus: "ACTIVE",
    nextReminderAt: calculateNextReminder(frequency),
  },
},
    },

    include: {
      medications: true,
    },
  });

  return prescription;
};

export const getVisitPrescriptions = async (
  userId,
  role,
  visitId
) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      appointment: true,
    },
  });

  if (!visit) {
    throw new Error("Visit not found");
  }

  if (role === "DOCTOR") {
    const doctor = await getDoctorProfile(userId);

    if (visit.appointment.doctorId !== doctor.id) {
      throw new Error("Visit not found");
    }
  }

  if (role === "PATIENT") {
    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new Error("Patient profile not found");
    }

    if (visit.appointment.patientId !== patient.id) {
      throw new Error("Visit not found");
    }
  }

  return prisma.prescription.findMany({
    where: {
      visitId,
    },
    include: {
      medications: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};