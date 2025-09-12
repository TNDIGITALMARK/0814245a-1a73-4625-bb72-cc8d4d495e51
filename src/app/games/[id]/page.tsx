import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GameCanvas } from "@/components/game-canvas";
import { GameControls } from "@/components/game-controls";
import { Leaderboard } from "@/components/leaderboard";
import { getGameById, mockGames } from "@/lib/mock-data";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Share, 
  Trophy, 
  Users, 
  Star,
  Info,
  Gamepad2
} from "lucide-react";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockGames.map((game) => ({
    id: game.id,
  }));
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  const game = getGameById(id);

  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-bold text-xl">{game.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{game.category}</Badge>
                  <Badge variant="secondary" className={
                    game.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                    game.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {game.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{game.playCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{game.averageRating.toFixed(1)}</span>
              </div>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <GameCanvas gameId={game.id} />
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Game Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GameControls controls={game.controls} />
              </CardContent>
            </Card>

            {/* Game Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About This Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{game.description}</p>
                <div>
                  <h4 className="font-semibold mb-2">How to Play:</h4>
                  <p className="text-sm text-muted-foreground">{game.instructions}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Plays</span>
                  <span className="font-semibold">{game.playCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {game.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <Badge variant="secondary" className={
                    game.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                    game.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {game.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{game.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Leaderboard gameId={game.id} />
              </CardContent>
            </Card>

            {/* Similar Games */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGames
                    .filter(g => g.category === game.category && g.id !== game.id)
                    .slice(0, 3)
                    .map((similarGame) => (
                      <Link 
                        key={similarGame.id} 
                        href={`/games/${similarGame.id}`}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{similarGame.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {similarGame.averageRating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {(similarGame.playCount / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </Link>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}