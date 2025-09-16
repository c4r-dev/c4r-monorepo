import mongoose, { Schema } from 'mongoose';

// Question Schema
const questionSchema = new Schema(
  {
    questionText: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
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
    questions: [questionSchema]
  },
  { _id: false }
);

// Section Schema (new)
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
  sections: [sectionSchema]
});

// Create model or use existing one
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;