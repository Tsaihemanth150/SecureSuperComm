import jwt from "jsonwebtoken";
import Category from "@/models/categoryModel";   // ✅ Correct import
import User from "@/models/userModel";
import { getLogger } from "@/lib/logger";
import { connect } from "@/DB/dbConfig";

const logger = getLogger(import.meta.url);

export default async function handler(req, res) {
  await connect();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Missing or malformed Authorization header", { headers: req.headers });
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_Secret);

  const user = await User.findById(decoded.id).select("-password -__v -isVerified");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Access Denied" });
  }

  if (req.method === "POST") {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const isCategoryExists = await Category.findOne({ name });
      if (isCategoryExists) {
        return res.status(400).json({ message: "Category already exists" });
      }

      await Category.create({ name, description });

      return res.status(201).json({ message: "Category created successfully" });
    } catch (error) {
      logger.error("Error in POST handler", {
        message: error.message,
        stack: error.stack,
        route: "/api/admin/addCategory",
      });
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    try {
      const categories = await Category.find();
      return res.status(200).json({ categories });
    } catch (error) {
      logger.error("Error in GET handler", {
        message: error.message,
        stack: error.stack,
        route: "/api/admin/getCategory",
      });
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
