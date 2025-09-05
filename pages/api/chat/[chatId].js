import { connect } from "@/DB/dbConfig";
import Chat from "@/models/chatModel";
import Message from "@/models/messageModel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connect();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

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

  try {
    const { chatId } = req.query;
    const chat = await Chat.findById(chatId).populate("participants", "firstName lastName username");

    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    if (!chat.participants.some((p) => p._id.toString() === userId)) {
      return res.status(403).json({ success: false, message: "Not a participant" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName username profilePic")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, chat, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
