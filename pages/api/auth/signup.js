// pages/api/auth/signup.js
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import validator from "validator";
import { connect } from "@/DB/dbConfig";
import { sendSignUpMail } from "@/utility/sendSignUpMail";
import { getLogger } from "@/lib/logger";
const logger = getLogger(import.meta.url);
import Privacy from "@/models/privacyModel";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await connect();

    const { username, Firstname, Lastname, email, password, confirmPassword, phoneNumber } = req.body || {};

    if (!username || !Firstname || !Lastname || !email || !password || !confirmPassword || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) return res.status(400).json({ message: "Password does not match" });
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email format" });
    if (!validator.isMobilePhone(String(phoneNumber), "any")) return res.status(400).json({ message: "Invalid phone number" });
    if (!validator.isStrongPassword(password)) return res.status(400).json({ message: "Password is not strong enough" });

    // Check duplicates for email/phone/username
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }, { username }]
    }).lean();

    if (existing) {
      // Give a specific message for UX but avoid leaking too much detail in sensitive contexts.
      if (existing.email && existing.email === email.toLowerCase()) return res.status(409).json({ message: "Email already registered" });
      if (existing.username && existing.username === username) return res.status(409).json({ message: "Username already taken" });
      if (existing.phoneNumber && existing.phoneNumber === phoneNumber) return res.status(409).json({ message: "Phone number already used" });
      return res.status(409).json({ message: "User already exists" });
    }

    

    const newUser = new User({
      username,
      firstName:Firstname,
      lastName:Lastname,
      email: email.toLowerCase(),
      password,
      phoneNumber,
    });
    const privacy = await Privacy.create({ user: newUser._id });
    await newUser.save();

    // respond quickly
    res.status(201).json({ message: "User created successfully", userId: newUser._id });

    // Fire-and-forget sending welcome email (do not await)
    void sendSignUpMail(newUser).catch(err => {
      logger.error("Failed to send signup mail", { message: err.message, stack: err.stack });
    });

  } catch (err) {
    logger.error("Error in signup POST handler", { message: err.message, stack: err.stack });

    // handle unique index race errors more gracefully
    if (err && err.code === 11000) {
      // duplicate key error
      const field = Object.keys(err.keyValue || {})[0] || "field";
      return res.status(409).json({ message: `${field} already exists` });
    }

    return res.status(500).json({ message: "Signup failed" });
  }
}
