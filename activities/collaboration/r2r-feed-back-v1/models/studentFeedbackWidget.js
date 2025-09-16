import mongoose, { Schema } from "mongoose";

const studentFeedbackWidgetSchema = new Schema(
  {
    answerQ1: String,
    fbtool: String,
    activityName: String
  },
  {
    timestamps: true,
  }
);

const StudentFeedbackWidget = mongoose.models.StudentFeedbackWidget || mongoose.model("StudentFeedbackWidget", studentFeedbackWidgetSchema);

export default StudentFeedbackWidget;
