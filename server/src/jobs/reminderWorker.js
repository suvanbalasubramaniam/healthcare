import "dotenv/config";

import redisClient, {
  connectRedis
} from "../config/redis.js";

import {
  getReminderJob
} from "../queues/reminderQueue.js";

import {
  addEmailJob
} from "../queues/emailQueue.js";

import {
  sendSMS
} from "../services/smsService.js";

const MAX_ATTEMPTS = 3;

const processReminderJob = async (job) => {
  try {
    console.log(
      `💊 Processing medication reminder for ${job.medicationName}`
    );

    const message =
      `Medication Reminder: Take ${job.medicationName} ` +
      `${job.dosage} (${job.frequency}).`;

    // SMS
    if (job.patientPhone) {
      await sendSMS(
        job.patientPhone,
        message
      );
    }

    // Email
    if (job.patientEmail) {
      await addEmailJob({
        to: job.patientEmail,
        subject: `Medication Reminder - ${job.medicationName}`,
        text: message,
        html: `
          <h2>Medication Reminder</h2>
          <p>${message}</p>
          <p>Please follow the instructions provided by your doctor.</p>
        `
      });
    }

    console.log(
      `✅ Medication reminder processed for ${job.medicationName}`
    );

  } catch (error) {
    console.error(
      `❌ Medication reminder failed:`,
      error.message
    );

    job.attempts = (job.attempts || 0) + 1;

    if (job.attempts < MAX_ATTEMPTS) {
      console.log(
        `🔁 Retrying reminder (${job.attempts}/${MAX_ATTEMPTS})...`
      );

      await redisClient.rPush(
        "healthcare:reminder_queue",
        JSON.stringify(job)
      );
    } else {
      console.error(
        "🚨 Medication reminder permanently failed"
      );
    }
  }
};

const startReminderWorker = async () => {
  await connectRedis();

  console.log("💊 Medication reminder worker started");
  console.log("Waiting for reminder jobs...");

  while (true) {
    try {
      const job = await getReminderJob();

      if (job) {
        await processReminderJob(job);
      }

    } catch (error) {
      console.error(
        "❌ Reminder worker error:",
        error.message
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );
    }
  }
};

startReminderWorker();
