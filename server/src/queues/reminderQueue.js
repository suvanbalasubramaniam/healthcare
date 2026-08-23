import redisClient, { connectRedis } from "../config/redis.js";

const REMINDER_QUEUE = "healthcare:reminder_queue";

export const addReminderJob = async (reminderData) => {
  await connectRedis();

  const job = {
    ...reminderData,
    attempts: 0,
    createdAt: new Date().toISOString()
  };

  await redisClient.lPush(
    REMINDER_QUEUE,
    JSON.stringify(job)
  );

  console.log("💊 Medication reminder job added");

  return job;
};

export const getReminderJob = async () => {
  await connectRedis();

  const result = await redisClient.brPop(
    REMINDER_QUEUE,
    0
  );

  if (!result) {
    return null;
  }

  return JSON.parse(result.element);
};

export { REMINDER_QUEUE };
