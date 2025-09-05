import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { connect } from "../DB/dbConfig.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export function initSocket(server) {
  const io = new Server(server, {
    path: "/api/socket",
    cors: { origin: process.env.CLIENT_ORIGIN || "*" },
  });

  // Authenticate socket
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next(new Error("Unauthorized"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_Secret);
      socket.user = { id: decoded.id };
      await connect();
      next();
    } catch (err) {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(String(userId)); // personal room

    socket.on("join:conversation", async ({ conversationId }) => {
      socket.join(conversationId);
    });

    socket.on("leave:conversation", ({ conversationId }) => {
      socket.leave(conversationId);
    });

    socket.on("message:send", async ({ chatId, recipientId, text }) => {
      try {
        await connect();

        let chat;
        if (chatId) {
          chat = await Chat.findById(chatId);
        }

        // If chat doesn’t exist, create new one
        if (!chat) {
          chat = await Chat.create({
            participants: [userId, recipientId],
          });
        }

        // Create and save message
        const message = await Message.create({
          chat: chat._id,
          sender: userId,
          text,
        });

        // Update chat with last message
        chat.lastMessage = message._id;
        await chat.save();

        const populated = await message.populate("sender", "firstName lastName");

        // Emit to all participants in that chat
        io.to(chat._id.toString()).emit("message:new", {
          _id: message._id,
          chatId: chat._id,
          text: message.text,
          senderId: populated.sender._id,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Message send error:", err);
      }
    });

    socket.on("disconnect", () => {
      io.to(String(userId)).emit("presence:disconnected", { userId });
    });
  });

  global.io = io;
  return io;
}
