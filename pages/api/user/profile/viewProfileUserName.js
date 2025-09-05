import jwt from "jsonwebtoken";
import { connect } from "@/DB/dbConfig";
import User from "@/models/userModel";
import { getLogger } from "@/lib/logger"; 
import Documents from "@/models/documentModel";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Privacy from "@/models/privacyModel";
import Connection from "@/models/connectionModel";
import { connection } from "mongoose";

const logger = getLogger(import.meta.url);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
        const {username} = req.body;
      const decoded = jwt.verify(token, process.env.JWT_Secret);
      const user = await User.findById(decoded.id).select("-password -__v -isVerified");
    
      const searchedUser = await User.findOne({ username });
      const privacyforsearchedUser = await Privacy.findOne({ user: searchedUser._id });

      if (!user) {
        logger.error("JWT valid but user not found", { userId: decoded.id });
        return res.status(404).json({ success: false, message: "User not found" });
      }
      if(!searchedUser){
        logger.error("JWT valid but user not found", { userId: decoded.id });
        return res.status(404).json({ success: false, message: "searched  User not found" });
      }
      if(searchedUser.settings.privacy !== 'public'){
        logger.error("JWT valid but user not found", { userId: decoded.id });
        return res.status(404).json({ success: false, message: "searched User not found" });
      }
      const documents = await Documents.find({ user: user._id });

      // Attach signed URLs
      const docsWithSignedUrls = await Promise.all(
        documents.map(async (doc) => {
          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: doc.fileKey, // stored when uploaded
            });

            const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1h
            return {
              ...doc.toObject(),
              signedUrl, // temporary access link
            };
          } catch (err) {
            logger.error("Failed to sign URL", { key: doc.fileKey, error: err.message });
            return { ...doc.toObject(), signedUrl: null };
          }
        })
      );

      const connect = await Connection.findOne({
        $or: [
          { requester: user._id, recipient: searchedUser._id },
          { requester: searchedUser._id, recipient: user._id },
        ],
      });
        const connectionstatus= connect.status;
      let isConnectionExit = false;
      if (connect) {
        isConnectionExit = true;
      }
      
      return res.status(200).json({
        success: true,
        searchedUser,
        connectionstatus,
        isConnectionExit,
        privacyforsearchedUser,
        documents: docsWithSignedUrls,
      });
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
