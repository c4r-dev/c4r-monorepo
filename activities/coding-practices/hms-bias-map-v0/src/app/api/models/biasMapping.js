import mongoose, { Schema } from "mongoose";

const biasMappingSchema = new Schema(
  {
    flow: String,
    sessionID: String,
    biasNumber: Number,
    submissionInstance: Number,
  },

  {
    timestamps: true,
  }
);
  
export default mongoose.models.BiasMapping || mongoose.model("BiasMapping", biasMappingSchema);
