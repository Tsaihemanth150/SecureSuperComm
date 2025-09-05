// pages/api/auth/refresh.js
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { connect } from "@/DB/dbConfig";
import RefreshToken from "@/models/RefreshToken";
import { signAccessToken, signRefreshToken, setTokenCookies } from "@/utility/tokens";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const oldRefresh = cookies.RefreshToken; 
  if (!oldRefresh) {
    return res.status(401).json({ message: "No refresh token" });
  }

  let payload;
  try {
    payload = jwt.verify(oldRefresh, process.env.JWT_REFRESH_SECRET); // ✅ correct secret
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // validate persisted token
  const saved = await RefreshToken.findOne({
    token: oldRefresh,
    userId: payload.id,
    revoked: false,
  });
  if (!saved) {
    return res.status(401).json({ message: "Refresh token revoked or missing" });
  }

  // rotate: revoke old and create new
  saved.revoked = true;
  await saved.save();

  const newRefresh = signRefreshToken({
    id: payload.id,
    username: payload.username,
  });
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

  await RefreshToken.create({
    token: newRefresh,
    userId: payload.id,
    expiresAt,
  });

  const newAccess = signAccessToken({
    id: payload.id,
    username: payload.username,
  });

  // 🍪 reset cookies
  setTokenCookies(res, {
    Token: newAccess,
    RefreshToken: newRefresh,
  });

  return res.json({ message: "Token refreshed" });
}
