// pages/api/workerHealth.js
import { worker } from "@/workers/emailWorker";
import { getLogger } from "@/lib/logger"; 
const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  try {
    const running = worker.isRunning; // true if worker is actively polling
    res.status(200).json({ ok: true, workerRunning: running });
  } catch (err) {
    logger.error("Error in POST handler", {
      message: err.message,
      stack: err.stack,
  });
    res.status(500).json({ ok: false, error: err.message });
  }
}
