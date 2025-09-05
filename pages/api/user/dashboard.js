import User from "@/models/userModel";
import { connect } from "@/DB/dbConfig";
import { getLogger } from "@/lib/logger";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Documents from "@/models/documentModel";
import Privacy from "@/models/privacyModel";

const logger = getLogger(import.meta.url);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Missing or malformed Authorization header", { headers: req.headers });
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  try {
    await connect();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_Secret);

    const user = await User.findById(decoded.id).select("-password -__v -isVerified");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const privacy = await Privacy.findOne({ user: user._id });
    let docsWithSignedUrls = [];

    if (privacy?.isProfilePicPublic === true) {
      const documents = await Documents.find({ user: user._id });

      docsWithSignedUrls = await Promise.all(
        documents.map(async (doc) => {
          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: doc.fileKey,
            });

            const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1h
            return { ...doc.toObject(), signedUrl };
          } catch (error) {
            logger.error("Error generating signed URL for document", {
              docId: doc._id,
              message: error.message,
            });
            return doc.toObject(); // Return doc without signed URL on error
          }
        })
      );
    }

    return res.status(200).json({ user, documents: docsWithSignedUrls });
  } catch (error) {
    logger.error("Error in POST handler", {
      message: error.message,
      stack: error.stack,
      route: "/api/user/getProfile",
    });
    return res.status(500).json({ message: "Internal server error" });
  }
}
