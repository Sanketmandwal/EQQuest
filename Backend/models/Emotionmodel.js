// models/EmotionSession.js
import mongoose from "mongoose";

const EmotionSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  frames: [
    {
      emotions: Object,
      timestamp: Date,
      metadata: Object,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const EmotionSession = mongoose.model("EmotionSession", EmotionSessionSchema);
export default EmotionSession