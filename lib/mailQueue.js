// lib/mailQueue.js
import { Queue } from "bullmq";
import { connection } from "../config/redis.js"; // your existing redis connection

// real Queue instance
export const mailQueue = new Queue("mail-queue", { connection });

// helper wrapper — use this (call it as a function)
export const sendMailJob = (jobName, data, opts = {}) => {
  const defaultOpts = {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  };
  return mailQueue.add(jobName, data, { ...defaultOpts, ...opts });
};
