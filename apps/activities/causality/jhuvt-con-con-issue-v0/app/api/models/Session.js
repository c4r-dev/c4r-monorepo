// models/Session.js
import mongoose, { Schema } from 'mongoose';

// Round Schema
// const roundSchema = new Schema(
//   {
//     option: {
//       type: String,
//       required: true,
//       enum: ['adequate', 'inadequate']
//     },
//     response: {
//       type: String,
//       required: true
//     },
//     category: {
//       type: String,
//       required: false, // Only required for inadequate options
//       enum: [
//         'Imprecise negative control',
//         'Opportunity for bias',
//         'Covariates imbalanced',
//         'Missing positive control',
//         'Risk of underpowered study',
//         'Ungeneralizable sample',
//         'Other'
//       ],
//       default: null
//     }
//   },
//   { _id: false }
// );

const roundSchema = new Schema(
  {
    option: {
      type: String,
      enum: ['adequate', 'inadequate', ''],
      default: ''
    },
    response: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: [
        'Imprecise negative control',
        'Opportunity for bias',
        'Covariates imbalanced',
        'Missing positive control',
        'Risk of underpowered study',
        'Ungeneralizable sample',
        'Other',
        null
      ],
      default: null
    }
  },
  { _id: false }
);

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
        'Sterilization Protocol',
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
    sessionId: {
      type: String,
      required: true
    },
    studentId: {
      type: String,
      required: true
    },
    concernResponses: [concernCardSchema],
    rounds: {
      round1: roundSchema,
      round2: roundSchema,
      round3: roundSchema
    },
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