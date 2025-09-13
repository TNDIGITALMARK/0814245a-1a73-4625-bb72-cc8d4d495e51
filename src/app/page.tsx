import Link from "next/link";
import Image from "next/image";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedGames, getNewGames, getPopularGames, gameCategories } from "@/lib/mock-data";
import { Play, TrendingUp, Star, Users, Trophy, Gamepad2 } from "lucide-react";

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const featuredGames = getFeaturedGames();
  const newGames = getNewGames();
  const popularGames = getPopularGames().slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-8">
                <h1 className="font-heading text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome to GameHub
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8">
                  Play the best collection of free browser-based mini-games. 
                  From puzzles to arcade classics, find your next favorite game!
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="#featured">
                      <Play className="w-5 h-5" />
                      Start Playing
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2" asChild>
                    <Link href="/categories">
                      <Gamepad2 className="w-5 h-5" />
                      Browse Games
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl transform scale-110"></div>
                <Image
                  src="/currentImgContext/5dd5e9c559c0209f0611e583376c1e51.jpg"
                  alt="GameHub Mascot - Gaming Dog"
                  width={400}
                  height={400}
                  className="hero-mascot relative z-10 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 border-4 border-primary/20"
                  priority
                />
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100K+</div>
              <div className="text-sm text-muted-foreground">Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Free</div>
              <div className="text-sm text-muted-foreground">Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Game Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {gameCategories.map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-2xl`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section id="featured" className="py-16 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <h2 className="font-heading text-3xl font-bold">Featured Games</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/featured">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </div>
      </section>

      {/* New Games */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-secondary" />
              <h2 className="font-heading text-3xl font-bold">New Games</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/new">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="font-heading text-3xl font-bold">Most Popular</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/popular">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Ready to Start Playing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players enjoying our collection of free browser games!
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/games">
                <Play className="w-5 h-5" />
                Play Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}