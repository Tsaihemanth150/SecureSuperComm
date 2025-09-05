import jwt from "jsonwebtoken";
import { connect } from "@/DB/dbConfig";
import User from "@/models/userModel";
import Privacy from "@/models/privacyModel";
import { getLogger } from "@/lib/logger"; 
const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or malformed Authorization header", { headers: req.headers });
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const token = authHeader.split(" ")[1];
    await connect();

    try {
      const decoded = jwt.verify(token, process.env.JWT_Secret);
      const { isPhoneNumberPublic, isGenderPublic, isAgesPublic, isLocationPublic ,isProfilePicPublic} = req.body;

      const user = await User.findById(decoded.id).select("-password -__v -isVerified");

      if (!user) {
        logger.error("JWT valid but user not found", { userId: decoded.id });
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // ✅ FIX: add await here
      const updatedPrivacy = await Privacy.findOneAndUpdate(
        { user: user._id },
        {
          isPhoneNumberPublic,
          isGenderPublic,
          isAgesPublic,
          isLocationPublic,
          isProfilePicPublic,
          updatedAt: Date.now(),
        },
        { new: true, upsert: true }
      );

      logger.info("Privacy updated successfully", { userId: user._id });
      return res.status(200).json({
        message: "Privacy updated successfully",
        success: true,
        privacy: updatedPrivacy,
      });
    } catch (error) {
      logger.error("Error in POST handler", {
        message: error.message,
        stack: error.stack,
        route: "/api/user/settings/privacy",
      });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  } else {
    logger.warn("Invalid HTTP method", { method: req.method });
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
