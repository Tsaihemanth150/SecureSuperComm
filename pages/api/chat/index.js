import { connect } from "@/DB/dbConfig";
import Chat from "@/models/chatModel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connect();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token required" });
  }

  let userId;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (req.method === "GET") {
    try {
      const chats = await Chat.find({ participants: userId })
        .populate("participants", "firstName lastName username profilePic")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "firstName lastName username profilePic" },
        })
        .sort({ updatedAt: -1 });

      return res.status(200).json({ success: true, chats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { recipientId } = req.body;
      if (!recipientId) {
        return res.status(400).json({ success: false, message: "recipientId required" });
      }

      let chat = await Chat.findOne({
        participants: { $all: [userId, recipientId], $size: 2 },
      });

      if (!chat) {
        chat = await Chat.create({ participants: [userId, recipientId] });
      }

      chat = await chat.populate("participants", "firstName lastName username profilePic");

      return res.status(201).json({ success: true, chat });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
