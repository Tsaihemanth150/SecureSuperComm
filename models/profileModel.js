import mongoose from 'mongoose';
import User from './userModel.js';

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    DOB:{
        type: Date,
        required: true,
    },
    Age:{
        type: Number,
        required: true,
    },
    Gender:{
        type: String,
        required: true,
    },
    Address:{
        type: String,
        required: true,
       
    },
    Pincode: {
        type: String,
        required:true,
    },
    FaceBook:{
        type: String,
        required:false,
    },
    Instagram:{
        type: String,
        required:false,
    },
    Twitter:{
        type: String,
        required:false,
    },
    LinkedIn:{
        type: String,
        required:false,
    },
    GitHub:{
        type: String,
        required:false,
    },
    other:{
        type: String,
        required:false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;