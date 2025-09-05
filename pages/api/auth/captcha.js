// pages/api/auth/captcha.js
import svgCaptcha from "svg-captcha";
import cookie from "cookie";

export default function handler(req, res) {
  if (req.method === "GET") {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      background: "#f9fafb",
    });

    // Store captcha text in HttpOnly cookie (not accessible by JS)
    res.setHeader("Set-Cookie", cookie.serialize("captcha_token", captcha.text, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    }));

    // Send only SVG to frontend
    res.status(200).json({ svg: captcha.data });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}