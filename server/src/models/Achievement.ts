import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  icon: string;
  category: string;
  type: 'score' | 'plays' | 'time' | 'level' | 'streak' | 'social' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirements: {
    condition: string; // e.g., 'score_greater_than', 'games_played', 'consecutive_days'
    value: number;
    gameId?: mongoose.Types.ObjectId; // specific to a game or global
    timeframe?: number; // in days, if time-based
    additionalData?: any; // flexible field for complex requirements
  };
  rewards: {
    points: number;
    badges: string[];
    unlockables?: string[];
    title?: string;
  };
  stats: {
    totalUnlocks: number;
    uniqueHolders: number;
    firstUnlockedBy?: mongoose.Types.ObjectId;
    firstUnlockedAt?: Date;
    averageTimeToUnlock: number; // in days
    completionRate: number; // percentage of active users who have this
  };
  rarity: {
    level: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    percentage: number; // what percentage of players have this
  };
  visibility: {
    isHidden: boolean; // secret achievements
    isActive: boolean;
    requiresPreviousAchievement?: mongoose.Types.ObjectId;
    minimumLevel?: number;
  };
  progression: {
    isProgressive: boolean; // can be partially completed
    maxProgress: number;
    milestones?: Array<{
      progress: number;
      reward: string;
      description: string;
    }>;
  };
  social: {
    isShareable: boolean;
    shareMessage: string;
    displayOnProfile: boolean;
  };
  metadata: {
    version: string;
    tags: string[];
    createdBy: mongoose.Types.ObjectId;
    validFrom?: Date;
    validUntil?: Date; // for limited-time achievements
    relatedAchievements: mongoose.Types.ObjectId[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Achievement icon is required']
  },
  category: {
    type: String,
    required: [true, 'Achievement category is required'],
    enum: [
      'gameplay', 'social', 'progression', 'exploration', 'mastery', 
      'collection', 'competitive', 'creative', 'seasonal', 'milestone'
    ]
  },
  type: {
    type: String,
    enum: ['score', 'plays', 'time', 'level', 'streak', 'social', 'special'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    required: true
  },
  requirements: {
    condition: {
      type: String,
      required: true,
      enum: [
        'score_greater_than',
        'score_less_than',
        'games_played',
        'consecutive_days',
        'total_time_played',
        'level_reached',
        'achievements_unlocked',
        'friends_added',
        'games_shared',
        'perfect_score',
        'no_deaths',
        'speed_run',
        'combo_achieved',
        'custom'
      ]
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game'
    },
    timeframe: {
      type: Number,
      min: 1
    },
    additionalData: Schema.Types.Mixed
  },
  rewards: {
    points: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    badges: [String],
    unlockables: [String],
    title: String
  },
  stats: {
    totalUnlocks: { type: Number, default: 0 },
    uniqueHolders: { type: Number, default: 0 },
    firstUnlockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    firstUnlockedAt: Date,
    averageTimeToUnlock: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 }
  },
  rarity: {
    level: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  visibility: {
    isHidden: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    requiresPreviousAchievement: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    minimumLevel: { type: Number, min: 1 }
  },
  progression: {
    isProgressive: { type: Boolean, default: false },
    maxProgress: { type: Number, default: 1, min: 1 },
    milestones: [{
      progress: {
        type: Number,
        required: true,
        min: 1
      },
      reward: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    }]
  },
  social: {
    isShareable: { type: Boolean, default: true },
    shareMessage: {
      type: String,
      default: 'I just unlocked a new achievement!'
    },
    displayOnProfile: { type: Boolean, default: true }
  },
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    tags: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    validFrom: Date,
    validUntil: Date,
    relatedAchievements: [{
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    }]
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for performance
AchievementSchema.index({ category: 1, isActive: 1 });
AchievementSchema.index({ type: 1, difficulty: 1 });
AchievementSchema.index({ 'requirements.gameId': 1 });
AchievementSchema.index({ 'rarity.level': 1 });
AchievementSchema.index({ 'visibility.isHidden': 1, 'visibility.isActive': 1 });
AchievementSchema.index({ 'stats.completionRate': 1 });

// Text search index
AchievementSchema.index({ 
  title: 'text', 
  description: 'text', 
  'metadata.tags': 'text' 
});

// Calculate rarity percentage when stats change
AchievementSchema.pre<IAchievement>('save', function(next) {
  if (this.isModified('stats.uniqueHolders')) {
    // This would need total active users count from somewhere
    // For now, we'll use a placeholder calculation
    this.rarity.percentage = Math.min((this.stats.uniqueHolders / 1000) * 100, 100);
    
    // Update rarity level based on percentage
    if (this.rarity.percentage >= 50) {
      this.rarity.level = 'common';
    } else if (this.rarity.percentage >= 20) {
      this.rarity.level = 'uncommon';
    } else if (this.rarity.percentage >= 5) {
      this.rarity.level = 'rare';
    } else if (this.rarity.percentage >= 1) {
      this.rarity.level = 'epic';
    } else {
      this.rarity.level = 'legendary';
    }
  }
  next();
});

// Method to check if user meets requirements
AchievementSchema.methods.checkRequirements = function(userStats: any, gameStats?: any) {
  const { condition, value, gameId, timeframe } = this.requirements;
  
  switch (condition) {
    case 'score_greater_than':
      return gameStats ? gameStats.highScore >= value : userStats.highestScore >= value;
    
    case 'games_played':
      return gameStats ? gameStats.totalPlays >= value : userStats.gamesPlayed >= value;
    
    case 'consecutive_days':
      return userStats.streak.current >= value;
    
    case 'total_time_played':
      return userStats.totalPlayTime >= value;
    
    case 'achievements_unlocked':
      return userStats.achievements.length >= value;
    
    case 'friends_added':
      return userStats.friends.length >= value;
    
    default:
      return false;
  }
};

// Method to calculate progress for progressive achievements
AchievementSchema.methods.calculateProgress = function(userStats: any, gameStats?: any): number {
  if (!this.progression.isProgressive) {
    return this.checkRequirements(userStats, gameStats) ? this.progression.maxProgress : 0;
  }

  const { condition, value } = this.requirements;
  
  switch (condition) {
    case 'score_greater_than':
      const currentScore = gameStats ? gameStats.highScore : userStats.highestScore;
      return Math.min(currentScore, value);
    
    case 'games_played':
      const gamesPlayed = gameStats ? gameStats.totalPlays : userStats.gamesPlayed;
      return Math.min(gamesPlayed, value);
    
    case 'consecutive_days':
      return Math.min(userStats.streak.current, value);
    
    default:
      return 0;
  }
};

const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default Achievement;