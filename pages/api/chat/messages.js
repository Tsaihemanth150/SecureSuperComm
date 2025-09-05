import { connect } from "@/DB/dbConfig";
import Chat from "@/models/chatModel";
import Message from "@/models/messageModel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connect();

  if (req.method !== "POST") {
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
    const { chatId, text } = req.body;

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      text,
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const populatedMessage = await message.populate("sender", "firstName lastName username profilePic");

    if (global.io) {
      const chat = await Chat.findById(chatId).populate("participants");
      chat.participants.forEach((p) => {
        global.io.to(String(p._id)).emit("message:new", { chatId, message: populatedMessage });
      });
    }

    return res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
