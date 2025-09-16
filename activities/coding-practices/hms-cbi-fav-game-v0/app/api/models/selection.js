// import mongoose, { Schema } from 'mongoose';

// // Schema for a single round
// const roundSchema = new Schema(
//   {
//     round: { type: Number, required: true },
//     choice1: { type: String, required: true },
//     choice2: { type: String, required: true },
//     isChoice1Selected: { type: Boolean, default: false },
//     isChoice2Selected: { type: Boolean, default: false },
//     input: { type: String, default: '' }
//   },
//   { _id: false } // Prevent Mongoose from auto-creating _id for nested subdocuments
// );

// // Custom validator to ensure exactly 4 rounds per subsession
// function roundsArrayLimit(val) {
//   return val.length === 4;
// }

// // Schema for a subsession
// const subsessionSchema = new Schema(
//   {
//     subsessionId: { type: String, required: true },
//     biasText: { type: String, required: false },
//     rounds: {
//       type: [roundSchema],
//       required: true,
//       validate: {
//         validator: roundsArrayLimit,
//         message: '{PATH} must have exactly 4 rounds'
//       }
//     }
//   },
//   { _id: false }
// );

// // Top-level schema for a session
// const selectionsSchema = new Schema({
//   sessionId: { type: String, required: true },
//   subsessions: {
//     type: [subsessionSchema],
//     default: [] // In case you want to create the session document first
//   }
// });

// // Export the model
// export default mongoose.models.Selections || mongoose.model('Selections', selectionsSchema);

import mongoose, { Schema } from 'mongoose';

// Schema for a single round
const roundSchema = new Schema(
  {
    round: { type: Number, required: true },
    choice1: { type: String, required: true },
    choice2: { type: String, required: true },
    isChoice1Selected: { type: Boolean, default: false },
    isChoice2Selected: { type: Boolean, default: false },
    input: { type: String, default: '' }
  },
  { _id: false } // Prevent Mongoose from auto-creating _id for nested subdocuments
);

// Custom validator to ensure exactly 4 rounds per subsession
function roundsArrayLimit(val) {
  return val.length === 3;
}

// Schema for a subsession with the new "selectedMatchup" field.
// "selectedMatchup" will store a single round object.
const subsessionSchema = new Schema(
  {
    subsessionId: { type: String, required: true },
    biasText: { type: String, required: false },
    selectedMatchupBiasText: { type: Object, required: false },
    rounds: {
      type: [roundSchema],
      required: true,
      validate: {
        validator: roundsArrayLimit,
        message: '{PATH} must have exactly 3 rounds'
      }
    }
  },
  { _id: false }
);

// Top-level schema for a session
const selectionSchema = new Schema({
  sessionId: { type: String, required: true },
  subsessions: {
    type: [subsessionSchema],
    default: [] // In case you want to create the session document first
  }
});

// Export the model (using the name "Selections")
export default mongoose.models.Selection || mongoose.model('Selection', selectionSchema);

