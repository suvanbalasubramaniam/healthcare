import bcrypt from "bcryptjs";

import { prisma } from "../config/prisma.js";

const getDoctorProfile = async (userId) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

export const getDoctorAppointments = async (userId) => {
  const doctor = await getDoctorProfile(userId);

  return prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
    },

    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },

      visit: {
        include: {
          prescriptions: {
            include: {
              medications: true,
            },
          },
        },
      },
    },

    orderBy: {
      startTime: "asc",
    },
  });
};



export const createDoctor = async ({
  email,
  password,
  firstName,
  lastName,
  phone,
  specialization,
  licenseNumber,
  bio,
  slotDurationMinutes
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  if (licenseNumber) {
    const existingLicense = await prisma.doctorProfile.findUnique({
      where: { licenseNumber }
    });

    if (existingLicense) {
      const error = new Error(
        "A doctor with this license number already exists"
      );

      error.statusCode = 409;
      throw error;
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const doctor = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: "DOCTOR",

      doctorProfile: {
        create: {
          specialization,
          licenseNumber,
          bio,
          slotDurationMinutes
        }
      }
    },

    include: {
      doctorProfile: true
    }
  });

  return sanitizeDoctor(doctor);
};


export const getDoctors = async ({ specialization } = {}) => {
  const doctors = await prisma.user.findMany({
    where: {
      role: "DOCTOR",
      status: "ACTIVE",

      doctorProfile: specialization
        ? {
            specialization: {
              contains: specialization,
              mode: "insensitive"
            }
          }
        : {
            isNot: null
          }
    },

    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,

      doctorProfile: {
        include: {
          workingHours: true
        }
      }
    },

    orderBy: {
      firstName: "asc"
    }
  });

  return doctors;
};


export const getDoctorById = async (doctorId) => {
  const doctor = await prisma.user.findFirst({
    where: {
      id: doctorId,
      role: "DOCTOR"
    },

    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,

      doctorProfile: {
        include: {
          workingHours: true,
          leaveDays: {
            orderBy: {
              date: "asc"
            }
          }
        }
      }
    }
  });

  if (!doctor || !doctor.doctorProfile) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  return doctor;
};


export const updateDoctor = async (doctorId, data) => {
  const existingDoctor = await prisma.user.findFirst({
    where: {
      id: doctorId,
      role: "DOCTOR"
    },

    include: {
      doctorProfile: true
    }
  });

  if (!existingDoctor || !existingDoctor.doctorProfile) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.licenseNumber) {
    const existingLicense = await prisma.doctorProfile.findFirst({
      where: {
        licenseNumber: data.licenseNumber,
        NOT: {
          id: existingDoctor.doctorProfile.id
        }
      }
    });

    if (existingLicense) {
      const error = new Error(
        "A doctor with this license number already exists"
      );

      error.statusCode = 409;
      throw error;
    }
  }

  const {
    firstName,
    lastName,
    phone,
    status,
    specialization,
    licenseNumber,
    bio,
    slotDurationMinutes
  } = data;

  const updatedDoctor = await prisma.user.update({
    where: {
      id: doctorId
    },

    data: {
      firstName,
      lastName,
      phone,
      status,

      doctorProfile: {
        update: {
          specialization,
          licenseNumber,
          bio,
          slotDurationMinutes
        }
      }
    },

    include: {
      doctorProfile: true
    }
  });

  return sanitizeDoctor(updatedDoctor);
};


const sanitizeDoctor = (doctor) => {
  return {
    id: doctor.id,
    email: doctor.email,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    phone: doctor.phone,
    status: doctor.status,
    doctorProfile: doctor.doctorProfile
  };
};

export const getWorkingHours = async (doctorId) => {
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

  return prisma.workingHour.findMany({
    where: {
      doctorId: doctor.id
    },
    orderBy: {
      day: "asc"
    }
  });
};


export const setWorkingHours = async (
  doctorId,
  { day, startTime, endTime }
) => {
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

  if (startTime >= endTime) {
    const error = new Error(
      "Start time must be earlier than end time"
    );

    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.workingHour.findFirst({
    where: {
      doctorId: doctor.id,
      day
    }
  });

  if (existing) {
    const error = new Error(
      "Working hours already exist for this day"
    );

    error.statusCode = 409;
    throw error;
  }

  return prisma.workingHour.create({
    data: {
      doctorId: doctor.id,
      day,
      startTime,
      endTime
    }
  });
};


export const updateWorkingHours = async (
  doctorId,
  workingHoursId,
  { startTime, endTime }
) => {
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

  const existing = await prisma.workingHour.findFirst({
    where: {
      id: workingHoursId,
      doctorId: doctor.id
    }
  });

  if (!existing) {
    const error = new Error(
      "Working hours not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const newStartTime = startTime ?? existing.startTime;
  const newEndTime = endTime ?? existing.endTime;

  if (newStartTime >= newEndTime) {
    const error = new Error(
      "Start time must be earlier than end time"
    );

    error.statusCode = 400;
    throw error;
  }

  return prisma.workingHour.update({
    where: {
      id: workingHoursId
    },

    data: {
      startTime,
      endTime
    }
  });
};


export const deleteWorkingHours = async (
  doctorId,
  workingHoursId
) => {
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

  const existing = await prisma.workingHour.findFirst({
    where: {
      id: workingHoursId,
      doctorId: doctor.id
    }
  });

  if (!existing) {
    const error = new Error(
      "Working hours not found"
    );

    error.statusCode = 404;
    throw error;
  }

  await prisma.workingHour.delete({
    where: {
      id: workingHoursId
    }
  });

  return {
    message: "Working hours deleted successfully"
  };
};

