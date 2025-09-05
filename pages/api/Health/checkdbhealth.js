import { connect } from "@/DB/dbConfig";
import { getLogger } from "@/lib/logger"; 
const logger = getLogger(import.meta.url);

export default async function handler(req, res) {

  try {
    const isConnected = await connect();
    if (isConnected) {
      return res.status(200).json({ message: "Database is connected." });
    } else {
      return res.status(500).json({ message: "Failed to connect to the database." });
    }
  } catch (error) {
    logger.error("Error in POST handler", {
      message: err.message,
      stack: err.stack,
  });
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
}