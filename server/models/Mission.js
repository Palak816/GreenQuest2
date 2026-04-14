const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  type: { type: String, enum: ['quiz', 'game', 'social'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  status: { type: String, enum: ['active', 'expired'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Mission', missionSchema);
