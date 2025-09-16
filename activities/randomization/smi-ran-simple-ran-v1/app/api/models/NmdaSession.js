// File: models/nmdaSession.js
import mongoose, { Schema } from 'mongoose';

// Schema for a single move
const moveSchema = new Schema(
  {
    moveNumber: { type: Number, required: true },
    selectedOption: { type: String, required: true }, // 'A' or 'B'
    selectedTask: { type: String, required: true },
    selectedReason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false } // Prevent Mongoose from auto-creating _id for nested subdocuments
);

// Schema for the final state of a task
const taskStateSchema = new Schema(
  {
    team: { 
      type: String, 
      required: true,
      default: "unassigned" // Added default value to handle missing team
    },
    response: { type: String, default: '' }
  },
  { _id: false }
);

// Schema for move history
const taskHistorySchema = new Schema(
  {
    task1: { 
      type: [moveSchema], 
      default: [] 
    },
    task2: { 
      type: [moveSchema], 
      default: [] 
    },
    task3: { 
      type: [moveSchema], 
      default: [] 
    }
  },
  { _id: false }
);

// Schema for final state
const finalStateSchema = new Schema(
  {
    task1: { 
      type: taskStateSchema,
      default: () => ({ team: "unassigned", response: "" }) 
    },
    task2: { 
      type: taskStateSchema,
      default: () => ({ team: "unassigned", response: "" })
    },
    task3: { 
      type: taskStateSchema,
      default: () => ({ team: "unassigned", response: "" })
    }
  },
  { _id: false }
);

// Top-level schema for an NMDA session
const nmdaSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  moveHistory: {
    type: taskHistorySchema,
    default: () => ({
      task1: [],
      task2: [],
      task3: []
    })
  },
  finalState: {
    type: finalStateSchema,
    default: () => ({
      task1: { team: "unassigned", response: "" },
      task2: { team: "unassigned", response: "" },
      task3: { team: "unassigned", response: "" }
    })
  },
  timestamp: { type: Date, default: Date.now }
});

// Export the model
export default mongoose.models.NmdaSession || mongoose.model('NmdaSession', nmdaSessionSchema);