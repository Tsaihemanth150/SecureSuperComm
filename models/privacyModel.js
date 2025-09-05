import mongoose from 'mongoose';

const privacySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // ✅ must match your User model name
        required: true,
    },
    isPhoneNumberPublic: { type: Boolean, default: false },
    isGenderPublic: { type: Boolean, default: false },
    isAgesPublic: { type: Boolean, default: false },
    isLocationPublic: { type: Boolean, default: false },
    isProfilePicPublic:{ type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
});

const Privacy = mongoose.models.Privacy || mongoose.model("Privacy", privacySchema);
export default Privacy;
