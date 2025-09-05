// workers/emailWorker.js
import "dotenv/config";
import nodemailer from "nodemailer";
import { Worker } from "bullmq";
import { connection } from "../config/redis.js";


const worker = new Worker(
  "mail-queue",
  async (job) => {
    console.log(`📩 Processing job ${job.id}:`, job.data);

    // Transporter config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true if port = 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SecureComm" <${process.env.EMAIL_USER}>`,
      to: job.data.to,
      subject: job.data.subject,
      text: job.data.text,
      html: job.data.html,
    });

  },
  { connection }
);

// Job status logs
worker.on("failed", (job, err) => {
 
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

export { worker };