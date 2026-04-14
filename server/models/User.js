const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String, default: 'default_avatar.png' },
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  league: { type: String, default: 'Bronze' },
  inventory: [{ type: String }],
  role: { type: String, enum: ['student', 'educator', 'admin'], default: 'student' },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  achievements: [{
    title: String,
    dateEarned: { type: Date, default: Date.now }
  }],
  progress: [{
    module: String,
    score: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  unlockedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
