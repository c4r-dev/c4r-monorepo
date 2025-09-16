import mongoose, { Schema } from "mongoose";

const rigorFilesSchema = new Schema({
    sessionID: String,
    userInputs: [
        {
            topicName: String,
            userInputtedString: String,
        }
    ]
});

export default mongoose.models.RigorFiles || mongoose.model("RigorFiles", rigorFilesSchema);