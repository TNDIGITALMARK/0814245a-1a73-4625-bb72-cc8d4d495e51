import express from 'express';
import Joi from 'joi';
import Game from '../models/Game';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Validation schemas
const createGameSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  shortDescription: Joi.string().min(10).max(200).required(),
  category: Joi.string().valid('action', 'puzzle', 'arcade', 'strategy', 'casual', 'adventure', 'racing', 'sports').required(),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  thumbnail: Joi.string().uri().required(),
  screenshots: Joi.array().items(Joi.string().uri()).max(10),
  gameData: Joi.object({
    type: Joi.string().valid('canvas', 'html', 'phaser', 'pixi').required(),
    entryPoint: Joi.string().required(),
    config: Joi.object({
      width: Joi.number().min(300).max(1920).required(),
      height: Joi.number().min(200).max(1080).required(),
      responsive: Joi.boolean().default(true),
      fullscreen: Joi.boolean().default(false),
      controls: Joi.array().items(Joi.object({
        key: Joi.string().required(),
        action: Joi.string().required(),
        description: Joi.string()
      })),
      difficulty: Joi.array().items(Joi.string().valid('easy', 'medium', 'hard', 'expert')),
      multiplayer: Joi.boolean().default(false),
      maxPlayers: Joi.number().min(1).max(8)
    }).required()
  }).required()
});

// @route   GET /api/games
// @desc    Get all games with filtering and pagination
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = { isActive: true, isApproved: true };
  
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  if (req.query.featured === 'true') {
    filter.isFeatured = true;
  }
  
  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  if (req.query.tags) {
    const tags = (req.query.tags as string).split(',');
    filter.tags = { $in: tags };
  }

  // Build sort object
  let sort: any = { createdAt: -1 };
  
  switch (req.query.sort) {
    case 'rating':
      sort = { 'stats.averageRating': -1 };
      break;
    case 'popular':
      sort = { 'stats.totalPlays': -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'oldest':
      sort = { createdAt: 1 };
      break;
  }

  const [games, total] = await Promise.all([
    Game.find(filter)
      .select('-gameData.assets -ratings')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username avatar'),
    Game.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/games/featured
// @desc    Get featured games
// @access  Public
router.get('/featured', asyncHandler(async (req, res) => {
  const games = await Game.find({ 
    isActive: true, 
    isApproved: true, 
    isFeatured: true 
  })
  .select('-gameData.assets -ratings')
  .sort({ 'stats.totalPlays': -1 })
  .limit(6)
  .populate('createdBy', 'username avatar');

  res.json({
    success: true,
    data: { games }
  });
}));

// @route   GET /api/games/categories
// @desc    Get game categories with counts
// @access  Public
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Game.aggregate([
    {
      $match: { isActive: true, isApproved: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageRating: { $avg: '$stats.averageRating' },
        totalPlays: { $sum: '$stats.totalPlays' }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        averageRating: { $round: ['$averageRating', 2] },
        totalPlays: 1,
        _id: 0
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json({
    success: true,
    data: { categories }
  });
}));

// @route   GET /api/games/:id
// @desc    Get single game by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id)
    .populate('createdBy', 'username avatar profile.firstName profile.lastName')
    .populate('ratings.userId', 'username avatar');

  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }

  if (!game.isActive || !game.isApproved) {
    if (!req.user || (req.user._id.toString() !== game.createdBy._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
  }

  res.json({
    success: true,
    data: { game }
  });
}));

// @route   POST /api/games
// @desc    Create a new game
// @access  Private
router.post('/', authenticate, asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = createGameSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  // Create game
  const game = new Game({
    ...value,
    createdBy: req.user!._id,
    metadata: {
      developer: req.user!.username,
      version: '1.0.0',
      releaseDate: new Date(),
      fileSize: 0,
      platform: ['web'],
      minAge: 13,
      language: ['en']
    }
  });

  await game.save();
  await game.populate('createdBy', 'username avatar');

  res.status(201).json({
    success: true,
    message: 'Game created successfully',
    data: { game }
  });
}));

// @route   POST /api/games/:id/play
// @desc    Record a game play session
// @access  Private
router.post('/:id/play', authenticate, asyncHandler(async (req, res) => {
  const { score, time, level, difficulty } = req.body;

  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }

  // Update game stats
  game.stats.totalPlays += 1;
  game.stats.lastPlayed = new Date();
  
  if (score && score > game.stats.highScore) {
    game.stats.highScore = score;
  }

  // Update average score
  if (score) {
    const totalScore = game.stats.averageScore * (game.stats.totalPlays - 1) + score;
    game.stats.averageScore = Math.round(totalScore / game.stats.totalPlays);
  }

  // Update average play time
  if (time) {
    const totalTime = game.stats.averagePlayTime * (game.stats.totalPlays - 1) + time;
    game.stats.averagePlayTime = Math.round(totalTime / game.stats.totalPlays);
  }

  await game.save();

  // Update user stats
  const user = req.user!;
  user.stats.gamesPlayed += 1;
  user.stats.totalPlayTime += time || 0;
  
  if (score) {
    user.stats.totalScore += score;
    if (score > user.stats.highestScore) {
      user.stats.highestScore = score;
    }
  }

  // Update streak
  const today = new Date();
  const lastPlay = user.stats.streak.lastPlayDate;
  
  if (lastPlay) {
    const daysSinceLastPlay = Math.floor((today.getTime() - lastPlay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPlay === 1) {
      user.stats.streak.current += 1;
      if (user.stats.streak.current > user.stats.streak.longest) {
        user.stats.streak.longest = user.stats.streak.current;
      }
    } else if (daysSinceLastPlay > 1) {
      user.stats.streak.current = 1;
    }
  } else {
    user.stats.streak.current = 1;
  }

  user.stats.streak.lastPlayDate = today;
  await user.save();

  res.json({
    success: true,
    message: 'Game session recorded',
    data: {
      gameStats: game.stats,
      userStats: user.stats
    }
  });
}));

// @route   POST /api/games/:id/rate
// @desc    Rate a game
// @access  Private
router.post('/:id/rate', authenticate, asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }

  // Check if user already rated this game
  const existingRating = game.ratings.find(r => r.userId.toString() === req.user!._id.toString());
  
  if (existingRating) {
    existingRating.rating = rating;
    existingRating.review = review;
  } else {
    game.ratings.push({
      userId: req.user!._id,
      rating,
      review,
      createdAt: new Date()
    });
  }

  await game.save();

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      averageRating: game.stats.averageRating,
      totalRatings: game.stats.totalRatings
    }
  });
}));

export default router;