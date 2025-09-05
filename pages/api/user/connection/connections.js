import User from "@/models/userModel";
import Connection from "@/models/connectionModel";
import Notification from "@/models/notificationModel";
import { connect } from "@/DB/dbConfig";
import { getLogger } from "@/lib/logger";
import jwt from "jsonwebtoken";

const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(400).json({ success: false, message: "Token required" });
  }

  await connect();

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_Secret);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findById(decoded.id).select("-password -__v -isVerified");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  // 📌 Accept / Reject connection
  if (req.method === "PUT") {
    try {
      const { connectionId, action } = req.body; // action = "accepted" | "rejected"
      const connection = await Connection.findById(connectionId);
      if (!connection) return res.status(404).json({ success: false, message: "Connection not found" });

      // Only recipient can accept/reject
      if (connection.recipient.toString() !== user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      connection.status = action;
      await connection.save();

      if (action === "accepted") {
        // 🔹 Add both users to each other's `connections` array
        await User.findByIdAndUpdate(connection.requester, {
          $addToSet: { connections: connection.recipient },
        });
        await User.findByIdAndUpdate(connection.recipient, {
          $addToSet: { connections: connection.requester },
        });

        await Notification.create({
          userId: connection.requester,
          message: `${user.firstName} ${user.lastName} accepted your connection request.`,
        });
      }

      return res.status(200).json({ success: true, connection });
    } catch (error) {
      logger.error("PUT /connection/manage error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // 📌 Remove connection
  if (req.method === "DELETE") {
    try {
      const { targetUserId } = req.body;

      // Remove from both users
      await User.findByIdAndUpdate(user._id, { $pull: { connections: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { connections: user._id } });

      // Remove connection doc
      await Connection.findOneAndDelete({
        $or: [
          { requester: user._id, recipient: targetUserId },
          { requester: targetUserId, recipient: user._id },
        ],
      });

      return res.status(200).json({ success: true, message: "Connection removed" });
    } catch (error) {
      logger.error("DELETE /connection/manage error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
