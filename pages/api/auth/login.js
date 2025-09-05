// pages/api/auth/login.js
import jwt from "jsonwebtoken";
import { connect } from "@/DB/dbConfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { getLogger } from "@/lib/logger";
import cookie from "cookie";

const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connect();

  try {
    const { username, password, captchaInput } = req.body || {};
    const cookies = cookie.parse(req.headers.cookie || "");
    const captchaStored = cookies.captcha_token;

    if (!captchaInput || !captchaStored) {
      return res.status(400).json({ message: "Captcha is required" });
    }

    if (String(captchaInput).toLowerCase() !== String(captchaStored).toLowerCase()) {
      return res.status(400).json({ message: "Invalid captcha" });
    }

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      await bcrypt.hash("invalid_password", 10);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔑 Generate tokens
    const payload = {
      id: user._id.toString(),
      userID: user.userID || null,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_Secret, { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

    const isProd = process.env.NODE_ENV === "production";

 
    res.setHeader("Set-Cookie", [
      // Access token (readable in JS since httpOnly=false for local testing)
      cookie.serialize("Token", accessToken, {
        httpOnly: false,   // 👈 change for testing
        secure: isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 ,  // 15 minutes
        path: "/",
      }),
      // Refresh token (always keep secure)
      cookie.serialize("RefreshToken", refreshToken, {
        httpOnly: true,    // 👈 should remain httpOnly
        secure: isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      }),
      // clear captcha
      cookie.serialize("captcha_token", "", {
        httpOnly: false,
        secure: isProd,
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      }),
    ]);

    

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    logger.error("Error in login POST handler", { message: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
}
