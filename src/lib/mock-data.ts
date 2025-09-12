// Mock data for the mini-games platform

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  rating: number;
  plays: number;
  releaseDate: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  instructions?: string;
  featured: boolean;
  isNew: boolean;
  tags: string[];
}

export interface GameCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gameCount: number;
}

export const gameCategories: GameCategory[] = [
  {
    id: "action",
    name: "Action",
    description: "Fast-paced games with excitement and thrills",
    icon: "⚔️",
    color: "from-red-500 to-red-600",
    gameCount: 45
  },
  {
    id: "puzzle",
    name: "Puzzle",
    description: "Brain-teasing challenges and logic games",
    icon: "🧩",
    color: "from-blue-500 to-blue-600",
    gameCount: 32
  },
  {
    id: "arcade",
    name: "Arcade",
    description: "Classic retro-style games and high scores",
    icon: "🕹️",
    color: "from-purple-500 to-purple-600",
    gameCount: 28
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Tactical thinking and planning games",
    icon: "♟️",
    color: "from-green-500 to-green-600",
    gameCount: 19
  },
  {
    id: "casual",
    name: "Casual",
    description: "Easy-going games for relaxation",
    icon: "☕",
    color: "from-yellow-500 to-yellow-600",
    gameCount: 56
  },
  {
    id: "adventure",
    name: "Adventure",
    description: "Explore worlds and embark on journeys",
    icon: "🗺️",
    color: "from-indigo-500 to-indigo-600",
    gameCount: 23
  }
];

const mockGames: Game[] = [
  {
    id: "puzzle-quest",
    title: "Puzzle Quest",
    description: "Match colorful blocks to create amazing chain reactions and score big points in this addictive puzzle adventure.",
    category: "puzzle",
    thumbnail: "/game-thumbnails/puzzle-quest.jpg",
    rating: 4.8,
    plays: 125430,
    releaseDate: "2024-01-15",
    difficulty: "medium",
    instructions: "Click on groups of 3 or more matching colored blocks to clear them. Create chain reactions for bonus points!",
    featured: true,
    isNew: false,
    tags: ["match-3", "colorful", "chain-reactions"]
  },
  {
    id: "neon-runner",
    title: "Neon Runner",
    description: "Race through neon-lit cyber landscapes at breakneck speeds. Avoid obstacles and collect power-ups in this high-octane runner.",
    category: "action",
    thumbnail: "/game-thumbnails/neon-runner.jpg",
    rating: 4.7,
    plays: 98765,
    releaseDate: "2024-02-03",
    difficulty: "hard",
    instructions: "Use arrow keys to move and jump. Collect neon orbs for speed boosts and avoid the red obstacles!",
    featured: true,
    isNew: false,
    tags: ["endless", "neon", "fast-paced"]
  },
  {
    id: "space-defender",
    title: "Space Defender",
    description: "Protect Earth from waves of alien invaders in this classic space shooter with modern twists and power-ups.",
    category: "arcade",
    thumbnail: "/game-thumbnails/space-defender.jpg",
    rating: 4.9,
    plays: 156789,
    releaseDate: "2023-11-20",
    difficulty: "medium",
    instructions: "Move your spaceship with WASD or arrow keys. Press spacebar to shoot. Collect power-ups to upgrade your weapons!",
    featured: true,
    isNew: false,
    tags: ["shooter", "space", "classic"]
  },
  {
    id: "word-wizard",
    title: "Word Wizard",
    description: "Cast spells by forming words from magical letter tiles. The longer the word, the more powerful your magic!",
    category: "puzzle",
    thumbnail: "/game-thumbnails/word-wizard.jpg",
    rating: 4.6,
    plays: 87432,
    releaseDate: "2024-03-10",
    difficulty: "easy",
    instructions: "Click and drag to select letters and form words. Longer words give more points and magical energy!",
    featured: false,
    isNew: true,
    tags: ["word-game", "magic", "educational"]
  },
  {
    id: "treasure-hunter",
    title: "Treasure Hunter",
    description: "Explore ancient temples and solve puzzles to uncover legendary treasures in this adventure-puzzle hybrid.",
    category: "adventure",
    thumbnail: "/game-thumbnails/treasure-hunter.jpg",
    rating: 4.5,
    plays: 67890,
    releaseDate: "2024-03-22",
    difficulty: "hard",
    instructions: "Use WASD to move your character. Click on objects to interact. Solve puzzles to unlock new areas!",
    featured: false,
    isNew: true,
    tags: ["exploration", "puzzles", "treasure"]
  },
  {
    id: "bubble-pop",
    title: "Bubble Pop Deluxe",
    description: "Pop colorful bubbles in this relaxing and satisfying game. Perfect for unwinding after a long day.",
    category: "casual",
    thumbnail: "/game-thumbnails/bubble-pop.jpg",
    rating: 4.4,
    plays: 234567,
    releaseDate: "2023-08-14",
    difficulty: "easy",
    instructions: "Click on bubbles to pop them. Pop multiple bubbles of the same color for bonus points!",
    featured: false,
    isNew: false,
    tags: ["relaxing", "colorful", "satisfying"]
  },
  {
    id: "ninja-dash",
    title: "Ninja Dash",
    description: "Become a shadow warrior and dash through enemy territories with lightning-fast reflexes and stealth.",
    category: "action",
    thumbnail: "/game-thumbnails/ninja-dash.jpg",
    rating: 4.8,
    plays: 143298,
    releaseDate: "2024-01-28",
    difficulty: "expert",
    instructions: "Use arrow keys to move and dash. Press space to perform special ninja abilities. Stay in shadows to remain hidden!",
    featured: false,
    isNew: false,
    tags: ["ninja", "stealth", "fast-paced"]
  },
  {
    id: "city-builder",
    title: "Micro City Builder",
    description: "Build and manage your own thriving metropolis. Balance resources, happiness, and growth in this strategic city sim.",
    category: "strategy",
    thumbnail: "/game-thumbnails/city-builder.jpg",
    rating: 4.7,
    plays: 76543,
    releaseDate: "2024-02-14",
    difficulty: "hard",
    instructions: "Click to place buildings and roads. Manage your budget and citizens' happiness to grow your city!",
    featured: false,
    isNew: false,
    tags: ["city-building", "management", "strategy"]
  },
  {
    id: "memory-match",
    title: "Memory Match Pro",
    description: "Test your memory skills with increasingly challenging card matching puzzles. Train your brain while having fun!",
    category: "puzzle",
    thumbnail: "/game-thumbnails/memory-match.jpg",
    rating: 4.3,
    plays: 198765,
    releaseDate: "2023-12-05",
    difficulty: "medium",
    instructions: "Click on cards to flip them over. Match pairs to clear them from the board. Complete all matches to win!",
    featured: false,
    isNew: false,
    tags: ["memory", "cards", "brain-training"]
  },
  {
    id: "rhythm-beats",
    title: "Rhythm Beats",
    description: "Feel the music and hit the beats in perfect timing. A musical adventure with catchy tunes and challenging rhythms.",
    category: "arcade",
    thumbnail: "/game-thumbnails/rhythm-beats.jpg",
    rating: 4.9,
    plays: 187654,
    releaseDate: "2024-03-01",
    difficulty: "medium",
    instructions: "Press the corresponding keys when the beats reach the target line. Perfect timing gives maximum points!",
    featured: true,
    isNew: true,
    tags: ["music", "rhythm", "timing"]
  }
];

// Helper functions
export function getAllGames(): Game[] {
  return [...mockGames];
}

export function getFeaturedGames(): Game[] {
  return mockGames.filter(game => game.featured);
}

export function getNewGames(): Game[] {
  return mockGames.filter(game => game.isNew);
}

export function getPopularGames(): Game[] {
  return [...mockGames].sort((a, b) => b.plays - a.plays);
}

export function getGamesByCategory(categoryId: string): Game[] {
  return mockGames.filter(game => game.category === categoryId);
}

export function getGameById(id: string): Game | null {
  return mockGames.find(game => game.id === id) || null;
}

export function getRelatedGames(gameId: string, limit = 4): Game[] {
  const game = getGameById(gameId);
  if (!game) return [];

  return mockGames
    .filter(g => g.id !== gameId && g.category === game.category)
    .slice(0, limit);
}

export function searchGames(query: string): Game[] {
  const lowercaseQuery = query.toLowerCase();
  return mockGames.filter(game => 
    game.title.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Mock user data
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  experience: number;
  gamesPlayed: number;
  totalScore: number;
  achievements: string[];
  joinedDate: string;
}

export const mockUser: User = {
  id: "user_123",
  username: "GameMaster",
  email: "gamemaster@example.com",
  avatar: "/avatars/default.jpg",
  level: 15,
  experience: 12450,
  gamesPlayed: 127,
  totalScore: 2456789,
  achievements: ["first-game", "high-scorer", "puzzle-master", "speed-demon"],
  joinedDate: "2023-06-15"
};

// Mock leaderboard data
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  avatar: string;
  gameId?: string;
  achievedAt: string;
}

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "user_001",
    username: "PuzzleKing",
    score: 156780,
    avatar: "/avatars/user1.jpg",
    achievedAt: "2024-03-20"
  },
  {
    rank: 2,
    userId: "user_002",
    username: "SpeedRunner",
    score: 145623,
    avatar: "/avatars/user2.jpg",
    achievedAt: "2024-03-19"
  },
  {
    rank: 3,
    userId: "user_003",
    username: "ArcadeLegend",
    score: 134567,
    avatar: "/avatars/user3.jpg",
    achievedAt: "2024-03-18"
  }
];

// Mock achievements data
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedBy: number; // number of users who unlocked it
  requirements: string;
}

export const mockAchievements: Achievement[] = [
  {
    id: "first-game",
    title: "Getting Started",
    description: "Play your first game",
    icon: "🎮",
    rarity: "common",
    unlockedBy: 45000,
    requirements: "Play any game"
  },
  {
    id: "high-scorer",
    title: "High Scorer",
    description: "Score over 10,000 points in any game",
    icon: "🏆",
    rarity: "rare",
    unlockedBy: 12000,
    requirements: "Score 10,000+ points"
  },
  {
    id: "puzzle-master",
    title: "Puzzle Master",
    description: "Complete 50 puzzle games",
    icon: "🧩",
    rarity: "epic",
    unlockedBy: 3000,
    requirements: "Complete 50 puzzle games"
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a game in under 30 seconds",
    icon: "⚡",
    rarity: "legendary",
    unlockedBy: 500,
    requirements: "Complete game in <30 seconds"
  }
];

export function getAchievementById(id: string): Achievement | null {
  return mockAchievements.find(achievement => achievement.id === id) || null;
}

export function getUserAchievements(userId: string): Achievement[] {
  // This would normally fetch from a database
  return mockAchievements.filter(achievement => 
    mockUser.achievements.includes(achievement.id)
  );
}