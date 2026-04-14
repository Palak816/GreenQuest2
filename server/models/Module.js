const mongoose = require('mongoose');
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
});
module.exports = mongoose.model('Module', moduleSchema);