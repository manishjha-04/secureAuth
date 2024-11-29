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

// Get all users (admin and moderator)
router.get('/users',
  authenticate,
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      let users;
      if (req.user.role === 'moderator') {
        // Moderators can only see regular users
        users = await User.find({ role: 'user' }).select('-password -__v');
      } else {
        // Admins can see all users
        users = await User.find().select('-password -__v');
      }
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

// Delete user (admin and moderator)
router.delete('/users/:id',
  authenticate,
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      // Get the user to be deleted
      const userToDelete = await User.findById(req.params.id);
      
      if (!userToDelete) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Moderators can only delete regular users
      if (req.user.role === 'moderator' && userToDelete.role !== 'user') {
        return res.status(403).json({ 
          message: 'Moderators can only delete regular users' 
        });
      }

      // Admin can delete any user except themselves
      if (req.user.role === 'admin' && req.user._id.toString() === req.params.id) {
        return res.status(403).json({ 
          message: 'Admins cannot delete their own account' 
        });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 