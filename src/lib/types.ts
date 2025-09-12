export interface Game {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: GameCategory;
  thumbnail?: string;
  difficulty: GameDifficulty;
  playCount: number;
  averageRating: number;
  dateCreated: Date;
  lastUpdated: Date;
  isNew?: boolean;
  isFeatured?: boolean;
  controls: GameControls;
  achievements?: Achievement[];
}

export type GameCategory = 
  | "Puzzle" 
  | "Arcade" 
  | "Strategy" 
  | "Action" 
  | "Card" 
  | "Board";

export type GameDifficulty = "Easy" | "Medium" | "Hard";

export interface GameControls {
  keyboard?: KeyboardControl[];
  touch?: TouchControl[];
  mouse?: MouseControl[];
}

export interface KeyboardControl {
  key: string;
  action: string;
}

export interface TouchControl {
  gesture: string;
  action: string;
}

export interface MouseControl {
  input: string;
  action: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  dateJoined: Date;
  lastLogin: Date;
  profilePicture?: string;
  preferences: UserPreferences;
  achievements: string[];
  gameStats: Record<string, GameStats>;
  isGuest?: boolean;
}

export interface UserPreferences {
  sound: boolean;
  notifications: boolean;
  theme: "light" | "dark" | "system";
  difficulty: GameDifficulty;
}

export interface GameStats {
  highScore: number;
  timePlayed: number; // in seconds
  lastPlayed: Date;
  completionCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "score" | "time" | "completion" | "special";
  requirement: AchievementRequirement;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface AchievementRequirement {
  type: "score" | "time" | "games_played" | "consecutive_wins" | "special";
  value: number;
  gameId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  date: Date;
  rank: number;
}

export interface Leaderboard {
  gameId: string;
  entries: LeaderboardEntry[];
  period: "daily" | "weekly" | "monthly" | "all_time";
}

export interface GameSession {
  id: string;
  gameId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  completed: boolean;
  achievements?: string[];
}