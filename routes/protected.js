const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Protected route for all authenticated users
router.get('/profile', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Protected route for moderators and admins
router.get('/moderate', 
  authenticate, 
  authorize('moderator', 'admin'),
  (req, res) => {
    res.json({ message: 'Moderator access granted' });
  }
);

// Protected route for admins only
router.get('/admin', 
  authenticate, 
  authorize('admin'),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);

// Get all users (admin only)
router.get('/users',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const users = await User.find({}, '-password -__v').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update user role (admin only)
router.put('/users/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: '-password -__v' }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 