import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
  score: number;
  level?: number;
  time?: number; // completion time in milliseconds
  metadata?: {
    difficulty?: string;
    gameMode?: string;
    achievements?: string[];
    powerUpsUsed?: number;
    accuracy?: number;
    combo?: number;
  };
  submittedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'flagged';
  isPersonalBest: boolean;
}

export interface ILeaderboard extends Document {
  _id: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'global' | 'weekly' | 'monthly' | 'daily' | 'friends';
  category: 'score' | 'time' | 'level' | 'custom';
  sortOrder: 'desc' | 'asc';
  maxEntries: number;
  entries: ILeaderboardEntry[];
  filters: {
    difficulty?: string[];
    gameMode?: string[];
    minLevel?: number;
    timeRange?: {
      start: Date;
      end: Date;
    };
  };
  rewards: Array<{
    position: number;
    type: 'badge' | 'points' | 'achievement';
    value: string | number;
    description: string;
  }>;
  settings: {
    allowDuplicates: boolean;
    requireVerification: boolean;
    autoReset: boolean;
    resetFrequency?: 'daily' | 'weekly' | 'monthly';
    minimumPlays: number;
    bannedUsers: mongoose.Types.ObjectId[];
  };
  stats: {
    totalEntries: number;
    uniquePlayers: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    lastUpdated: Date;
    resetCount: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReset?: Date;
  nextReset?: Date;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: String,
  score: {
    type: Number,
    required: true,
    min: 0
  },
  level: {
    type: Number,
    min: 1
  },
  time: {
    type: Number,
    min: 0
  },
  metadata: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert']
    },
    gameMode: String,
    achievements: [String],
    powerUpsUsed: { type: Number, default: 0 },
    accuracy: { type: Number, min: 0, max: 100 },
    combo: { type: Number, min: 0 }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'flagged'],
    default: 'pending'
  },
  isPersonalBest: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const LeaderboardSchema = new Schema<ILeaderboard>({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Leaderboard name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['global', 'weekly', 'monthly', 'daily', 'friends'],
    default: 'global'
  },
  category: {
    type: String,
    enum: ['score', 'time', 'level', 'custom'],
    default: 'score'
  },
  sortOrder: {
    type: String,
    enum: ['desc', 'asc'],
    default: 'desc'
  },
  maxEntries: {
    type: Number,
    default: 100,
    min: 10,
    max: 1000
  },
  entries: [LeaderboardEntrySchema],
  filters: {
    difficulty: [{
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert']
    }],
    gameMode: [String],
    minLevel: { type: Number, min: 1 },
    timeRange: {
      start: Date,
      end: Date
    }
  },
  rewards: [{
    position: {
      type: Number,
      required: true,
      min: 1
    },
    type: {
      type: String,
      enum: ['badge', 'points', 'achievement'],
      required: true
    },
    value: Schema.Types.Mixed,
    description: {
      type: String,
      required: true
    }
  }],
  settings: {
    allowDuplicates: { type: Boolean, default: false },
    requireVerification: { type: Boolean, default: false },
    autoReset: { type: Boolean, default: false },
    resetFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    minimumPlays: { type: Number, default: 1, min: 1 },
    bannedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  stats: {
    totalEntries: { type: Number, default: 0 },
    uniquePlayers: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    resetCount: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  lastReset: Date,
  nextReset: Date
}, {
  timestamps: true
});

// Indexes for performance
LeaderboardSchema.index({ gameId: 1, type: 1 });
LeaderboardSchema.index({ 'entries.score': -1 });
LeaderboardSchema.index({ 'entries.userId': 1 });
LeaderboardSchema.index({ 'entries.submittedAt': -1 });
LeaderboardSchema.index({ isActive: 1 });

// Compound index for filtering
LeaderboardSchema.index({ 
  gameId: 1, 
  type: 1, 
  category: 1, 
  isActive: 1 
});

// Update stats when entries change
LeaderboardSchema.pre<ILeaderboard>('save', function(next) {
  if (this.isModified('entries')) {
    const verifiedEntries = this.entries.filter(entry => 
      entry.verificationStatus === 'verified' || !this.settings.requireVerification
    );

    this.stats.totalEntries = this.entries.length;
    this.stats.uniquePlayers = new Set(verifiedEntries.map(entry => entry.userId.toString())).size;
    
    if (verifiedEntries.length > 0) {
      const scores = verifiedEntries.map(entry => entry.score);
      this.stats.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      this.stats.highestScore = Math.max(...scores);
      this.stats.lowestScore = Math.min(...scores);
    }
    
    this.stats.lastUpdated = new Date();
  }
  next();
});

// Method to add entry to leaderboard
LeaderboardSchema.methods.addEntry = function(entryData: Partial<ILeaderboardEntry>) {
  const entry: ILeaderboardEntry = {
    userId: entryData.userId!,
    username: entryData.username!,
    avatar: entryData.avatar,
    score: entryData.score!,
    level: entryData.level,
    time: entryData.time,
    metadata: entryData.metadata,
    submittedAt: new Date(),
    verificationStatus: this.settings.requireVerification ? 'pending' : 'verified',
    isPersonalBest: false
  };

  // Check if it's a personal best
  const userEntries = this.entries.filter(e => e.userId.toString() === entry.userId.toString());
  if (userEntries.length === 0) {
    entry.isPersonalBest = true;
  } else {
    const bestScore = this.sortOrder === 'desc' 
      ? Math.max(...userEntries.map(e => e.score))
      : Math.min(...userEntries.map(e => e.score));
    
    entry.isPersonalBest = this.sortOrder === 'desc' 
      ? entry.score > bestScore 
      : entry.score < bestScore;
  }

  // Remove old entry if duplicates not allowed
  if (!this.settings.allowDuplicates) {
    this.entries = this.entries.filter(e => e.userId.toString() !== entry.userId.toString());
  }

  // Add new entry
  this.entries.push(entry);

  // Sort entries
  this.entries.sort((a, b) => {
    if (this.sortOrder === 'desc') {
      return b.score - a.score;
    } else {
      return a.score - b.score;
    }
  });

  // Limit entries to maxEntries
  if (this.entries.length > this.maxEntries) {
    this.entries = this.entries.slice(0, this.maxEntries);
  }

  return this.save();
};

// Method to get user position
LeaderboardSchema.methods.getUserPosition = function(userId: mongoose.Types.ObjectId) {
  const index = this.entries.findIndex(entry => entry.userId.toString() === userId.toString());
  return index === -1 ? null : index + 1;
};

// Method to reset leaderboard
LeaderboardSchema.methods.reset = function() {
  this.entries = [];
  this.stats.totalEntries = 0;
  this.stats.uniquePlayers = 0;
  this.stats.averageScore = 0;
  this.stats.highestScore = 0;
  this.stats.lowestScore = 0;
  this.stats.resetCount += 1;
  this.lastReset = new Date();
  
  // Set next reset date
  if (this.settings.autoReset && this.settings.resetFrequency) {
    const now = new Date();
    switch (this.settings.resetFrequency) {
      case 'daily':
        this.nextReset = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        this.nextReset = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }
  }

  return this.save();
};

const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);

export default Leaderboard;