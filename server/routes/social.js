const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const ActivityFeed = require('../models/ActivityFeed');
const { protect } = require('../middleware/auth');

// Search users
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if(!q) return res.json([]);
    const users = await User.find({ username: { $regex: q, $options: 'i' } })
            .select('username avatar level league points')
            .limit(10);
    res.json(users);
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

// Follow
router.post('/follow', protect, async (req, res) => {
  try {
    const { followId } = req.body;
    const existing = await Friendship.findOne({ requester: req.user.id, recipient: followId });
    if (existing) return res.status(400).json({message: 'Already following'});

    await Friendship.create({ requester: req.user.id, recipient: followId, status: 'accepted' });
    
    // Create activity
    const user = await User.findById(req.user.id);
    const followed = await User.findById(followId);

    await ActivityFeed.create({
       user: req.user.id,
       actionType: 'follow',
       description: `started following ${followed.username}.`
    });

    res.json({success: true});
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

// Get Feed
router.get('/feed', protect, async (req, res) => {
  try {
     // Global feed for MVP
     const feeds = await ActivityFeed.find().sort('-createdAt').limit(20).populate('user', 'username avatar level');
     res.json(feeds);
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

module.exports = router;
