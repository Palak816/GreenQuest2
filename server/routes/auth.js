const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');


// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ username, email, password, role });
    await user.save();

    
    const now = new Date();
    const last = user.lastActive ? new Date(user.lastActive) : new Date(0);
    const msInDay = 1000 * 60 * 60 * 24;
    const daysSince = Math.floor(now.getTime() / msInDay) - Math.floor(last.getTime() / msInDay);

    if (daysSince === 1) {
       // Logged in exactly next day
       user.streak = (user.streak || 0) + 1;
    } else if (daysSince > 1) {
       // Missed a day. Check for streak freeze
       if (user.inventory && user.inventory.includes('streak_freeze')) {
          // Consume freeze
          user.inventory = user.inventory.filter(i => i !== 'streak_freeze');
          // Keep streak the same, but they spent a freeze
       } else {
          // Reset streak
          user.streak = 1; 
       }
    } else if (daysSince === 0 && !user.streak) {
       // first time today
       user.streak = 1;
    }
    user.lastActive = now;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email, role: user.role, avatar: user.avatar, xp: user.xp, level: user.level, streak: user.streak, coins: user.coins, league: user.league } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email, role: user.role, avatar: user.avatar, xp: user.xp, level: user.level, streak: user.streak, coins: user.coins, league: user.league } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Google Login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({
            username: name,
            email: email,
            googleId: googleId,
            avatar: picture
        });
        await user.save();
    } else if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar === 'default_avatar.png' ? picture : user.avatar;
        await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ 
        token, 
        user: { 
            id: user._id, 
            username: user.username, 
            email: user.email, 
            role: user.role,
            avatar: user.avatar,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            coins: user.coins,
            league: user.league
        } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
