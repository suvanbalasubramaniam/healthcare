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

  if (
    value.includes("every 6 hours") ||
    value.includes("6 hourly")
  ) {
    next.setHours(next.getHours() + 6);
    return next;
  }

  if (
    value.includes("every 8 hours") ||
    value.includes("8 hourly")
  ) {
    next.setHours(next.getHours() + 8);
    return next;
  }

  if (
    value.includes("every 12 hours") ||
    value.includes("12 hourly")
  ) {
    next.setHours(next.getHours() + 12);
    return next;
  }

  // Default: once daily
  next.setDate(next.getDate() + 1);

  return next;
};


export const createMedicationReminder = async (prescriptionId) => {
  const prescription = await prisma.prescription.findUnique({
    where: {
      id: prescriptionId,
    },
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  const existingMedication = await prisma.medication.findFirst({
    where: {
      prescriptionId,
    },
  });

  if (existingMedication) {
    return existingMedication;
  }

  const nextReminderAt = calculateNextReminder(
    prescription.frequency
  );

  return prisma.medication.create({
    data: {
      prescriptionId,
      reminderStatus: "ACTIVE",
      nextReminderAt,
    },
  });
};


export const getMedicationReminders = async (userId) => {
  return prisma.medication.findMany({
    where: {
      prescription: {
        visit: {
          appointment: {
            patient: {
              userId,
            },
          },
        },
      },
    },

    include: {
      prescription: {
        include: {
          visit: {
            include: {
              appointment: true,
            },
          },
        },
      },
    },

    orderBy: {
      nextReminderAt: "asc",
    },
  });
};


export const pauseMedicationReminder = async (
  userId,
  medicationId
) => {
  const medication = await prisma.medication.findFirst({
    where: {
      id: medicationId,

      prescription: {
        visit: {
          appointment: {
            patient: {
              userId,
            },
          },
        },
      },
    },
  });

  if (!medication) {
    throw new Error("Medication reminder not found");
  }

  return prisma.medication.update({
    where: {
      id: medicationId,
    },

    data: {
      reminderStatus: "PAUSED",
    },
  });
};


export const resumeMedicationReminder = async (
  userId,
  medicationId
) => {
  const medication = await prisma.medication.findFirst({
    where: {
      id: medicationId,

      prescription: {
        visit: {
          appointment: {
            patient: {
              userId,
            },
          },
        },
      },
    },

    include: {
      prescription: true,
    },
  });

  if (!medication) {
    throw new Error("Medication reminder not found");
  }

  const nextReminderAt = calculateNextReminder(
    medication.prescription.frequency
  );

  return prisma.medication.update({
    where: {
      id: medicationId,
    },

    data: {
      reminderStatus: "ACTIVE",
      nextReminderAt,
    },
  });
};