import mongoose, { Schema } from "mongoose";

// Define the structure for individual nodes within the flowchart
const nodeSchema = new Schema({
  label: { type: String, required: true }, // Text content of the node
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  // Add other node-specific properties if needed in the future
}, {_id: false}); // Don't create separate IDs for subdocuments by default

// Define the main schema for saving the randomization flowchart state
const randomizationNodesSchema = new Schema(
  {
    // Array of nodes placed on the canvas (excluding background)
    nodes: [nodeSchema],
    // Placeholder for submission identifier
    submissionID: { type: String, required: true, default: 'placeholder-submission' },
    // Placeholder for session identifier
    sessionID: { type: String, required: true, default: 'placeholder-session' },
    // Timestamp is automatically handled by timestamps: true
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the Mongoose model
// Checks if the model already exists before creating it to prevent overwrite errors during hot-reloading
export default mongoose.models.RandomizationNodes || mongoose.model("RandomizationNodes", randomizationNodesSchema);
