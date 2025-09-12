"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  Calendar, 
  Users,
  Target,
  Zap,
  Award
} from "lucide-react";
import { mockLeaderboard, LeaderboardEntry, getAllGames, gameCategories } from "@/lib/mock-data";

// Extended mock leaderboard data for different categories
const generateLeaderboardData = (category: string, count: number = 50): LeaderboardEntry[] => {
  const users = [
    "PuzzleMaster", "SpeedDemon", "ArcadeLegend", "StrategyKing", "CasualGamer",
    "ActionHero", "BrainTeaser", "GameChampion", "HighScorer", "ProGamer",
    "QuickFinger", "MindBender", "GameGuru", "TopPlayer", "SkillMaster",
    "GameNinja", "ScoreHunter", "PlayMaster", "GameWizard", "ChampionPlayer"
  ];

  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    userId: `user_${String(i + 1).padStart(3, "0")}`,
    username: users[i % users.length] + (i >= users.length ? (Math.floor(i / users.length) + 1) : ""),
    score: Math.floor(Math.random() * 500000) + 10000,
    avatar: `/avatars/user${(i % 10) + 1}.jpg`,
    achievedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  })).sort((a, b) => b.score - a.score).map((entry, i) => ({ ...entry, rank: i + 1 }));
};

const leaderboardCategories = {
  global: { 
    title: "Global Champions", 
    icon: Crown, 
    data: generateLeaderboardData("global"),
    color: "text-yellow-500"
  },
  weekly: { 
    title: "This Week", 
    icon: Calendar, 
    data: generateLeaderboardData("weekly"),
    color: "text-blue-500"
  },
  puzzle: { 
    title: "Puzzle Masters", 
    icon: Target, 
    data: generateLeaderboardData("puzzle"),
    color: "text-purple-500"
  },
  action: { 
    title: "Action Heroes", 
    icon: Zap, 
    data: generateLeaderboardData("action"),
    color: "text-red-500"
  },
  arcade: { 
    title: "Arcade Legends", 
    icon: Medal, 
    data: generateLeaderboardData("arcade"),
    color: "text-indigo-500"
  }
};

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState("global");
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    // Simulate finding current user's rank
    setCurrentUserRank(Math.floor(Math.random() * 100) + 15);
  }, [activeTab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600";
    return "bg-muted";
  };

  const currentLeaderboard = leaderboardCategories[activeTab as keyof typeof leaderboardCategories];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold mb-4">
            <Trophy className="inline h-10 w-10 mr-3 text-primary" />
            Leaderboards
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete with players worldwide and climb the ranks!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">45,692</div>
              <p className="text-sm text-muted-foreground">Total Players</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">2.8M</div>
              <p className="text-sm text-muted-foreground">Total Scores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{currentUserRank || "N/A"}</div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">89.2K</div>
              <p className="text-sm text-muted-foreground">High Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {Object.entries(leaderboardCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${category.color}`} />
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(leaderboardCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Leaderboard */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className={`h-6 w-6 ${category.color}`} />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Top 3 Podium */}
                      <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-lg">
                        {category.data.slice(0, 3).map((entry, index) => {
                          const positions = [1, 0, 2]; // Center 1st, left 2nd, right 3rd
                          const heights = ["h-24", "h-32", "h-20"];
                          const actualIndex = positions[index];
                          const actualEntry = category.data[actualIndex];
                          
                          return (
                            <div key={actualEntry.rank} className={`text-center ${index === 1 ? "order-1" : index === 0 ? "order-2" : "order-3"}`}>
                              <div className={`${getRankColor(actualEntry.rank)} ${heights[actualIndex]} w-full rounded-t-lg mb-4 flex items-end justify-center pb-2`}>
                                <div className="text-center">
                                  <div className="text-white font-bold text-2xl">#{actualEntry.rank}</div>
                                  {getRankIcon(actualEntry.rank)}
                                </div>
                              </div>
                              <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-white shadow-lg">
                                <AvatarFallback>{actualEntry.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <p className="font-semibold text-sm truncate">{actualEntry.username}</p>
                              <p className="text-xs text-muted-foreground score-display">
                                {actualEntry.score.toLocaleString()}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Full Rankings List */}
                      <div className="space-y-2">
                        {category.data.map((entry) => (
                          <div key={entry.rank} className={`flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors ${entry.rank <= 3 ? "bg-muted/30" : ""}`}>
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`leaderboard-rank ${entry.rank === 1 ? "gold" : entry.rank === 2 ? "silver" : entry.rank === 3 ? "bronze" : ""}`}>
                                {entry.rank}
                              </div>
                              <Avatar className="w-10 h-10">
                                <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{entry.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  Achieved {new Date(entry.achievedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold score-display text-lg">
                                {entry.score.toLocaleString()}
                              </p>
                              {entry.rank <= 10 && (
                                <Badge variant="secondary" className="text-xs">
                                  Top 10
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Your Progress */}
                  {currentUserRank && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">#{currentUserRank}</div>
                            <p className="text-sm text-muted-foreground">Current Rank</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress to Top 10</span>
                              <span>{Math.max(0, 100 - currentUserRank)}%</span>
                            </div>
                            <Progress value={Math.max(0, 100 - currentUserRank)} />
                          </div>
                          <Button size="sm" className="w-full">
                            <Trophy className="h-4 w-4 mr-2" />
                            Play to Improve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Category Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Players</span>
                          <span className="font-semibold">{category.data.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Highest Score</span>
                          <span className="font-semibold">
                            {category.data[0]?.score.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Average Score</span>
                          <span className="font-semibold">
                            {Math.round(category.data.reduce((sum, entry) => sum + entry.score, 0) / category.data.length).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Last Updated</span>
                          <span className="font-semibold">Just now</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Featured Games */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Featured Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getAllGames().slice(0, 3).map((game) => (
                          <Link key={game.id} href={`/games/${game.id}`}>
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                                <Trophy className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{game.title}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
                                  {game.rating}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-heading text-xl font-bold mb-2">Ready to Climb the Ranks?</h3>
            <p className="text-muted-foreground mb-4">
              Play games, score high, and compete with players from around the world!
            </p>
            <Button size="lg" asChild>
              <Link href="/games">
                <Zap className="h-5 w-5 mr-2" />
                Start Playing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}