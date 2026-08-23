import redisClient, { connectRedis } from "../config/redis.js";

const EMAIL_QUEUE = "healthcare:email_queue";

export const addEmailJob = async (emailData) => {
  await connectRedis();

  const job = {
    ...emailData,
    attempts: 0,
    createdAt: new Date().toISOString()
  };

  await redisClient.lPush(
    EMAIL_QUEUE,
    JSON.stringify(job)
  );

  console.log("📨 Email job added to queue");

  return job;
};

export const getEmailJob = async () => {
  await connectRedis();

  const result = await redisClient.brPop(
    EMAIL_QUEUE,
    0
  );

  if (!result) {
    return null;
  }

  return JSON.parse(result.element);
};

export { EMAIL_QUEUE };