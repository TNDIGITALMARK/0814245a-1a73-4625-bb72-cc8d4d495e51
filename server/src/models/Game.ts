import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  thumbnail: string;
  screenshots: string[];
  gameData: {
    type: 'canvas' | 'html' | 'phaser' | 'pixi';
    entryPoint: string;
    assets: Array<{
      type: 'image' | 'audio' | 'video' | 'json' | 'script';
      url: string;
      name: string;
      size?: number;
    }>;
    config: {
      width: number;
      height: number;
      responsive: boolean;
      fullscreen: boolean;
      controls: Array<{
        key: string;
        action: string;
        description: string;
      }>;
      difficulty: string[];
      multiplayer: boolean;
      maxPlayers?: number;
    };
  };
  metadata: {
    developer: string;
    version: string;
    releaseDate: Date;
    lastUpdated: Date;
    fileSize: number;
    platform: string[];
    minAge: number;
    language: string[];
  };
  stats: {
    totalPlays: number;
    uniquePlayers: number;
    averageRating: number;
    totalRatings: number;
    averagePlayTime: number;
    completionRate: number;
    highScore: number;
    averageScore: number;
    lastPlayed: Date;
  };
  ratings: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
  }>;
  leaderboard: {
    type: 'score' | 'time' | 'level';
    sortOrder: 'desc' | 'asc';
    resetPeriod?: 'daily' | 'weekly' | 'monthly' | 'never';
    lastReset?: Date;
  };
  features: {
    singlePlayer: boolean;
    multiPlayer: boolean;
    achievements: boolean;
    leaderboards: boolean;
    socialSharing: boolean;
    saveProgress: boolean;
    customization: boolean;
  };
  monetization: {
    isPremium: boolean;
    price?: number;
    inAppPurchases: boolean;
    advertisements: boolean;
  };
  accessibility: {
    colorBlindSupport: boolean;
    keyboardOnly: boolean;
    screenReaderSupport: boolean;
    subtitles: boolean;
    customControls: boolean;
  };
  performance: {
    averageFPS: number;
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['action', 'puzzle', 'arcade', 'strategy', 'casual', 'adventure', 'racing', 'sports']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required']
  },
  screenshots: [{
    type: String,
    validate: {
      validator: function(v: string[]) {
        return v.length <= 10;
      },
      message: 'Cannot have more than 10 screenshots'
    }
  }],
  gameData: {
    type: {
      type: String,
      enum: ['canvas', 'html', 'phaser', 'pixi'],
      required: true
    },
    entryPoint: {
      type: String,
      required: [true, 'Entry point is required']
    },
    assets: [{
      type: {
        type: String,
        enum: ['image', 'audio', 'video', 'json', 'script'],
        required: true
      },
      url: { type: String, required: true },
      name: { type: String, required: true },
      size: Number
    }],
    config: {
      width: { type: Number, required: true, min: 300, max: 1920 },
      height: { type: Number, required: true, min: 200, max: 1080 },
      responsive: { type: Boolean, default: true },
      fullscreen: { type: Boolean, default: false },
      controls: [{
        key: { type: String, required: true },
        action: { type: String, required: true },
        description: String
      }],
      difficulty: [{
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert']
      }],
      multiplayer: { type: Boolean, default: false },
      maxPlayers: { type: Number, min: 1, max: 8 }
    }
  },
  metadata: {
    developer: { type: String, required: true },
    version: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    lastUpdated: { type: Date, default: Date.now },
    fileSize: { type: Number, required: true },
    platform: [{
      type: String,
      enum: ['web', 'mobile', 'desktop']
    }],
    minAge: { type: Number, default: 13, min: 3, max: 18 },
    language: [{ type: String, default: ['en'] }]
  },
  stats: {
    totalPlays: { type: Number, default: 0 },
    uniquePlayers: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    averagePlayTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    highScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastPlayed: Date
  },
  ratings: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  leaderboard: {
    type: {
      type: String,
      enum: ['score', 'time', 'level'],
      default: 'score'
    },
    sortOrder: {
      type: String,
      enum: ['desc', 'asc'],
      default: 'desc'
    },
    resetPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'never'
    },
    lastReset: Date
  },
  features: {
    singlePlayer: { type: Boolean, default: true },
    multiPlayer: { type: Boolean, default: false },
    achievements: { type: Boolean, default: false },
    leaderboards: { type: Boolean, default: true },
    socialSharing: { type: Boolean, default: true },
    saveProgress: { type: Boolean, default: false },
    customization: { type: Boolean, default: false }
  },
  monetization: {
    isPremium: { type: Boolean, default: false },
    price: { type: Number, min: 0 },
    inAppPurchases: { type: Boolean, default: false },
    advertisements: { type: Boolean, default: false }
  },
  accessibility: {
    colorBlindSupport: { type: Boolean, default: false },
    keyboardOnly: { type: Boolean, default: true },
    screenReaderSupport: { type: Boolean, default: false },
    subtitles: { type: Boolean, default: false },
    customControls: { type: Boolean, default: false }
  },
  performance: {
    averageFPS: { type: Number, default: 60 },
    loadTime: { type: Number, default: 2000 }, // milliseconds
    memoryUsage: { type: Number, default: 0 }, // MB
    cpuUsage: { type: Number, default: 0 } // percentage
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
GameSchema.index({ category: 1, isActive: 1 });
GameSchema.index({ 'stats.averageRating': -1 });
GameSchema.index({ 'stats.totalPlays': -1 });
GameSchema.index({ isFeatured: 1, isActive: 1 });
GameSchema.index({ tags: 1 });
GameSchema.index({ createdAt: -1 });
GameSchema.index({ title: 'text', description: 'text' });

// Update average rating when ratings change
GameSchema.pre<IGame>('save', function(next) {
  if (this.isModified('ratings')) {
    if (this.ratings.length > 0) {
      const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
      this.stats.averageRating = Number((totalRating / this.ratings.length).toFixed(2));
      this.stats.totalRatings = this.ratings.length;
    }
  }
  next();
});

const Game = mongoose.model<IGame>('Game', GameSchema);

export default Game;