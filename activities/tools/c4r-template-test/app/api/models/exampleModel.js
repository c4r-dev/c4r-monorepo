import mongoose, { Schema } from "mongoose";

const exampleModelSchema = new Schema(
  {
    sessionID: String,
    exampleInteger: Number,
    exampleString: String,
    exampleBoolean: Boolean,
    exampleArray: [String],
    exampleObject: {
      exampleNestedString: String,
      exampleNestedNumber: Number,
    },
  },

  {
    timestamps: true,
  }
);
  
export default mongoose.models.ExampleModel || mongoose.model("ExampleModel", exampleModelSchema);
