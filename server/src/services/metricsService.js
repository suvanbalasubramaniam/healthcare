import { prisma } from "../config/prisma.js";

export const getSystemMetrics = async () => {
  // ------------------------------------------------------------
  // BASIC COUNTS
  // ------------------------------------------------------------

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    totalVisits,
    totalPrescriptions,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
  ] = await Promise.all([
    prisma.patientProfile.count(),

    prisma.doctorProfile.count(),

    prisma.appointment.count(),

    prisma.visit.count(),

    prisma.prescription.count(),

    prisma.appointment.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.appointment.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.appointment.count({
      where: {
        status: "CANCELLED",
      },
    }),
  ]);

  // ------------------------------------------------------------
  // APPOINTMENT COMPLETION RATE
  // ------------------------------------------------------------

  const completionRate =
    totalAppointments > 0
      ? Number(
          (
            (completedAppointments / totalAppointments) *
            100
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // CONFIRMATION RATE
  // ------------------------------------------------------------

  const confirmationRate =
    totalAppointments > 0
      ? Number(
          (
            (confirmedAppointments / totalAppointments) *
            100
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // CANCELLATION RATE
  // ------------------------------------------------------------

  const cancellationRate =
    totalAppointments > 0
      ? Number(
          (
            (cancelledAppointments / totalAppointments) *
            100
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // AI PRE-VISIT METRICS
  // ------------------------------------------------------------

  const appointmentsWithSymptoms =
    await prisma.appointment.count({
      where: {
        symptoms: {
          not: null,
        },
      },
    });

  const appointmentsWithAISummary =
    await prisma.appointment.count({
      where: {
        preVisitSummary: {
          not: null,
        },
      },
    });

  const aiPreVisitCoverage =
    appointmentsWithSymptoms > 0
      ? Number(
          (
            (appointmentsWithAISummary /
              appointmentsWithSymptoms) *
            100
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // AI POST-VISIT METRICS
  // ------------------------------------------------------------

  const visitsWithAISummary =
    await prisma.visit.count({
      where: {
        patientSummary: {
          not: null,
        },
      },
    });

  const aiPostVisitCoverage =
    totalVisits > 0
      ? Number(
          (
            (visitsWithAISummary / totalVisits) *
            100
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // VISITS WITH PRESCRIPTIONS
  // ------------------------------------------------------------

  const visitsWithPrescriptions =
    await prisma.visit.count({
      where: {
        prescriptions: {
          some: {},
        },
      },
    });

  const prescriptionCoverage =
    totalVisits > 0
      ? Number(
          (
            (visitsWithPrescriptions / totalVisits) *
            100
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // AVERAGE PRESCRIPTIONS PER VISIT
  // ------------------------------------------------------------

  const averagePrescriptionsPerVisit =
    totalVisits > 0
      ? Number(
          (
            totalPrescriptions / totalVisits
          ).toFixed(2)
        )
      : 0;

  // ------------------------------------------------------------
  // RETURN METRICS
  // ------------------------------------------------------------

  return {
    users: {
      patients: totalPatients,
      doctors: totalDoctors,
    },

    appointments: {
      total: totalAppointments,
      confirmed: confirmedAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,

      confirmationRate,
      completionRate,
      cancellationRate,
    },

    consultations: {
      totalVisits,
      visitsWithPrescriptions,
      prescriptionCoverage,
      averagePrescriptionsPerVisit,
    },

    ai: {
      appointmentsWithSymptoms,
      appointmentsWithAISummary,
      preVisitCoverage: aiPreVisitCoverage,

      visitsWithAISummary,
      postVisitCoverage: aiPostVisitCoverage,
    },
  };
};