// utility/sendSignUpMail.js
import { mailQueue } from "@/lib/mailQueue";

/**
 * Enqueue a welcome email for a new user.
 * Named export: sendSignUpMail
 * Also exported as default for convenience.
 */
export const sendSignUpMail = async (user) => {
  if (!user || !user.email) {
    throw new Error("sendSignUpMail: user with an email is required");
  }

  const name = user.Firstname ?? user.firstName ?? user.username ?? user.email;
  const jobId = `signup-email-${user._id ?? user.id ?? user.email}`;

  const payload = {
    to: user.email,
    subject: "Welcome to SecureComm",
    text: `Hello ${name}, you have successfully signed up.`,
    html: `<p>Hello <b>${name}</b>, welcome aboard!</p><p>Team, SuperSecureComm</p>`,
  };

  return mailQueue.add("send-signup-email", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
    jobId,
  });
};

// optional: allow default import as well
export default sendSignUpMail;
