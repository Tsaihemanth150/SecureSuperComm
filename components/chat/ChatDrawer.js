import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { initClientSocket } from "@/lib/socket";
import Cookie from "js-cookie";

export default function ChatDrawer({ isOpen, onClose, recipient, chatId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Load chat history + init socket
  useEffect(() => {
    if (!isOpen || !chatId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/messages?chatId=${chatId}`, {
          headers: { Authorization: `Bearer ${Cookie.get("Token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    fetchHistory();

    const s = initClientSocket();
    setSocket(s);

    if (s && chatId) {
      s.emit("join:conversation", { conversationId: chatId });
    }

    const onNew = (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg.message]); // msg.message because API emits { chatId, message }
      }
    };

    s?.on("message:new", onNew);

    return () => {
      s?.off("message:new", onNew);
      if (s && chatId) {
        s.emit("leave:conversation", { conversationId: chatId });
      }
    };
  }, [isOpen, chatId]);

  if (!isOpen) return null;

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookie.get("Token")}`,
        },
        body: JSON.stringify({
          chatId,
          text: text.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistic + server response
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error("Failed to send:", err);
    }

    setText("");
  };

  return (
    <div className="fixed bottom-4 left-4 w-80 h-96 bg-gray-900 text-white shadow-lg rounded-xl flex flex-col z-50">
      {/* Header */}
      <div className="p-3 bg-purple-700 rounded-t-xl flex justify-between items-center">
        <div>
          <div className="font-bold">
            {recipient ? `${recipient.firstName} ${recipient.lastName}` : "Chat"}
          </div>
          <div className="text-xs text-gray-300">@{recipient?.username}</div>
        </div>
        <FaTimes className="cursor-pointer" onClick={onClose} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[70%] p-2 rounded ${
              m.sender?._id === recipient?._id
                ? "bg-gray-700 self-start mr-auto"
                : "bg-blue-600 self-end ml-auto"
            }`}
          >
            <div className="text-sm">{m.text}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex gap-2">
        <input
          className="flex-1 px-2 py-1 rounded bg-gray-800 text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
