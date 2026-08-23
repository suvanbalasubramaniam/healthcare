import { prisma } from "../config/prisma.js";
import { addEmailJob } from "../queues/emailQueue.js";
import { sendSMS } from "./smsService.js";

export const addLeave = async (userId, data) => {
  const { date, reason } = data;

  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId
    }
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const leaveDate = new Date(date);

  if (Number.isNaN(leaveDate.getTime())) {
    throw new Error("Invalid leave date");
  }

  leaveDate.setUTCHours(0, 0, 0, 0);

  // ------------------------------------------------------------
  // CHECK DUPLICATE LEAVE
  // ------------------------------------------------------------

  const existingLeave = await prisma.leaveDay.findFirst({
    where: {
      doctorId: doctor.id,
      date: leaveDate
    }
  });

  if (existingLeave) {
    throw new Error("Doctor already has leave on this date");
  }

  // ------------------------------------------------------------
  // FIND AFFECTED APPOINTMENTS
  // ------------------------------------------------------------

  const nextDay = new Date(leaveDate);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const affectedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,

      startTime: {
        gte: leaveDate,
        lt: nextDay
      },

      status: {
        in: ["HELD", "CONFIRMED"]
      }
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

  // ------------------------------------------------------------
  // CREATE LEAVE
  // ------------------------------------------------------------

  const leave = await prisma.leaveDay.create({
    data: {
      doctorId: doctor.id,
      date: leaveDate,
      reason: reason || null
    }
  });

  // ------------------------------------------------------------
  // CANCEL AFFECTED APPOINTMENTS
  // ------------------------------------------------------------

  for (const appointment of affectedAppointments) {
    await prisma.appointment.update({
      where: {
        id: appointment.id
      },

      data: {
        status: "CANCELLED",
        holdExpiresAt: null
      }
    });

    // ----------------------------------------------------------
    // PATIENT EMAIL
    // ----------------------------------------------------------

    await addEmailJob({
      to: appointment.patient.user.email,

      subject: "Appointment Cancelled - Doctor Leave",

      text: `
Hello ${appointment.patient.user.firstName},

Unfortunately, your appointment has been cancelled because
Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}
is unavailable on this date.

Date: ${appointment.startTime.toLocaleDateString()}
Time: ${appointment.startTime.toLocaleTimeString()}

Please book another appointment at your convenience.

Thank you,
Healthcare Appointment Manager
      `,

      html: `
        <h2>Appointment Cancelled</h2>

        <p>
          Hello ${appointment.patient.user.firstName},
        </p>

        <p>
          Unfortunately, your appointment has been cancelled because
          Dr. ${appointment.doctor.user.firstName}
          ${appointment.doctor.user.lastName}
          is unavailable on this date.
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
          Please book another appointment at your convenience.
        </p>

        <p>
          Thank you,<br/>
          Healthcare Appointment Manager
        </p>
      `
    });

    // ----------------------------------------------------------
    // PATIENT SMS
    // ----------------------------------------------------------

    if (appointment.patient.user.phone) {
      await sendSMS(
        appointment.patient.user.phone,
        `Your appointment with Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} on ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()} has been cancelled because the doctor is unavailable. Please book another appointment.`
      );
    }
  }

  return {
    leave,
    affectedAppointments: affectedAppointments.length
  };
};

export const getLeaves = async (userId) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId
    }
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return prisma.leaveDay.findMany({
    where: {
      doctorId: doctor.id
    },
    orderBy: {
      date: "asc"
    }
  });
};

export const deleteLeave = async (userId, leaveId) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId
    }
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const leave = await prisma.leaveDay.findFirst({
    where: {
      id: leaveId,
      doctorId: doctor.id
    }
  });

  if (!leave) {
    throw new Error("Leave record not found");
  }

  return prisma.leaveDay.delete({
    where: {
      id: leaveId
    }
  });
};