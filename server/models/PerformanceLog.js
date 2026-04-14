const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, enum: ['quiz', 'game'], required: true },
  activityId: { type: String },
  score: { type: Number },
  timeSpent: { type: Number }, // in seconds
  errorsCount: { type: Number, default: 0 },
  latency: [{ type: Number }], // array of response times per question
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);
