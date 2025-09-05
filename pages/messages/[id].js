"use client";
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

export default function ChatPage({ params }) {
  const convoId = params.id;
  const token = Cookies.get("Token");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/chat/${convoId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessages(data.messages || []);
    }
    fetchMessages();

    const socket = io("/", { path: "/api/socket", auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:conversation", { conversationId: convoId });
    });

    socket.on("message:new", ({ message }) => {
      if (message.conversation === convoId || message.conversation?._id === convoId) {
        setMessages((m) => [...m, message]);
      }
    });

    return () => {
      socket.emit("leave:conversation", { conversationId: convoId });
      socket.disconnect();
    };
  }, [convoId, token]);

  async function send() {
    if (!text.trim()) return;
    // call POST to save and emit (server will also emit)
    await fetch(`/api/chat/${convoId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });
    setText("");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m._id} className={`p-2 rounded ${m.sender === /* your id */ ? "bg-indigo-100 self-end" : "bg-gray-100 self-start"}`}>
            <div className="text-sm">{m.text}</div>
            <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 border rounded" />
        <button className="btn" onClick={send}>Send</button>
      </div>
    </div>
  );
}
