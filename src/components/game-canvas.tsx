"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

interface GameCanvasProps {
  gameId: string;
  isPlaying: boolean;
  isMuted: boolean;
  onScoreUpdate: (score: number) => void;
  onGameStart: () => void;
  onGameEnd: () => void;
}

export function GameCanvas({ 
  gameId, 
  isPlaying, 
  isMuted, 
  onScoreUpdate, 
  onGameStart, 
  onGameEnd 
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();

  // Sample game data - in production this would come from the game database
  const gameConfig = {
    "puzzle-quest": {
      type: "canvas2d",
      backgroundColor: "#1a1a2e",
      assets: ["/game-assets/puzzle-tiles.png"],
      initialScore: 0
    },
    "neon-runner": {
      type: "canvas2d", 
      backgroundColor: "#0a0a0a",
      assets: ["/game-assets/neon-sprites.png"],
      initialScore: 0
    },
    "space-defender": {
      type: "canvas2d",
      backgroundColor: "#000011",
      assets: ["/game-assets/space-sprites.png"],
      initialScore: 0
    }
  };

  // Simple game implementation - Puzzle Block Game
  class PuzzleBlockGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private score: number = 0;
    private gameRunning: boolean = false;
    private blocks: Array<{x: number, y: number, color: string, size: number}> = [];
    private lastTime: number = 0;
    private onScoreUpdate: (score: number) => void;

    constructor(canvas: HTMLCanvasElement, onScoreUpdate: (score: number) => void) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d")!;
      this.onScoreUpdate = onScoreUpdate;
      this.setupCanvas();
      this.generateBlocks();
    }

    private setupCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      
      // Handle click events
      this.canvas.addEventListener("click", this.handleClick.bind(this));
    }

    private generateBlocks() {
      this.blocks = [];
      const colors = ["#4A2DEF", "#FF5733", "#00FF88", "#FF00AA", "#FFAA00"];
      
      for (let i = 0; i < 15; i++) {
        this.blocks.push({
          x: Math.random() * (this.canvas.width - 60),
          y: Math.random() * (this.canvas.height - 60),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 40 + Math.random() * 20
        });
      }
    }

    private handleClick(event: MouseEvent) {
      if (!this.gameRunning) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if click hit a block
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const block = this.blocks[i];
        if (x >= block.x && x <= block.x + block.size && 
            y >= block.y && y <= block.y + block.size) {
          
          // Remove block and add score
          this.blocks.splice(i, 1);
          this.score += Math.floor(block.size);
          this.onScoreUpdate(this.score);
          
          // Generate new block
          const colors = ["#4A2DEF", "#FF5733", "#00FF88", "#FF00AA", "#FFAA00"];
          this.blocks.push({
            x: Math.random() * (this.canvas.width - 60),
            y: Math.random() * (this.canvas.height - 60),
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 40 + Math.random() * 20
          });
          
          break;
        }
      }
    }

    private render() {
      // Clear canvas
      this.ctx.fillStyle = "#1a1a2e";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw blocks
      this.blocks.forEach(block => {
        this.ctx.fillStyle = block.color;
        this.ctx.fillRect(block.x, block.y, block.size, block.size);
        
        // Add glow effect
        this.ctx.shadowColor = block.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(block.x, block.y, block.size, block.size);
        this.ctx.shadowBlur = 0;
      });

      // Draw score
      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 24px 'Roboto Condensed', sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 40);

      // Draw instructions if not playing
      if (!this.gameRunning) {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.ctx.font = "18px 'Open Sans', sans-serif";
        this.ctx.fillText("Click the colored blocks to score points!", this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText("Press Play to start!", this.canvas.width / 2, this.canvas.height / 2 + 30);
      }
    }

    public start() {
      this.gameRunning = true;
      this.score = 0;
      this.onScoreUpdate(0);
      this.generateBlocks();
      this.gameLoop();
    }

    public pause() {
      this.gameRunning = false;
    }

    public reset() {
      this.gameRunning = false;
      this.score = 0;
      this.onScoreUpdate(0);
      this.generateBlocks();
      this.render();
    }

    private gameLoop = () => {
      if (this.gameRunning) {
        this.render();
        requestAnimationFrame(this.gameLoop);
      }
    };
  }

  // Initialize game when component mounts
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      setIsLoading(true);
      setGameError(null);

      // Simple game implementation
      const game = new PuzzleBlockGame(canvasRef.current, onScoreUpdate);
      gameInstanceRef.current = game;
      
      // Initial render
      game.reset();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Game initialization error:", error);
      setGameError("Failed to load game");
      setIsLoading(false);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameId, onScoreUpdate]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!gameInstanceRef.current) return;

    if (isPlaying) {
      gameInstanceRef.current.start();
    } else {
      gameInstanceRef.current.pause();
    }
  }, [isPlaying]);

  // Handle game reset
  const handleReset = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.reset();
    }
  };

  if (gameError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <p className="text-destructive mb-4">{gameError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-lg">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="font-game-ui">Loading Game...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg cursor-pointer"
        style={{ 
          backgroundColor: gameConfig[gameId as keyof typeof gameConfig]?.backgroundColor || "#1a1a2e" 
        }}
      />

      {/* Game Loading Progress */}
      {isLoading && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/80 backdrop-blur rounded-lg p-3 text-white text-center">
            <div className="animate-pulse">
              <div className="h-2 bg-primary/50 rounded mb-2"></div>
              <p className="text-sm font-game-ui">Initializing game engine...</p>
            </div>
          </div>
        </div>
      )}

      {/* FPS Counter (Development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fps-counter">
          60 FPS
        </div>
      )}
    </div>
  );
}