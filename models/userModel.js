// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import validator from "validator";
import Privacy from "./privacyModel.js"; // <-- import your Privacy model

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

const userSchema = new mongoose.Schema({
    userID: { type: String, unique: true, index: true },
    username: { type: String, required: [true, "Please enter the Username"], unique: true, trim: true, minlength: 3, maxlength: 30 },
    firstName: { type: String, required: [true, "Please enter the First Name"], trim: true },
    lastName: { type: String, required: [true, "Please enter the Last Name"], trim: true },
    email: { type: String, required: [true, "Please enter the Email"], unique: true, lowercase: true, trim: true, validate: [validator.isEmail, "Please enter a valid email"] },
    password: { type: String, required: [true, "Please enter the password"], minlength: 8, select: false },
    phoneNumber: { type: String, unique: true, sparse: true, trim: true },
    isVerified: { type: Boolean, default: false },
    roles: { type: [String], default: ["user"] },
    isAdmin:{type:Boolean,default:false},
    settings: {
        notifications: { type: Boolean, default: true },
        privacy: { type: String, enum: ["public", "private"], default: "public" }
    },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

// Generate userID if missing
userSchema.pre("validate", async function (next) {
    if (!this.userID) {
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
            const candidate = `SSC${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
            const exists = await mongoose.models.User?.findOne({ userID: candidate }).lean();
            if (!exists) {
                this.userID = candidate;
                break;
            }
        }
        if (!this.userID) {
            this.userID = `SSC${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
        }
    }
    if (this.email) this.email = this.email.toLowerCase();
    next();
});

// Hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔹 After user is created, create default Privacy doc
userSchema.post("save", async function (doc, next) {
    try {
        const exists = await Privacy.findOne({ user: doc._id });
        if (!exists) {
            await Privacy.create({ user: doc._id }); // will use schema defaults
        }
        next();
    } catch (err) {
        console.error("Error creating default privacy:", err);
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
