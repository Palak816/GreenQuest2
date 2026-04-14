const mongoose = require('mongoose');
const quizQuestionSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  question: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'TF', 'FillBlank'], default: 'MCQ' },
  options: [{ type: String }],
  answer: { type: String, required: true },
  hint: { type: String }
});
module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);