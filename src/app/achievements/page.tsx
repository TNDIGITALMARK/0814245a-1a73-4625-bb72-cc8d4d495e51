"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Crown, 
  Shield,
  Search,
  Filter,
  Lock,
  CheckCircle
} from "lucide-react";
import { mockAchievements, Achievement } from "@/lib/mock-data";

// Extended achievements data
const extendedAchievements: Achievement[] = [
  ...mockAchievements,
  {
    id: "first-win",
    title: "Victory Royale",
    description: "Win your first game",
    icon: "👑",
    rarity: "common",
    unlockedBy: 38000,
    requirements: "Win any game"
  },
  {
    id: "combo-master",
    title: "Combo Master",
    description: "Achieve a 10x combo in any game",
    icon: "🔥",
    rarity: "rare",
    unlockedBy: 8500,
    requirements: "Get 10x combo"
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Play games between 12 AM and 6 AM",
    icon: "🦉",
    rarity: "uncommon",
    unlockedBy: 15000,
    requirements: "Play during night hours"
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete a game with 100% accuracy",
    icon: "💯",
    rarity: "epic",
    unlockedBy: 2000,
    requirements: "100% accuracy in any game"
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Share 10 game results on social media",
    icon: "🦋",
    rarity: "rare",
    unlockedBy: 6000,
    requirements: "Share 10 results"
  },
  {
    id: "marathon-gamer",
    title: "Marathon Gamer",
    description: "Play for 3 hours straight",
    icon: "🏃",
    rarity: "epic",
    unlockedBy: 1500,
    requirements: "Play 3+ hours continuously"
  },
  {
    id: "multi-talent",
    title: "Multi-Talent",
    description: "Play games from all categories",
    icon: "🎭",
    rarity: "rare",
    unlockedBy: 7500,
    requirements: "Play all game categories"
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Play for 30 consecutive days",
    icon: "📅",
    rarity: "legendary",
    unlockedBy: 250,
    requirements: "30-day play streak"
  },
  {
    id: "helper",
    title: "Community Helper",
    description: "Help 5 new players",
    icon: "🤝",
    rarity: "uncommon",
    unlockedBy: 12000,
    requirements: "Help 5 new players"
  },
  {
    id: "treasure-hunter",
    title: "Treasure Hunter",
    description: "Find all hidden easter eggs",
    icon: "🗺️",
    rarity: "legendary",
    unlockedBy: 100,
    requirements: "Find all easter eggs"
  },
  {
    id: "speed-racer",
    title: "Speed Racer",
    description: "Complete 5 games in under 1 minute each",
    icon: "🏎️",
    rarity: "epic",
    unlockedBy: 1800,
    requirements: "5 games under 1 minute"
  },
  {
    id: "zen-master",
    title: "Zen Master",
    description: "Play 100 casual games",
    icon: "🧘",
    rarity: "rare",
    unlockedBy: 5000,
    requirements: "Complete 100 casual games"
  }
];

// Mock user's achievement progress
const userAchievements = [
  "first-game", "high-scorer", "first-win", "combo-master", "night-owl"
];

const achievementProgress = {
  "puzzle-master": 32, // out of 50
  "marathon-gamer": 85, // out of 100 (percentage)
  "multi-talent": 4, // out of 6 categories
  "streak-master": 12, // out of 30 days
  "social-butterfly": 6, // out of 10 shares
  "speed-racer": 2, // out of 5 games
  "zen-master": 67 // out of 100 games
};

export default function AchievementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAchievements = extendedAchievements.filter((achievement) => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = selectedRarity === "all" || achievement.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  const unlockedAchievements = filteredAchievements.filter(a => userAchievements.includes(a.id));
  const lockedAchievements = filteredAchievements.filter(a => !userAchievements.includes(a.id));
  const inProgressAchievements = lockedAchievements.filter(a => achievementProgress[a.id as keyof typeof achievementProgress]);

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return "text-gray-600 bg-gray-100";
      case "rare": return "text-blue-600 bg-blue-100";
      case "epic": return "text-purple-600 bg-purple-100";
      case "legendary": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRarityIcon = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return <Shield className="h-4 w-4" />;
      case "rare": return <Star className="h-4 w-4" />;
      case "epic": return <Award className="h-4 w-4" />;
      case "legendary": return <Crown className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const AchievementCard = ({ achievement, isUnlocked, progress }: { 
    achievement: Achievement, 
    isUnlocked: boolean, 
    progress?: number 
  }) => (
    <Card className={`achievement-card transition-all duration-300 hover:scale-105 ${isUnlocked ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20" : "opacity-75"}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`text-4xl ${isUnlocked ? "" : "grayscale"}`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{achievement.title}</h3>
              {isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!isUnlocked && progress === undefined && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {achievement.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge className={getRarityColor(achievement.rarity)}>
                {getRarityIcon(achievement.rarity)}
                <span className="ml-1 capitalize">{achievement.rarity}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {achievement.unlockedBy.toLocaleString()} players
              </span>
            </div>
            {!isUnlocked && progress !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {achievement.requirements}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const stats = {
    total: extendedAchievements.length,
    unlocked: unlockedAchievements.length,
    inProgress: inProgressAchievements.length,
    completionRate: Math.round((unlockedAchievements.length / extendedAchievements.length) * 100)
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold mb-4">
            <Trophy className="inline h-10 w-10 mr-3 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground text-lg">
            Unlock badges and earn rewards as you master different games
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.unlocked}</div>
              <p className="text-sm text-muted-foreground">Unlocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Overall Progress</h3>
              <span className="text-sm text-muted-foreground">
                {stats.unlocked} / {stats.total} achievements
              </span>
            </div>
            <Progress value={stats.completionRate} className="h-3" />
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>

        {/* Achievement Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All ({filteredAchievements.length})</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked ({unlockedAchievements.length})</TabsTrigger>
            <TabsTrigger value="progress">In Progress ({inProgressAchievements.length})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({lockedAchievements.length - inProgressAchievements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={userAchievements.includes(achievement.id)}
                  progress={achievementProgress[achievement.id as keyof typeof achievementProgress]}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unlocked">
            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">No achievements unlocked yet</h3>
                  <p className="text-muted-foreground">Start playing games to unlock your first achievement!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress">
            {inProgressAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={false}
                    progress={achievementProgress[achievement.id as keyof typeof achievementProgress]}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">No achievements in progress</h3>
                  <p className="text-muted-foreground">Keep playing to make progress on locked achievements!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="locked">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedAchievements
                .filter(a => !achievementProgress[a.id as keyof typeof achievementProgress])
                .map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={false}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Featured Achievement Showcase */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <Image
                src="/generated/achievement-badges.png"
                alt="Achievement Badges"
                width={400}
                height={150}
                className="mx-auto mb-6 rounded-lg"
              />
              <h3 className="font-heading text-2xl font-bold mb-4">
                Collect All Achievement Badges!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                From Bronze to Diamond tier, each achievement represents your gaming prowess. 
                Complete challenges, master games, and show off your badge collection to the world!
              </p>
              <Button size="lg" asChild>
                <Link href="/games">
                  <Zap className="h-5 w-5 mr-2" />
                  Start Unlocking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}