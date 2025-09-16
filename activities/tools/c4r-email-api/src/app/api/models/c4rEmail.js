import mongoose, { Schema } from "mongoose";

const emailSchema = new Schema(
  {
    email: String,
  },
  {
    timestamps: true,
  }
);
  
export default mongoose.models.Email || mongoose.model("Email", emailSchema);
