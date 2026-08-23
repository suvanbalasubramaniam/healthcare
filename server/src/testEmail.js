import "dotenv/config";
import { sendEmail } from "./services/emailService.js";

const test = async () => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Healthcare App Test",
      content:
        "This is a test email from the Healthcare Appointment Manager.",
    });

    console.log("✅ TEST EMAIL SENT");
  } catch (error) {
    console.error("❌ TEST EMAIL FAILED:", error);
  }
};

test();