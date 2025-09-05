import User from "@/models/userModel";
import Notification from "@/models/notificationModel";
import { connect } from "@/DB/dbConfig";
import { getLogger } from "@/lib/logger";
import jwt from "jsonwebtoken";

const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Missing or malformed Authorization header", { headers: req.headers });
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  await connect();

  let decoded;
  try {
    const token = authHeader.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_Secret);
  } catch (err) {
    logger.warn("Invalid token", { error: err.message });
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findById(decoded.id).select("-password -__v -isVerified");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Create Notification
  if (req.method === "POST") {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }

      const notification = await Notification.create({
        userId: decoded.id, // always from token
        message,
      });

      return res.status(201).json({ success: true, notification });
    } catch (error) {
      logger.error("Error in POST /notifications", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // Fetch Notifications
  if (req.method === "GET") {
    try {
      const notifications = await Notification.find({ userId: decoded.id })
        .sort({ createdAt: -1 })
        .limit(20);

      return res.status(200).json({ success: true, notifications });
    } catch (error) {
      logger.error("Error in GET /notifications", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // Update Notification (mark as read)
  if (req.method === "PATCH") {
    try {
      const { notificationId, isRead } = req.body;

      if (!notificationId) {
        return res.status(400).json({ success: false, message: "notificationId is required" });
      }

      const updated = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: decoded.id },
        { $set: { isRead: isRead ?? true } },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }

      return res.status(200).json({ success: true, notification: updated });
    } catch (error) {
      logger.error("Error in PATCH /notifications", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
