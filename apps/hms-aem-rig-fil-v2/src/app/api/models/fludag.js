import mongoose, { Schema } from "mongoose";

const polioSchema = new Schema(
  {
    flow: String,
    description: String,
    groupId: String,
    userName: String,
    userId: String,
  },

  {
    timestamps: true,
  }
);
  
export default mongoose.models.Polio || mongoose.model("Polio", polioSchema);
