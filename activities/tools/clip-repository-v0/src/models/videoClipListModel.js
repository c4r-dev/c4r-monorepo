import mongoose from 'mongoose';
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});
export const VideoClipListCounter =
  mongoose.models.VideoClipListCounter ||
  mongoose.model('VideoClipListCounter', counterSchema);
async function getNextId(counterName) {
  const counter = await VideoClipListCounter.findByIdAndUpdate(
    counterName,
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true },
  );
  return `videoClipList-${counter.sequenceValue}`;
}
const videoClipListSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    videoTitle: {
      type: String,
    },
    videoDetailsText: {
      type: String,
    },
    videoKeywords: {
      type: String,
    },
    thumbnail: {
      type: Object,
    },
    videoLink: {
      type: String,
    },
    careerStage: {
      type: String,
    },
    fieldOfResearch: {
      type: String,
    },
    institutionSelector: {
      type: String,
    },
    rigorTopic: {
      type: String,
    },
    nextLink: {
      type: String,
    },
    registrationNo: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
videoClipListSchema.pre('save', async function (next) {
  if (!this.registrationNo) {
    this.registrationNo = await getNextId('videoClipListRegistrationCounter');
  }
  next();
});
const VideoClipList =
  mongoose.models.VideoClipList ||
  mongoose.model('VideoClipList', videoClipListSchema);
export default VideoClipList;
