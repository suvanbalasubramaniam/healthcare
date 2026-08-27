import redis from "../config/redis.js";

const EMAIL_QUEUE = "email_queue";

// ============================================================
// ADD EMAIL JOB
// ============================================================

export const addEmailJob = async (job) => {
  if (!job) {
    throw new Error("Email job is required");
  }

  if (!job.to) {
    throw new Error("Email recipient is required");
  }

  if (!job.subject) {
    throw new Error("Email subject is required");
  }

  if (!job.content) {
    throw new Error("Email content is required");
  }

  await redis.lPush(
    EMAIL_QUEUE,
    JSON.stringify(job)
  );

  console.log(
    `📬 Email job queued for ${job.to}`
  );
};


// ============================================================
// GET EMAIL JOB
// ============================================================

export const getEmailJob = async () => {
  const result = await redis.brPop(
    EMAIL_QUEUE,
    0
  );

  if (!result) {
    return null;
  }

  const job = JSON.parse(result.element);

  return job;
};