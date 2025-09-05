import User from "@/models/userModel";
import Connection from "@/models/connectionModel";
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

  if (req.method === "POST") {
    try {
      const { username } = req.body;
      const recipient = await User.findOne({ username });
      if (!recipient) {
        return res.status(404).json({ success: false, message: "Recipient not found" });
      }

      // prevent duplicate connection requests
      const existing = await Connection.findOne({
        requester: user._id,
        recipient: recipient._id,
      });
      if (existing) {
        return res.status(400).json({ success: false, message: "Request already sent" });
      }

      const connectionRequest = await Connection.create({
        requester: user._id,
        recipient: recipient._id,
      });

      await Notification.create({
        userId: recipient._id,
        message: `${user.firstName} ${user.lastName} has sent you a connection request.`,
      });

      return res.status(201).json({ 
        success: true, 
        connectionRequest: connectionRequest.toObject() 
      });
    } catch (error) {
      logger.error("Error in POST /connection/request", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  if (req.method === "GET") {
    try {
      const myrequest = await Connection.find({ recipient: decoded.id })
        .populate("requester", "firstName lastName username profilePic")
        .lean();

      return res.status(200).json({ success: true, myrequest });
    } catch (error) {
      logger.error("Error in GET /connection/request", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
