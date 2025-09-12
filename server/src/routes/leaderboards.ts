import express from 'express';
import Leaderboard from '../models/Leaderboard';
import { authenticate, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   GET /api/leaderboards/game/:gameId
// @desc    Get leaderboards for a specific game
// @access  Public
router.get('/game/:gameId', optionalAuth, asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const { type = 'global', limit = 50 } = req.query;

  const leaderboards = await Leaderboard.find({
    gameId,
    type,
    isActive: true
  })
  .sort({ 'stats.totalEntries': -1 })
  .limit(parseInt(limit as string))
  .populate('entries.userId', 'username avatar');

  res.json({
    success: true,
    data: { leaderboards }
  });
}));

// @route   POST /api/leaderboards/:id/submit
// @desc    Submit score to leaderboard
// @access  Private
router.post('/:id/submit', authenticate, asyncHandler(async (req, res) => {
  const { score, level, time, metadata } = req.body;

  if (!score || score < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid score is required'
    });
  }

  const leaderboard = await Leaderboard.findById(req.params.id);
  if (!leaderboard || !leaderboard.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Leaderboard not found'
    });
  }

  // Check if user is banned
  if (leaderboard.settings.bannedUsers.includes(req.user!._id)) {
    return res.status(403).json({
      success: false,
      message: 'You are banned from this leaderboard'
    });
  }

  const entryData = {
    userId: req.user!._id,
    username: req.user!.username,
    avatar: req.user!.avatar,
    score,
    level,
    time,
    metadata
  };

  await leaderboard.addEntry(entryData);

  const position = leaderboard.getUserPosition(req.user!._id);

  res.json({
    success: true,
    message: 'Score submitted successfully',
    data: {
      position,
      isPersonalBest: entryData.isPersonalBest
    }
  });
}));

export default router;