const mongoose = require('mongoose');
const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  title: { type: String, required: true },
  type: { type: String, enum: ['text', 'video', 'image'], default: 'text' },
  content: { type: String, required: true },
  order: { type: Number, required: true },
  xpReward: { type: Number, default: 50 }
});
module.exports = mongoose.model('Lesson', lessonSchema);