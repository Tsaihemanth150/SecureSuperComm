// lib/socket.js
import { io } from "socket.io-client";
import Cookie from "js-cookie";

let socket;

export function initClientSocket() {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    path: "/api/socket",                    // must match server path
    auth: { token: Cookie.get("Token") },   // send JWT for server auth
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => console.log("✅ socket connected", socket.id));
  socket.on("disconnect", () => console.log("❌ socket disconnected"));
  socket.on("connect_error", (err) => console.error("socket connect_error", err));

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
