import mongoose, { Schema } from "mongoose";

const rigorFilesAdviceSchema = new Schema({
    sessionID: String,
    advice1: String,
    advice2: String, 
    advice3: String,
    advice4: String
}, { timestamps: true });

export default mongoose.models.RigorFilesAdvice || mongoose.model("RigorFilesAdvice", rigorFilesAdviceSchema);