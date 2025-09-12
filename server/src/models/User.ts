import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: Date;
    location?: string;
    preferences: {
      favoriteCategories: string[];
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      soundEnabled: boolean;
      notifications: boolean;
    };
  };
  stats: {
    gamesPlayed: number;
    totalScore: number;
    averageScore: number;
    highestScore: number;
    totalPlayTime: number; // in seconds
    lastActive: Date;
    streak: {
      current: number;
      longest: number;
      lastPlayDate: Date;
    };
  };
  achievements: Array<{
    achievementId: mongoose.Types.ObjectId;
    unlockedAt: Date;
    progress?: number;
  }>;
  friends: mongoose.Types.ObjectId[];
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    discord?: string;
  };
  isVerified: boolean;
  isActive: boolean;
  role: 'user' | 'moderator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    dateOfBirth: Date,
    location: String,
    preferences: {
      favoriteCategories: [{
        type: String,
        enum: ['action', 'puzzle', 'arcade', 'strategy', 'casual', 'adventure', 'racing', 'sports']
      }],
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
      },
      soundEnabled: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true }
    }
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastPlayDate: Date
    }
  },
  achievements: [{
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    progress: Number
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  socialMedia: {
    twitter: String,
    facebook: String,
    instagram: String,
    discord: String
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'stats.highestScore': -1 });
UserSchema.index({ 'stats.totalScore': -1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update average score when stats change
UserSchema.pre<IUser>('save', function(next) {
  if (this.isModified('stats.gamesPlayed') || this.isModified('stats.totalScore')) {
    if (this.stats.gamesPlayed > 0) {
      this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.gamesPlayed);
    }
  }
  next();
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;