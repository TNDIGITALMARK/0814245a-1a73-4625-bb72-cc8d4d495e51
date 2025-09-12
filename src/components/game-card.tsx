import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Trophy } from "lucide-react";

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  playCount: number;
  averageRating: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export function GameCard({
  id,
  title,
  description,
  category,
  thumbnail,
  difficulty,
  playCount,
  averageRating,
  isNew = false,
  isFeatured = false
}: GameCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Link href={`/games/${id}`} className="block">
      <Card className="game-card group relative overflow-hidden border-2 hover:border-primary/50">
        {/* Status badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {isNew && (
            <Badge className="bg-secondary text-secondary-foreground">
              NEW
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-primary text-primary-foreground">
              <Trophy className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-16 h-16 text-primary/40" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground rounded-full p-3 scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category badge */}
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>

          {/* Title and description */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>

          {/* Game stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{formatPlayCount(playCount)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{averageRating.toFixed(1)}</span>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getDifficultyColor(difficulty)}`}
            >
              {difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}