// models/Session.js
import mongoose, { Schema } from 'mongoose';

// Implementation Schema
const implementationSchema = new Schema(
  {
    implementationText: {
      type: String,
      default: '' // Empty string for skipped implementations
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Concern Card Schema
const concernCardSchema = new Schema(
  {
    cardId: {
      type: Number,
      required: true
    },
    cardText: {
      type: String,
      required: true,
      enum: [
        'Types of sterilization protocol',
        'Incubation Procedure',
        'Culture Sourcing',
        'Evaluation Timing',
        'Neuroserpin Processing',
        'Neuron Selection'
      ]
    },
    binAssignment: {
      type: String,
      required: true,
      enum: ['constrain', 'distribute', 'test']
    },
    implementation: implementationSchema
  },
  { _id: false }
);

// Student Schema
const studentSchema = new Schema(
  {
    studentId: {
      type: String,
      required: true
    },
    concernResponses: [concernCardSchema],
    completedAt: {
      type: Date,
      default: null // Will be set when all cards are placed
    }
  },
  { _id: false }
);

// Section Schema
const sectionSchema = new Schema(
  {
    sectionNumber: {
      type: Number,
      enum: [1, 2, 3],
      required: true
    },
    students: [studentSchema]
  },
  { _id: false }
);

// Session Schema (main document)
const sessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  sessionType: {
    type: String,
    enum: ['individual', 'group'],
    required: true
  },
  activityType: {
    type: String,
    default: 'concern-cards',
    enum: ['concern-cards', 'other-activity-types']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sections: [sectionSchema]
}, {
  timestamps: true,
  collection: 'sessions'
});

// Create model or use existing one
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;