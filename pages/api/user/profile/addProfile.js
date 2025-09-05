import jwt from "jsonwebtoken"
import Cookies from "js-cookie"
import { connect } from "@/DB/dbConfig"
import User from "@/models/userModel"
import Profile from "@/models/profileModel"
import { getLogger } from "@/lib/logger"; 

const logger = getLogger(import.meta.url);

export default async function handler(req,res){

 if (req.method === "POST") {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or malformed Authorization header", { headers: req.headers });
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const token = authHeader.split(" ")[1];
    await connect();

    try {
      const {DOB,Age,Gender,Address,Pincode,FaceBook,Instagram,Twitter,LinkedIn,GitHub,other} = req.body;
      const decoded = jwt.verify(token, process.env.JWT_Secret);
      const user = await User.findById(decoded.id).select("-password -__v -isVerified");
      if(!user){
        res.status(404).json("User not found");
      }
      const profile = await Profile.findOne({ user: user._id });
      if(!profile){
        const createProfile = await Profile.create({
          user: user._id,
          DOB,
          Age,
          Gender,
          Address,
          Pincode,
          FaceBook,
          Instagram,
          Twitter,
          LinkedIn,
          GitHub,
          other,
        });
        return res.status(200).json({ success: true, message: "Profile created successfully" });
      }else{
        const updateProfile = await Profile.findOneAndUpdate({ user: user._id }, {
          DOB,
          Age,
          Gender,
          Address,
          Pincode,
          FaceBook,
          Instagram,
          Twitter,
          LinkedIn,
          GitHub,
          other,
        });
        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    }
    } catch (error) {
      logger.error("Error in POST handler", {
        message: error.message,
        stack: error.stack,
        route: "/api/user/getProfile",
      });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  } else {
    logger.warn("Invalid HTTP method", { method: req.method });
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}