import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  date: Date;
}

interface LeaderboardProps {
  gameId: string;
  period?: "daily" | "weekly" | "monthly" | "all_time";
}

// Mock leaderboard data
const mockLeaderboardData: Record<string, LeaderboardEntry[]> = {
  "tic-tac-toe": [
    { rank: 1, username: "GameMaster", score: 1250, date: new Date("2024-09-10") },
    { rank: 2, username: "PuzzlePro", score: 1180, date: new Date("2024-09-09") },
    { rank: 3, username: "StrategyKing", score: 1120, date: new Date("2024-09-08") },
    { rank: 4, username: "QuickThinker", score: 1050, date: new Date("2024-09-07") },
    { rank: 5, username: "BrainBox", score: 990, date: new Date("2024-09-06") },
  ],
  "snake-classic": [
    { rank: 1, username: "SnakeCharmer", score: 8950, date: new Date("2024-09-11") },
    { rank: 2, username: "ArcadeLegend", score: 7820, date: new Date("2024-09-10") },
    { rank: 3, username: "FastFingers", score: 7200, date: new Date("2024-09-09") },
    { rank: 4, username: "RetroGamer", score: 6750, date: new Date("2024-09-08") },
    { rank: 5, username: "HighScorer", score: 6200, date: new Date("2024-09-07") },
  ],
  "memory-match": [
    { rank: 1, username: "MemoryMaster", score: 340, date: new Date("2024-09-11") },
    { rank: 2, username: "CardSharp", score: 285, date: new Date("2024-09-10") },
    { rank: 3, username: "MindReader", score: 260, date: new Date("2024-09-09") },
    { rank: 4, username: "PairFinder", score: 240, date: new Date("2024-09-08") },
    { rank: 5, username: "BrainPower", score: 220, date: new Date("2024-09-07") },
  ]
};

export function Leaderboard({ gameId, period = "all_time" }: LeaderboardProps) {
  const entries = mockLeaderboardData[gameId] || [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-gray-50 border-gray-200";
      case 3:
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-background border-border";
    }
  };

  const formatScore = (score: number, gameId: string) => {
    switch (gameId) {
      case "tic-tac-toe":
        return `${score} pts`;
      case "snake-classic":
        return `${score.toLocaleString()}`;
      case "memory-match":
        return `${score}s`;
      default:
        return score.toLocaleString();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No scores yet!</p>
        <p className="text-xs">Be the first to set a high score.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={`${entry.username}-${entry.rank}`}
          className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${getRankColor(entry.rank)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{entry.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(entry.date)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-sm">
                {formatScore(entry.score, gameId)}
              </div>
              {entry.rank <= 3 && (
                <Badge variant="secondary" className="text-xs">
                  Top {entry.rank}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {entries.length > 0 && (
        <div className="text-center pt-2">
          <button className="text-xs text-primary hover:underline">
            View Full Leaderboard
          </button>
        </div>
      )}
    </div>
  );
}