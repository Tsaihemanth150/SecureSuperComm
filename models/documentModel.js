import mongoose from 'mongoose';
import User from './userModel.js';

const docSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    fileName:{
        type: String,
        required: true,
    },
    fileKey:{
        type: String,
        required: true,
    },
    fileUrl:{
        type: String,
        required: true,
    },
    fileType:{
        type: String,
        required: true,
       
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

const Documents = mongoose.models.Documents || mongoose.model("Documents", docSchema);
export default Documents;