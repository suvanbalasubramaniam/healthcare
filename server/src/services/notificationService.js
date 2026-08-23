import { prisma } from "../config/prisma.js";
import { sendEmail } from "./emailService.js";

export const createNotification = async ({
  userId,
  appointmentId = null,
  type,
  recipient,
  subject,
  content,
}) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      appointmentId,
      type,
      channel: "EMAIL",
      status: "PENDING",
      recipient,
      subject,
      content,
    },
  });

  try {
    await sendEmail({
      to: recipient,
      subject,
      content,
    });

    return await prisma.notification.update({
      where: {
        id: notification.id,
      },

      data: {
        status: "SENT",
        sentAt: new Date(),
        attempts: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error
    );

    return await prisma.notification.update({
      where: {
        id: notification.id,
      },

      data: {
        status: "FAILED",
        attempts: {
          increment: 1,
        },
        error: error.message,
        nextRetryAt: new Date(
          Date.now() + 5 * 60 * 1000
        ),
      },
    });
  }
};