const express = require('express');
const router = express.Router();
const questions = require('../data/questions');

router.get('/quizzes', (req, res) => {
  // Shuffle questions and select 5 random ones
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  
  res.json(selected);
});

router.post('/user/progress', (req, res) => {
  const { userId, points } = req.body;
  // In a real app, we would save this to the database
  console.log('User earned points');
  res.json({ success: true, points });
});

module.exports = router;
