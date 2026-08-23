import cron from "node-cron";
import { prisma } from "../config/prisma.js";

const processMedicationReminders = async () => {
  try {
    const now = new Date();

    const medications = await prisma.medication.findMany({
      where: {
        reminderStatus: "ACTIVE",
        nextReminderAt: {
          lte: now,
        },
      },

      include: {
        prescription: {
          include: {
            visit: {
              include: {
                appointment: {
                  include: {
                    patient: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const medication of medications) {
      const prescription = medication.prescription;
      const appointment = prescription.visit.appointment;
      const patient = appointment.patient;
      const user = patient.user;

      console.log(
        `💊 Medication reminder for ${user.email}:`,
        prescription.medicationName
      );

      /*
       * For now we only process the reminder
       * and schedule the next one.
       *
       * Email sending will be connected
       * in the notification phase.
       */

      const nextReminderAt = calculateNextReminder(
        prescription.frequency,
        now
      );

      await prisma.medication.update({
        where: {
          id: medication.id,
        },

        data: {
          nextReminderAt,
        },
      });
    }
  } catch (error) {
    console.error(
      "❌ Medication reminder job failed:",
      error
    );
  }
};


const calculateNextReminder = (
  frequency,
  fromDate = new Date()
) => {
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


/*
 * Run every minute.
 */
export const startMedicationReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    await processMedicationReminders();
  });

  console.log(
    "💊 Medication reminder job started"
  );
};