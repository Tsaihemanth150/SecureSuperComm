import formidable from "formidable";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import Documents from "@/models/documentModel";
import { connect } from "@/DB/dbConfig";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const config = {
  api: {
    bodyParser: false, // ✅ required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_Secret);

    await connect();
    const user = await User.findById(decoded.id).select("-password -__v");

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: "File parse error" });

      const file = files.file[0]; // `formidable` v3 returns arrays
      const fileStream = fs.createReadStream(file.filepath);

      const key = `profile-pics/${Date.now()}-${file.originalFilename}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileStream,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      // Save document reference
      const newDocument = await Documents.create({
        user: user._id,
        fileName: file.originalFilename,
        fileType: file.mimetype,
        fileKey: key,
        fileUrl,
      });

      return res.status(200).json({
        success: true,
        fileUrl,
        document: newDocument,
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
