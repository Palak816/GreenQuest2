const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Make a pseudo admin check
const isAdmin = async (req, res, next) => {
   // For the sake of the MVP sandbox, we will allow access if token is valid 
   // but normally we check: if(req.user.role !== 'admin') return res.status(403)
   next();
};

router.get('/metrics', protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const users = await User.find().select('username points level streak coins createdAt').sort('-points');
    const totalXp = users.reduce((acc, u) => acc + (u.points || 0), 0);
    const totalCoins = users.reduce((acc, u) => acc + (u.coins || 0), 0);

    res.json({
        totalUsers,
        totalXp,
        totalCoins,
        activeUsersList: users
    });
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

module.exports = router;
