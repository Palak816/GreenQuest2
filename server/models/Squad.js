const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  collectivePoints: { type: Number, default: 0 },
  milestones: [{
    title: String,
    targetPoints: Number,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Squad', squadSchema);
