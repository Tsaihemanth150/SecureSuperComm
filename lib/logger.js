// utils/logger.js
import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const { combine, timestamp, printf, json } = winston.format;

const isLoggingEnabled = process.env.IS_LOGGING_ENABLED === "true";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const isProd = process.env.NODE_ENV === "production";

const formatter = isProd
  ? combine(timestamp(), json())
  : combine(
      timestamp(),
      printf(({ level, message, timestamp, filePath, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${timestamp} [${filePath || "unknown"}] ${level}: ${message}${metaStr}`;
      })
    );

const rotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d",
});

const baseLogger = winston.createLogger({
  level: LOG_LEVEL,
  format: formatter,
  transports: isLoggingEnabled
    ? [new winston.transports.Console(), rotateTransport]
    : [],
});

// 🔥 Auto-inject file path using import.meta.url
export function getLogger(metaUrl) {
  let filePath = "unknown";
  try {
    const __filename = fileURLToPath(metaUrl);
    filePath = path.relative(process.cwd(), __filename); // relative path
  } catch (e) {}
  
  return {
    info: (msg, meta = {}) => baseLogger.info(msg, { filePath, ...meta }),
    warn: (msg, meta = {}) => baseLogger.warn(msg, { filePath, ...meta }),
    error: (msg, meta = {}) => baseLogger.error(msg, { filePath, ...meta }),
    debug: (msg, meta = {}) => baseLogger.debug(msg, { filePath, ...meta }),
  };
}

export default baseLogger;
