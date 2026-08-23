import { prisma } from "./src/config/prisma.js";

const updatePhone = async () => {
  await prisma.user.update({
    where: {
      email: "suvanbalasubramaniam+patient@gmail.com"
    },
    data: {
      phone: "9876543210"
    }
  });

  console.log("✅ Patient phone updated");

  await prisma.$disconnect();
};

updatePhone().catch(async (error) => {
  console.error("❌ Failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});