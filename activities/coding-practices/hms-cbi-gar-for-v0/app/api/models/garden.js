import mongoose from 'mongoose';

const gardenSchema = new mongoose.Schema({
  sessionID: { type: String, required: true, unique: true },
  userID: { type: String, required: true, unique: true },
  coefficient: { type: Number, required: true },
  hypothesis: { type: Number, required: true },
  // yVariables:
  //   {
  //     type: Array,
  //     required: true,
  //     default: []
  //   },
  // outcome: { type: String, required: true },
  yVariable: { type: String, required: true },
  xVariable: { type: String, required: true },
  version: { type: Number, required: true },
});


export default  mongoose.models.Garden || mongoose.model('Garden', gardenSchema);

