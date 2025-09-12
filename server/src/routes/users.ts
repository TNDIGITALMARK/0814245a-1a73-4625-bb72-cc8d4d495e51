import express from 'express';
import User from '../models/User';
import { authenticate, checkResourceOwnership } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-email -socialMedia')
    .populate('achievements.achievementId', 'title icon difficulty');

  if (!user || !user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @route   GET /api/users/:id/friends
// @desc    Get user's friends list
// @access  Private (own friends) / Public (if user allows)
router.get('/:id/friends', authenticate, checkResourceOwnership('id'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('friends', 'username avatar stats.gamesPlayed stats.highestScore');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { friends: user.friends }
  });
}));

export default router;