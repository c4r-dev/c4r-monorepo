import mongoose, { Schema } from 'mongoose';

const hypothesisSchema = new Schema({
  sessionID: {
    type: String,
    required: true
  },
  grpID: {
    type: String,
    required: true
  },
  users: [
    {
      userID: {
        type: String,
        required: true
      },
      hypNumber: {
        type: Number,
        required: true
      },
      hypDesc: {
        type: String,
        required: true
      },
      q1: {
        type: String,
        required: false
      },
      q2: {
        type: String,
        required: false
      },
      q3: {
        type: String,
        required: false
      },
      hyp1: {
        type: String,
        required: false
      },
      hyp2: {
        type: String,
        required: false
      },
      hyp3: {
        type: String,
        required: false
      },
      __v: {
        type: Number,
        select: false, // Optional: Hide this field by default in queries
        default: 0
      }
    }
  ]
});

export default mongoose.models.Hypothesis || mongoose.model('Hypothesis', hypothesisSchema);
