import express from 'express';
import Achievement from '../models/Achievement';
import { authenticate, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   GET /api/achievements
// @desc    Get all achievements
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { category, difficulty, type } = req.query;
  
  const filter: any = { 'visibility.isActive': true };
  
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (type) filter.type = type;

  // Hide secret achievements for non-authenticated users
  if (!req.user) {
    filter['visibility.isHidden'] = false;
  }

  const achievements = await Achievement.find(filter)
    .sort({ difficulty: 1, 'stats.completionRate': -1 });

  res.json({
    success: true,
    data: { achievements }
  });
}));

// @route   GET /api/achievements/user/:userId
// @desc    Get user's achievements with progress
// @access  Public
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({ 'visibility.isActive': true })
    .populate({
      path: 'stats.firstUnlockedBy',
      select: 'username'
    });

  // This would need user stats to calculate progress
  // For now, return achievements with basic info
  res.json({
    success: true,
    data: { achievements }
  });
}));

export default router;