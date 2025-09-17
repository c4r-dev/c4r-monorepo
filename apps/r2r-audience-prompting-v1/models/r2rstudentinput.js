import mongoose, { Schema } from "mongoose";

const r2rstudentinputSchema = new Schema(
  {
    answerQ1: String,
  },

  {
    timestamps: true,
  }
);

const R2rStudentInput = mongoose.models.R2rStudentInput || mongoose.model("R2rStudentInput", r2rstudentinputSchema);

export default R2rStudentInput;
