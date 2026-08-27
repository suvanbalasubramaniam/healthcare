import { prisma } from "../config/prisma.js";
import { generatePostVisitSummary } from "./aiService.js";

const getDoctorProfile = async (userId) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId }
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

const getPatientProfile = async (userId) => {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId }
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  return patient;
};

export const createVisit = async (doctorUserId, data) => {
  const {
    appointmentId,
    clinicalNotes,
    diagnosis,
    patientSummary,
    followUpInstructions,
    prescriptions = []
  } = data;

  if (!appointmentId) {
    throw new Error("Appointment ID is required");
  }

  if (!clinicalNotes || !clinicalNotes.trim()) {
    throw new Error("Clinical notes are required");
  }

  const doctor = await getDoctorProfile(doctorUserId);

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId
    }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId !== doctor.id) {
    throw new Error(
      "You do not have permission to access this appointment"
    );
  }

  if (appointment.status !== "CONFIRMED") {
    throw new Error(
      "Visit can only be created for a CONFIRMED appointment"
    );
  }

  const existingVisit = await prisma.visit.findUnique({
    where: {
      appointmentId
    }
  });

  if (existingVisit) {
    throw new Error(
      "A visit already exists for this appointment"
    );
  }

  // Generate AI summary.
  // AI failure must not prevent the visit from being saved.
  let generatedSummary = null;

  try {
    const aiResult = await generatePostVisitSummary(
      clinicalNotes.trim()
    );

    if (aiResult) {
      generatedSummary = aiResult;
    }
  } catch (error) {
    console.error(
      "Post-visit AI summary failed:",
      error
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.create({
      data: {
        appointmentId,
        clinicalNotes: clinicalNotes.trim(),
        diagnosis: diagnosis || null,

        patientSummary:
  generatedSummary?.patientSummary ||
  patientSummary ||
  null,

medicationSchedule:
  generatedSummary?.medicationSchedule ||
  null,

followUpInstructions:
  generatedSummary?.followUpSteps ||
  followUpInstructions ||
  null,

        prescriptions: {
          create: prescriptions.map((prescription) => ({
            medicationName:
              prescription.medicationName.trim(),

            dosage:
              prescription.dosage.trim(),

            frequency:
              prescription.frequency.trim(),

            duration:
              prescription.duration?.trim() || null,

            instructions:
              prescription.instructions?.trim() || null
          }))
        }
      },

      include: {
        prescriptions: true,

        appointment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },

            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    await tx.appointment.update({
      where: {
        id: appointmentId
      },

      data: {
        status: "COMPLETED"
      }
    });

    return visit;
  });

  return result;
};

export const getDoctorVisits = async (doctorUserId) => {
  const doctor = await getDoctorProfile(doctorUserId);

  return prisma.visit.findMany({
    where: {
      appointment: {
        doctorId: doctor.id
      }
    },

    include: {
      appointment: {
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      },

      prescriptions: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getPatientVisits = async (patientUserId) => {
  const patient = await getPatientProfile(patientUserId);

  return prisma.visit.findMany({
    where: {
      appointment: {
        patientId: patient.id
      }
    },

    include: {
      appointment: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      },

      prescriptions: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getVisitById = async (
  userId,
  role,
  visitId
) => {
  const visit = await prisma.visit.findUnique({
    where: {
      id: visitId
    },

    include: {
      appointment: {
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },

          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      },

      prescriptions: true
    }
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
    const patient = await getPatientProfile(userId);

    if (visit.appointment.patientId !== patient.id) {
      throw new Error("Visit not found");
    }
  }

  return visit;
};