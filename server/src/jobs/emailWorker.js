import "dotenv/config";

import redisClient, {
  connectRedis
} from "../config/redis.js";

import {
  getEmailJob
} from "../queues/emailQueue.js";

import {
  sendEmail
} from "../services/emailService.js";

const MAX_ATTEMPTS = 3;

const processEmailJob = async (job) => {
  try {
    console.log(`📧 Sending email to ${job.to}...`);

    await sendEmail({
      to: job.to,
      subject: job.subject,
      text: job.text,
      html: job.html
    });

    console.log(`✅ Email successfully sent to ${job.to}`);

  } catch (error) {
    console.error(
      `❌ Email failed for ${job.to}:`,
      error.message
    );

    job.attempts = (job.attempts || 0) + 1;

    if (job.attempts < MAX_ATTEMPTS) {
      console.log(
        `🔁 Retrying email (${job.attempts}/${MAX_ATTEMPTS})...`
      );

      await redisClient.rPush(
        "healthcare:email_queue",
        JSON.stringify(job)
      );
    } else {
      console.error(
        `🚨 Email permanently failed for ${job.to}`
      );
    }
  }
};

export const startEmailWorker = async () => {
  await connectRedis();

  console.log("📬 Email worker started");
  console.log("Waiting for email jobs...");

  while (true) {
    try {
      const job = await getEmailJob();

      if (job) {
        await processEmailJob(job);
      }

    } catch (error) {
      console.error(
        "❌ Email worker error:",
        error.message
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );
    }
  }
};

startEmailWorker();