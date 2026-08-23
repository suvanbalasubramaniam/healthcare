import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  console.log("🌱 Starting database seed...");

  const adminPassword = await bcrypt.hash(
    "admin12345",
    12
  );

  const doctorPassword = await bcrypt.hash(
    "doctor12345",
    12
  );


  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@healthcare.com"
    },

    update: {},

    create: {
      email: "admin@healthcare.com",
      passwordHash: adminPassword,
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN"
    }
  });


  // ----------------------------------------------------------
  // DOCTOR
  // ----------------------------------------------------------

  const doctor = await prisma.user.upsert({
    where: {
      email: "doctor@healthcare.com"
    },

    update: {},

    create: {
      email: "doctor@healthcare.com",
      passwordHash: doctorPassword,
      firstName: "John",
      lastName: "Smith",
      role: "DOCTOR",

      doctorProfile: {
        create: {
          specialization: "Cardiology",
          licenseNumber: "DOC-001",
          bio: "Specialist in cardiovascular care.",
          slotDurationMinutes: 30
        }
      }
    },

    include: {
      doctorProfile: true
    }
  });


  console.log("✅ Admin:", admin.email);
  console.log("✅ Doctor:", doctor.email);
  console.log("🌱 Seed completed successfully.");
};


seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });