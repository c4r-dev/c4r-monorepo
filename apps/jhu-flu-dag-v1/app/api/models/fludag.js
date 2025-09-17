import mongoose, { Schema } from "mongoose";

const fludagSchema = new Schema(
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

export default mongoose.models.FluDag || mongoose.model("FluDag", fludagSchema);
