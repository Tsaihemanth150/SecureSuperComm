// pages/api/auth/logout.js
import cookie from "cookie";
import { connect } from "@/DB/dbConfig";
import RefreshToken from "@/models/RefreshToken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });
  await connect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const refresh = cookies.refreshToken;
  if (refresh) {
    await RefreshToken.updateOne({ token: refresh }, { revoked: true }).catch(() => {});
  }

  // clear cookies
  res.setHeader("Set-Cookie", [
    cookie.serialize("Token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(0) }),
    cookie.serialize("refreshToken", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(0) }),
    cookie.serialize("captcha_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(0) })
  ]);

  return res.json({ message: "Logged out" });
}
