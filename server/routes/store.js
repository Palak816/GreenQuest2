const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const STORE_ITEMS = [
  { id: 'streak_freeze', name: 'Streak Freeze', type: 'consumable', price: 50, desc: 'Protects your streak if you miss a day.' },
  { id: 'avatar_tree', name: 'Grand Tree Avatar', type: 'cosmetic', price: 100, desc: 'A legendary tree avatar.', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'avatar_earth', name: 'Earth Avatar', type: 'cosmetic', price: 150, desc: 'The entire globe.', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=150&h=150' },
];

router.get('/items', protect, (req, res) => {
  res.json(STORE_ITEMS);
});

router.post('/buy', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const user = await User.findById(req.user.id);
    if (user.coins < item.price) return res.status(400).json({ message: 'Not enough coins' });
    
    // Check if already owns cosmetic
    if (item.type === 'cosmetic' && user.inventory.includes(item.id)) {
        return res.status(400).json({ message: 'Already own this item' });
    }

    user.coins -= item.price;
    user.inventory.push(item.id);
    
    // Auto equip avatar
    if (item.type === 'cosmetic') {
        user.avatar = item.img;
    }
    
    await user.save();
    res.json({ success: true, coins: user.coins, inventory: user.inventory, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/spin', protect, async (req, res) => {
  try {
    const SPIN_COST = 10;
    const user = await User.findById(req.user.id);
    if(user.coins < SPIN_COST) return res.status(400).json({ message: 'Need 10 coins to spin' });
    
    user.coins -= SPIN_COST;

    // Spin odds
    const roll = Math.random();
    let reward = 0;
    if (roll > 0.9) reward = 100;       // 10% chance for 100
    else if (roll > 0.7) reward = 50;   // 20% chance for 50
    else if (roll > 0.4) reward = 20;   // 30% chance for 20
    else if (roll > 0.1) reward = 5;    // 30% chance for 5
    else reward = 0;                    // 10% chance for 0

    user.coins += reward;
    await user.save();
    res.json({ success: true, reward, coins: user.coins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
