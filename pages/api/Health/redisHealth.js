// pages/api/health.js
import Redis from "ioredis";
import { connection as redisConfig } from "@/config/redis";
import { getLogger } from "@/lib/logger"; 
const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  try {
    // create a temporary Redis client using your config
    const client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
    });

    const pong = await client.ping();

    client.disconnect(); // cleanup

    res.status(200).json({ ok: true,message: "Services Up and running",pong});
  } catch (err) {
    logger.error("Error in POST handler", {
      message: err.message,
      stack: err.stack,
  });
    res.status(500).json({ ok: false, error: err.message });
  }
}
