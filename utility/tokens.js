// utils/tokens.js
import jwt from "jsonwebtoken";
import cookie from "cookie";

const isProd = process.env.NODE_ENV === "production";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_Secret, { expiresIn: "15m" });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

export function setTokenCookies(res, { Token, RefreshToken }) {
  res.setHeader("Set-Cookie", [
    cookie.serialize("Token", Token, {
      httpOnly: false, // testing only
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    }),
    cookie.serialize("RefreshToken", RefreshToken, {
      httpOnly: true, // always secure
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    }),
  ]);
}
