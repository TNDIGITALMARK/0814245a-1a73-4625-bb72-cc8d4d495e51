import { Game, GameCategory } from "./types";

export const mockGames: Game[] = [
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Classic 3x3 grid game. Get three in a row to win!",
    instructions: "Click on empty squares to place your mark. Get three X's or O's in a row, column, or diagonal to win.",
    category: "Strategy" as GameCategory,
    thumbnail: "/games/tic-tac-toe.jpg",
    difficulty: "Easy",
    playCount: 15420,
    averageRating: 4.2,
    dateCreated: new Date("2024-01-15"),
    lastUpdated: new Date("2024-01-15"),
    isNew: false,
    isFeatured: true,
    controls: {
      mouse: [
        { input: "Left Click", action: "Place mark on square" }
      ],
      touch: [
        { gesture: "Tap", action: "Place mark on square" }
      ]
    }
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Flip cards to find matching pairs. Challenge your memory!",
    instructions: "Click cards to flip them. Find all matching pairs to win. Try to complete in the fewest moves possible.",
    category: "Puzzle" as GameCategory,
    difficulty: "Medium",
    playCount: 8930,
    averageRating: 4.5,
    dateCreated: new Date("2024-02-01"),
    lastUpdated: new Date("2024-02-01"),
    isNew: true,
    isFeatured: false,
    controls: {
      mouse: [
        { input: "Left Click", action: "Flip card" }
      ],
      touch: [
        { gesture: "Tap", action: "Flip card" }
      ]
    }
  },
  {
    id: "snake-classic",
    title: "Snake Classic",
    description: "Guide the snake to eat food and grow longer without hitting walls or yourself.",
    instructions: "Use arrow keys to control the snake. Eat the red food to grow. Avoid hitting walls or your own tail.",
    category: "Arcade" as GameCategory,
    difficulty: "Medium",
    playCount: 45230,
    averageRating: 4.7,
    dateCreated: new Date("2024-01-10"),
    lastUpdated: new Date("2024-01-20"),
    isNew: false,
    isFeatured: true,
    controls: {
      keyboard: [
        { key: "Arrow Up", action: "Move up" },
        { key: "Arrow Down", action: "Move down" },
        { key: "Arrow Left", action: "Move left" },
        { key: "Arrow Right", action: "Move right" }
      ],
      touch: [
        { gesture: "Swipe", action: "Change direction" }
      ]
    }
  },
  {
    id: "word-puzzle",
    title: "Word Puzzle",
    description: "Find words hidden in a letter grid. Perfect for word lovers!",
    instructions: "Find words by clicking and dragging from the first letter to the last. Words can be horizontal, vertical, or diagonal.",
    category: "Puzzle" as GameCategory,
    difficulty: "Hard",
    playCount: 12100,
    averageRating: 4.3,
    dateCreated: new Date("2024-02-10"),
    lastUpdated: new Date("2024-02-10"),
    isNew: true,
    isFeatured: false,
    controls: {
      mouse: [
        { input: "Click and Drag", action: "Select word" }
      ],
      touch: [
        { gesture: "Tap and Drag", action: "Select word" }
      ]
    }
  },
  {
    id: "bubble-shooter",
    title: "Bubble Shooter",
    description: "Aim and shoot colored bubbles to clear the board!",
    instructions: "Aim with your mouse and click to shoot. Match 3 or more bubbles of the same color to clear them.",
    category: "Arcade" as GameCategory,
    difficulty: "Easy",
    playCount: 34500,
    averageRating: 4.6,
    dateCreated: new Date("2024-01-25"),
    lastUpdated: new Date("2024-01-25"),
    isNew: false,
    isFeatured: true,
    controls: {
      mouse: [
        { input: "Move Mouse", action: "Aim bubble shooter" },
        { input: "Left Click", action: "Shoot bubble" }
      ],
      touch: [
        { gesture: "Tap", action: "Shoot bubble at location" }
      ]
    }
  },
  {
    id: "solitaire",
    title: "Klondike Solitaire",
    description: "Classic card game. Move all cards to the foundation piles!",
    instructions: "Build foundation piles by suit from Ace to King. In the tableau, build down by alternating colors.",
    category: "Card" as GameCategory,
    difficulty: "Medium",
    playCount: 28900,
    averageRating: 4.4,
    dateCreated: new Date("2024-01-05"),
    lastUpdated: new Date("2024-01-15"),
    isNew: false,
    isFeatured: false,
    controls: {
      mouse: [
        { input: "Click", action: "Select card" },
        { input: "Drag", action: "Move card" },
        { input: "Double Click", action: "Auto-move to foundation" }
      ],
      touch: [
        { gesture: "Tap", action: "Select card" },
        { gesture: "Drag", action: "Move card" },
        { gesture: "Double Tap", action: "Auto-move to foundation" }
      ]
    }
  }
];

export const gameCategories = [
  {
    id: "puzzle",
    name: "Puzzle",
    description: "Brain-teasing games that challenge your problem-solving skills",
    icon: "🧩",
    color: "from-blue-500 to-purple-600"
  },
  {
    id: "arcade",
    name: "Arcade", 
    description: "Fast-paced action games for quick entertainment",
    icon: "🕹️",
    color: "from-red-500 to-pink-600"
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Think ahead and plan your moves carefully",
    icon: "♟️", 
    color: "from-green-500 to-teal-600"
  },
  {
    id: "action",
    name: "Action",
    description: "High-energy games that test your reflexes",
    icon: "⚡",
    color: "from-orange-500 to-red-600"
  },
  {
    id: "card",
    name: "Card",
    description: "Classic and modern card games for all skill levels", 
    icon: "🃏",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "board",
    name: "Board",
    description: "Digital versions of your favorite board games",
    icon: "🎲",
    color: "from-teal-500 to-blue-600"
  }
];

// Helper functions
export function getGamesByCategory(category: GameCategory): Game[] {
  return mockGames.filter(game => game.category === category);
}

export function getFeaturedGames(): Game[] {
  return mockGames.filter(game => game.isFeatured);
}

export function getNewGames(): Game[] {
  return mockGames.filter(game => game.isNew);
}

export function getGameById(id: string): Game | undefined {
  return mockGames.find(game => game.id === id);
}

export function getPopularGames(): Game[] {
  return [...mockGames].sort((a, b) => b.playCount - a.playCount);
}