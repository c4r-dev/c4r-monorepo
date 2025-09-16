import mongoose, { Schema } from "mongoose";

const finerAnswerSchema = new Schema({
    userID: String,
    sessionID: String,
    questionNumber: String,
    areaOption: String,
    evaluation: String,
    elaboration: String,
},
{
    timestamps: true,
}
);

export default mongoose.models.FinerAnswer || mongoose.model("FinerAnswer", finerAnswerSchema);