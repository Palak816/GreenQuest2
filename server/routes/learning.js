const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const QuizQuestion = require('../models/QuizQuestion');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/modules', protect, async (req, res) => {
  try {
    const modules = await Module.find().sort('order');
    const enriched = [];
    for(let m of modules) {
       const lessons = await Lesson.find({ moduleId: m._id }).sort('order');
       enriched.push({ ...m.toObject(), lessons });
    }
    res.json(enriched);
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

router.get('/modules/:id', protect, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    const lessons = await Lesson.find({ moduleId: mod._id }).sort('order');
    res.json({ ...mod.toObject(), lessons });
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

router.get('/lessons/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    res.json(lesson);
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

router.get('/modules/:id/quiz', protect, async (req, res) => {
  try {
    const q = await QuizQuestion.find({ moduleId: req.params.id });
    res.json(q);
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

router.post('/complete-lesson', protect, async (req, res) => {
    try {
      const { lessonId, xpReward } = req.body;
      const user = await User.findById(req.user.id);
      
      const alreadyCompleted = user.progress && user.progress.find(p => p.module === lessonId);
      if (!alreadyCompleted) {
         user.progress.push({ module: lessonId, score: xpReward });
         user.xp += xpReward;
         user.coins += 5; // Bonus coins
         await user.save();
      }
      res.json({ success: true, xp: user.xp, coins: user.coins });
    } catch(err) {
      res.status(500).json({message: err.message});
    }
});

module.exports = router;
