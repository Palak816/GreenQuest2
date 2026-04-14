const express = require('express');
const router = express.Router();
const questions = require('../data/questions');
const PerformanceLog = require('../models/PerformanceLog');
const User = require('../models/User');
const Mission = require('../models/Mission');
const Squad = require('../models/Squad');
const { protect, authorize } = require('../middleware/auth');

// Get Quizzes
router.get('/quizzes', protect, (req, res) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, 5));
});

// Log Performance Data (Telemetry)
router.post('/telemetry/log', protect, async (req, res) => {
  try {
    const { activityType, activityId, score, timeSpent, errorsCount, latency } = req.body;
    const log = new PerformanceLog({
      user: req.user.id,
      activityType,
      activityId,
      score,
      timeSpent,
      errorsCount,
      latency
    });
    await log.save();

    if (score > 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { points: score } });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const topUsers = await User.find().sort({ points: -1 }).limit(10).select('username points level');
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Phase 3: SOCIAL & IMPACT ---

// Create Squad
router.post('/squads', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const squad = new Squad({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id]
    });
    await squad.save();
    res.json(squad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join Squad
router.post('/squads/join/:id', protect, async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);
    if (!squad) return res.status(404).json({ message: 'Squad not found' });
    if (squad.members.includes(req.user.id)) return res.status(400).json({ message: 'Already a member' });

    squad.members.push(req.user.id);
    await squad.save();
    res.json(squad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Squad
router.get('/squads/mine', protect, async (req, res) => {
  try {
    const squad = await Squad.findOne({ members: req.user.id }).populate('members', 'username points');
    res.json(squad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Real-World Impact Sync
router.post('/impact/sync', protect, async (req, res) => {
  try {
    const { actionType, value } = req.body;
    // Logic to convert real-world action to points
    let points = 0;
    if (actionType === 'recycle') points = value * 5;
    if (actionType === 'energy_save') points = value * 10;

    await User.findByIdAndUpdate(req.user.id, { $inc: { points } });
    res.json({ success: true, pointsEarned: points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Educator Analytics ---

router.get('/analytics/class', protect, authorize('educator', 'admin'), async (req, res) => {
  try {
    const studentStats = await User.find({ role: 'student' }).select('username points level progress');
    const atRisk = studentStats.filter(s => s.points < 50);
    res.json({ studentStats, atRisk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
