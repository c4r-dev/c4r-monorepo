import mongoose, { Schema } from "mongoose";

const stickyNoteSchema = new Schema({
    userID: String,
    sessionID: String,
    noteScores: Array,
},
{
    timestamps: true,
}
);

export default mongoose.models.StickyNote || mongoose.model("StickyNote", stickyNoteSchema);