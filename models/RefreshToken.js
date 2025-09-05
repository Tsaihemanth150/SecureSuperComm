// models/RefreshToken.js
import mongoose from "mongoose";

const refreshSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  revoked: { type: Boolean, default: false },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

const RefreshToken = mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshSchema);
export default RefreshToken;
