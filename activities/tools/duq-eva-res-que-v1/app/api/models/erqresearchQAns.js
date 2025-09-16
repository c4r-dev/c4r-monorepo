import mongoose, { Schema } from "mongoose";

const erqresearchQAnsSchema = new Schema(
  {
    category: String,
    number: String,
    fbtool: String,
    questionAnswer: String,
  },

  {
    timestamps: true,
  }
);

export default mongoose.models.ErqresearchQAns || mongoose.model("ErqresearchQAns", erqresearchQAnsSchema);
