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

  // doctorId coming from frontend = User.id

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

  // Find patient profile
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

  // Then create appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      symptoms
    }
  });

  return appointment;
};

// ============================================================
// PATIENT APPOINTMENTS
// ============================================================

export const getPatientAppointments = async (userId) => {
  const patient = await getPatientProfile(userId);

  return prisma.appointment.findMany({
    where: {
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
    },

    orderBy: {
      startTime: "asc"
    }
  });
};

// ============================================================
// DOCTOR APPOINTMENTS
// ============================================================

export const getDoctorAppointments = async (userId) => {
  const doctor = await getDoctorProfile(userId);

  return prisma.appointment.findMany({
    where: {
      doctorId: doctor.id
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

  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "COMPLETED" ||
    appointment.status === "EXPIRED"
  ) {
    throw new Error(
      `Appointment cannot be cancelled because it is already ${appointment.status}`
    );
  }

  const cancelledAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId
    },
    data: {
      status: "CANCELLED",
      holdExpiresAt: null
    }
  });

  // Email patient
  await addEmailJob({
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
  });

  // Email doctor
  await addEmailJob({
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
  });

  // Send SMS to patient
if (appointment.patient.user.phone) {
  await sendSMS(
    appointment.patient.user.phone,
    `Your appointment with Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} on ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()} has been cancelled.`
  );
}

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

  // ------------------------------------------------------------
  // SMS PATIENT
  // ------------------------------------------------------------

  console.log("📞 PATIENT PHONE:", appointment.patient.user.phone);
console.log("📱 REACHING SMS SECTION");

if (appointment.patient.user.phone) {
  await sendSMS(
    appointment.patient.user.phone,
    `Your appointment with Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} on ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()} has been confirmed.`
  );
}

  // ------------------------------------------------------------
  // CONFIRMATION EMAIL TO PATIENT
  // ------------------------------------------------------------

  await addEmailJob({
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
  });

  // ------------------------------------------------------------
  // CONFIRMATION EMAIL TO DOCTOR
  // ------------------------------------------------------------

  await addEmailJob({
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
  });

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