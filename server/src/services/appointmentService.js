import { prisma } from "../config/prisma.js";
import { generatePreVisitSummary } from "./aiService.js";
import { addEmailJob } from "../queues/emailQueue.js";
import { sendSMS } from "./smsService.js";

const getPatientProfile = async (userId) => {
  const patient = await prisma.patientProfile.findUnique({
    where: {
      userId
    }
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  return patient;
};

const getDoctorProfile = async (userId) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId
    }
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

export const createAppointment = async (patientUserId, data) => {
  const {
    doctorId,
    startTime,
    endTime,
    symptoms
  } = data;

  // ------------------------------------------------------------
  // FIND DOCTOR
  // ------------------------------------------------------------

  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId: doctorId
    }
  });

  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  // ------------------------------------------------------------
  // FIND PATIENT
  // ------------------------------------------------------------

  const patient = await prisma.patientProfile.findUnique({
    where: {
      userId: patientUserId
    }
  });

  if (!patient) {
    const error = new Error("Patient profile not found");
    error.statusCode = 404;
    throw error;
  }

  // ------------------------------------------------------------
  // VALIDATE APPOINTMENT TIMES
  // ------------------------------------------------------------

  const appointmentStart = new Date(startTime);
  const appointmentEnd = new Date(endTime);

  if (Number.isNaN(appointmentStart.getTime())) {
    const error = new Error("Invalid appointment start time");
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(appointmentEnd.getTime())) {
    const error = new Error("Invalid appointment end time");
    error.statusCode = 400;
    throw error;
  }

  if (appointmentEnd <= appointmentStart) {
    const error = new Error(
      "Appointment end time must be after start time"
    );

    error.statusCode = 400;
    throw error;
  }

  // ------------------------------------------------------------
  // CHECK APPOINTMENT SLOT DURATION
  // ------------------------------------------------------------

  const appointmentDurationMinutes =
    (appointmentEnd.getTime() - appointmentStart.getTime()) /
    (1000 * 60);

  if (
    appointmentDurationMinutes !==
    doctor.slotDurationMinutes
  ) {
    const error = new Error(
      `Appointment duration must be ${doctor.slotDurationMinutes} minutes`
    );

    error.statusCode = 400;
    throw error;
  }

  // ------------------------------------------------------------
  // CHECK DOCTOR LEAVE
  // ------------------------------------------------------------

  const leaveDate = new Date(appointmentStart);

  leaveDate.setHours(0, 0, 0, 0);

  const doctorLeave = await prisma.leaveDay.findFirst({
    where: {
      doctorId: doctor.id,
      date: leaveDate
    }
  });

  if (doctorLeave) {
    const error = new Error(
      doctorLeave.reason
        ? `Doctor is on leave on this date: ${doctorLeave.reason}`
        : "Doctor is on leave on this date"
    );

    error.statusCode = 400;
    throw error;
  }

  // ------------------------------------------------------------
  // CHECK DOCTOR WORKING HOURS
  // ------------------------------------------------------------

  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
  ];

  const appointmentDay =
    dayNames[appointmentStart.getDay()];

  const workingHour =
    await prisma.workingHour.findFirst({
      where: {
        doctorId: doctor.id,
        day: appointmentDay
      }
    });

  if (!workingHour) {
    const error = new Error(
      `Doctor does not work on ${appointmentDay}`
    );

    error.statusCode = 400;
    throw error;
  }

  // ------------------------------------------------------------
  // CONVERT APPOINTMENT TIME TO HH:MM
  // ------------------------------------------------------------

  const appointmentStartMinutes =
  appointmentStart.getHours() * 60 +
  appointmentStart.getMinutes();

  const appointmentEndMinutes =
  appointmentEnd.getHours() * 60 +
  appointmentEnd.getMinutes();

  const [startHour, startMinute] =
    workingHour.startTime.split(":").map(Number);

  const [endHour, endMinute] =
    workingHour.endTime.split(":").map(Number);

  const workingStartMinutes =
    startHour * 60 + startMinute;

  const workingEndMinutes =
    endHour * 60 + endMinute;

  // ------------------------------------------------------------
  // CHECK APPOINTMENT IS INSIDE WORKING HOURS
  // ------------------------------------------------------------

  if (
    appointmentStartMinutes < workingStartMinutes ||
    appointmentEndMinutes > workingEndMinutes
  ) {
    const error = new Error(
      `Appointment must be within doctor's working hours (${workingHour.startTime} - ${workingHour.endTime})`
    );

    error.statusCode = 400;
    throw error;
  }

  // ------------------------------------------------------------
  // CHECK FOR APPOINTMENT OVERLAP
  // ------------------------------------------------------------

  const overlappingAppointment =
    await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,

        status: {
          in: ["HELD", "CONFIRMED"]
        },

        startTime: {
          lt: appointmentEnd
        },

        endTime: {
          gt: appointmentStart
        }
      }
    });

  if (overlappingAppointment) {
    const error = new Error(
      "This appointment slot is already booked"
    );

    error.statusCode = 409;
    throw error;
  }

  // ------------------------------------------------------------
  // GENERATE AI PRE-VISIT SUMMARY
  // ------------------------------------------------------------

  let preVisitSummary = null;
  let urgencyLevel = null;

  if (symptoms && symptoms.trim()) {
    const aiSummary =
      await generatePreVisitSummary(symptoms);

    if (aiSummary) {
      preVisitSummary = JSON.stringify(aiSummary);
      urgencyLevel = aiSummary.urgencyLevel;
    }
  }

  // ------------------------------------------------------------
  // SET APPOINTMENT HOLD EXPIRY
  // ------------------------------------------------------------

  const holdExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // ------------------------------------------------------------
  // CREATE APPOINTMENT
  // ------------------------------------------------------------

  const appointment =
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,

        startTime: appointmentStart,
        endTime: appointmentEnd,

        symptoms,

        // AI-generated information
        preVisitSummary,
        urgencyLevel,

        status: "HELD",
        holdExpiresAt
      }
    });

  return appointment;
};

// ============================================================
// PATIENT APPOINTMENTS
// ============================================================

// ============================================================
// PATIENT APPOINTMENTS
// ============================================================

export const getPatientAppointments = async (userId) => {
  console.log("=================================");
  console.log("PATIENT APPOINTMENTS REQUEST");
  console.log("AUTH USER ID:", userId);
  console.log("=================================");

  const patient = await prisma.patientProfile.findUnique({
    where: {
      userId
    }
  });

  console.log("PATIENT PROFILE:", patient);

  if (!patient) {
    const error = new Error("Patient profile not found");
    error.statusCode = 404;
    throw error;
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
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
    },
    orderBy: {
      startTime: "asc"
    }
  });

  console.log(
    "PATIENT ID USED FOR FILTER:",
    patient.id
  );

  console.log(
    "APPOINTMENTS RETURNED:",
    appointments.map((appointment) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      patientUserId: appointment.patient?.user?.id,
      patientEmail: appointment.patient?.user?.email,
      doctor:
        appointment.doctor?.user?.firstName +
        " " +
        appointment.doctor?.user?.lastName
    }))
  );

  return appointments;
};


// ============================================================
// DOCTOR APPOINTMENTS
// ============================================================

export const getDoctorAppointments = async (userId) => {
  if (!userId) {
    const error = new Error("Authenticated user ID is required");
    error.statusCode = 401;
    throw error;
  }

  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId
    }
  });

  if (!doctor) {
    const error = new Error("Doctor profile not found");
    error.statusCode = 404;
    throw error;
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      doctor: {
        userId
      }
    },

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

      visit: true
    },

    orderBy: {
      startTime: "asc"
    }
  });

  return appointments;
};

// ============================================================
// GET APPOINTMENT BY ID
// ============================================================

export const getAppointmentById = async (userId, appointmentId) => {
  const patient = await prisma.patientProfile.findUnique({
    where: {
      userId
    }
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId: patient.id
    },

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
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

// ============================================================
// CANCEL APPOINTMENT
// ============================================================

export const cancelAppointment = async (userId, appointmentId) => {
  const patient = await prisma.patientProfile.findUnique({
    where: {
      userId
    }
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId: patient.id
    },

    include: {
      patient: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
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
              email: true,
              phone: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // ------------------------------------------------------------
  // CHECK APPOINTMENT STATUS
  // ------------------------------------------------------------

  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "COMPLETED" ||
    appointment.status === "EXPIRED"
  ) {
    throw new Error(
      `Appointment cannot be cancelled because it is already ${appointment.status}`
    );
  }

  // ------------------------------------------------------------
  // CANCEL APPOINTMENT
  // ------------------------------------------------------------

  const cancelledAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId
    },

    data: {
      status: "CANCELLED",
      holdExpiresAt: null
    }
  });

  console.log("✅ Appointment cancelled:", appointmentId);

  // ------------------------------------------------------------
  // EMAIL PATIENT
  // ------------------------------------------------------------

  addEmailJob({
    to: appointment.patient.user.email,

    subject: "Appointment Cancelled",

    text: `
Hello ${appointment.patient.user.firstName},

Your appointment has been cancelled.

Doctor: Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}
Date: ${appointment.startTime.toLocaleDateString()}
Time: ${appointment.startTime.toLocaleTimeString()}

If you still need medical attention, please book another appointment.

Thank you,
Healthcare Appointment Manager
    `,

    html: `
      <h2>Appointment Cancelled</h2>

      <p>Hello ${appointment.patient.user.firstName},</p>

      <p>Your appointment has been cancelled.</p>

      <p>
        <strong>Doctor:</strong>
        Dr. ${appointment.doctor.user.firstName}
        ${appointment.doctor.user.lastName}
      </p>

      <p>
        <strong>Date:</strong>
        ${appointment.startTime.toLocaleDateString()}
      </p>

      <p>
        <strong>Time:</strong>
        ${appointment.startTime.toLocaleTimeString()}
      </p>

      <p>
        If you still need medical attention, please book another appointment.
      </p>

      <p>
        Thank you,<br/>
        Healthcare Appointment Manager
      </p>
    `
  }).catch((error) => {
    console.error("❌ Patient cancellation email failed:", error);
  });

  // ------------------------------------------------------------
  // EMAIL DOCTOR
  // ------------------------------------------------------------

  addEmailJob({
    to: appointment.doctor.user.email,

    subject: "Appointment Cancelled",

    text: `
Hello Dr. ${appointment.doctor.user.lastName},

An appointment has been cancelled.

Patient: ${appointment.patient.user.firstName} ${appointment.patient.user.lastName}
Date: ${appointment.startTime.toLocaleDateString()}
Time: ${appointment.startTime.toLocaleTimeString()}

The appointment slot is now available.

Healthcare Appointment Manager
    `,

    html: `
      <h2>Appointment Cancelled</h2>

      <p>
        Hello Dr. ${appointment.doctor.user.lastName},
      </p>

      <p>An appointment has been cancelled.</p>

      <p>
        <strong>Patient:</strong>
        ${appointment.patient.user.firstName}
        ${appointment.patient.user.lastName}
      </p>

      <p>
        <strong>Date:</strong>
        ${appointment.startTime.toLocaleDateString()}
      </p>

      <p>
        <strong>Time:</strong>
        ${appointment.startTime.toLocaleTimeString()}
      </p>

      <p>The appointment slot is now available.</p>

      <p>Healthcare Appointment Manager</p>
    `
  }).catch((error) => {
    console.error("❌ Doctor cancellation email failed:", error);
  });

  // ------------------------------------------------------------
  // SMS PATIENT
  // ------------------------------------------------------------

  if (appointment.patient.user.phone) {
    sendSMS(
      appointment.patient.user.phone,

      `Your appointment with Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} on ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()} has been cancelled.`
    ).catch((error) => {
      console.error("❌ Cancellation SMS failed:", error);
    });
  }

  // ------------------------------------------------------------
  // RETURN IMMEDIATELY
  // ------------------------------------------------------------

  return cancelledAppointment;
};
// ============================================================
// CONFIRM APPOINTMENT
// ============================================================

export const confirmAppointment = async (userId, appointmentId) => {
  const doctor = await getDoctorProfile(userId);

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: doctor.id
    },

    include: {
      patient: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
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
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status !== "HELD") {
    throw new Error(
      `Appointment cannot be confirmed because it is ${appointment.status}`
    );
  }

  if (
    appointment.holdExpiresAt &&
    appointment.holdExpiresAt <= new Date()
  ) {
    await prisma.appointment.update({
      where: {
        id: appointment.id
      },

      data: {
        status: "EXPIRED"
      }
    });

    throw new Error("Appointment hold has expired");
  }

  // ------------------------------------------------------------
  // CONFIRM APPOINTMENT
  // ------------------------------------------------------------

  const confirmedAppointment = await prisma.appointment.update({
    where: {
      id: appointment.id
    },

    data: {
      status: "CONFIRMED",
      holdExpiresAt: null
    }
  });

  console.log(
    `✅ Appointment ${appointment.id} confirmed successfully`
  );

  // ------------------------------------------------------------
  // NOTIFICATIONS
  // These are intentionally non-blocking.
  // A notification failure must NOT undo or delay confirmation.
  // ------------------------------------------------------------

  // SMS PATIENT
  if (appointment.patient.user.phone) {
    sendSMS(
      appointment.patient.user.phone,
      `Your appointment with Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} on ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()} has been confirmed.`
    ).catch((error) => {
      console.error(
        "❌ Appointment confirmation SMS failed:",
        error.message
      );
    });
  }

  // EMAIL PATIENT
  addEmailJob({
    to: appointment.patient.user.email,

    subject: "Appointment Confirmed",

    text: `
Hello ${appointment.patient.user.firstName},

Your appointment has been confirmed.

Doctor: Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}
Date: ${appointment.startTime.toLocaleDateString()}
Time: ${appointment.startTime.toLocaleTimeString()}

Your appointment is now confirmed.

Thank you,
Healthcare Appointment Manager
    `,

    html: `
      <h2>Appointment Confirmed</h2>

      <p>Hello ${appointment.patient.user.firstName},</p>

      <p>Your appointment has been confirmed.</p>

      <p>
        <strong>Doctor:</strong>
        Dr. ${appointment.doctor.user.firstName}
        ${appointment.doctor.user.lastName}
      </p>

      <p>
        <strong>Date:</strong>
        ${appointment.startTime.toLocaleDateString()}
      </p>

      <p>
        <strong>Time:</strong>
        ${appointment.startTime.toLocaleTimeString()}
      </p>

      <p>Your appointment is now confirmed.</p>

      <p>
        Thank you,<br/>
        Healthcare Appointment Manager
      </p>
    `
  }).catch((error) => {
    console.error(
      "❌ Patient confirmation email failed:",
      error.message
    );
  });

  // EMAIL DOCTOR
  addEmailJob({
    to: appointment.doctor.user.email,

    subject: "Appointment Confirmed",

    text: `
Hello Dr. ${appointment.doctor.user.lastName},

The following appointment has been confirmed.

Patient: ${appointment.patient.user.firstName} ${appointment.patient.user.lastName}
Date: ${appointment.startTime.toLocaleDateString()}
Time: ${appointment.startTime.toLocaleTimeString()}

Healthcare Appointment Manager
    `,

    html: `
      <h2>Appointment Confirmed</h2>

      <p>
        Hello Dr. ${appointment.doctor.user.lastName},
      </p>

      <p>The following appointment has been confirmed.</p>

      <p>
        <strong>Patient:</strong>
        ${appointment.patient.user.firstName}
        ${appointment.patient.user.lastName}
      </p>

      <p>
        <strong>Date:</strong>
        ${appointment.startTime.toLocaleDateString()}
      </p>

      <p>
        <strong>Time:</strong>
        ${appointment.startTime.toLocaleTimeString()}
      </p>

      <p>Healthcare Appointment Manager</p>
    `
  }).catch((error) => {
    console.error(
      "❌ Doctor confirmation email failed:",
      error.message
    );
  });

  // ------------------------------------------------------------
  // RETURN IMMEDIATELY AFTER DATABASE CONFIRMATION
  // ------------------------------------------------------------

  return confirmedAppointment;
};

// ============================================================
// COMPLETE APPOINTMENT
// ============================================================

export const completeAppointment = async (userId, appointmentId) => {
  const doctor = await getDoctorProfile(userId);

  const appointment = await prisma.appointment.findFirst({
  where: {
    id: appointmentId,
    doctorId: doctor.id
  },
  include: {
    patient: {
      include: {
        user: {
          select: {
            phone: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }
  }
});

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status !== "CONFIRMED") {
    throw new Error(
      `Appointment cannot be completed because it is ${appointment.status}`
    );
  }

  return prisma.appointment.update({
    where: {
      id: appointmentId
    },

    data: {
      status: "COMPLETED"
    }
  });
};