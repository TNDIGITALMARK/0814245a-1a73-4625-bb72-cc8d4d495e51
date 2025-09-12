"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface GameCanvasProps {
  gameId: string;
}

export function GameCanvas({ gameId }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameOver">("idle");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize game based on gameId
    initializeGame(canvas, ctx, gameId);
  }, [gameId]);

  const initializeGame = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, gameId: string) => {
    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game-specific content based on gameId
    switch (gameId) {
      case "tic-tac-toe":
        drawTicTacToeBoard(ctx, canvas.width, canvas.height);
        break;
      case "snake-classic":
        drawSnakeGame(ctx, canvas.width, canvas.height);
        break;
      case "memory-match":
        drawMemoryGame(ctx, canvas.width, canvas.height);
        break;
      default:
        drawPlaceholderGame(ctx, canvas.width, canvas.height, gameId);
    }
  };

  const drawTicTacToeBoard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const boardSize = Math.min(width, height) * 0.8;
    const startX = (width - boardSize) / 2;
    const startY = (height - boardSize) / 2;
    const cellSize = boardSize / 3;

    // Clear background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "#4A2DEF";
    ctx.lineWidth = 3;

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(startX + i * cellSize, startY);
      ctx.lineTo(startX + i * cellSize, startY + boardSize);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + i * cellSize);
      ctx.lineTo(startX + boardSize, startY + i * cellSize);
      ctx.stroke();
    }

    // Add sample X and O
    ctx.font = `${cellSize * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    ctx.fillStyle = "#4A2DEF";
    ctx.fillText("X", startX + cellSize * 0.5, startY + cellSize * 0.5);
    
    ctx.fillStyle = "#FF5733";
    ctx.fillText("O", startX + cellSize * 2.5, startY + cellSize * 1.5);

    // Instructions
    ctx.font = "16px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText("Click to start playing!", width / 2, height - 30);
  };

  const drawSnakeGame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    const gridSize = 20;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * gridSize, 0);
      ctx.lineTo(x * gridSize, height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * gridSize);
      ctx.lineTo(width, y * gridSize);
      ctx.stroke();
    }

    // Draw sample snake
    const snakeBody = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    ctx.fillStyle = "#4A2DEF";
    snakeBody.forEach(segment => {
      ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    // Draw sample food
    ctx.fillStyle = "#FF5733";
    ctx.fillRect(15 * gridSize + 1, 8 * gridSize + 1, gridSize - 2, gridSize - 2);

    // Instructions
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Use arrow keys to move!", width / 2, height - 30);
  };

  const drawMemoryGame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    const cardSize = 60;
    const cols = 4;
    const rows = 3;
    const spacing = 10;
    const totalWidth = cols * cardSize + (cols - 1) * spacing;
    const totalHeight = rows * cardSize + (rows - 1) * spacing;
    const startX = (width - totalWidth) / 2;
    const startY = (height - totalHeight) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (cardSize + spacing);
        const y = startY + row * (cardSize + spacing);

        // Draw card background
        ctx.fillStyle = "#4A2DEF";
        ctx.fillRect(x, y, cardSize, cardSize);

        // Draw card border
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardSize, cardSize);

        // Draw question mark
        ctx.font = "24px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", x + cardSize / 2, y + cardSize / 2);
      }
    }

    // Instructions
    ctx.font = "16px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText("Click cards to reveal and match pairs!", width / 2, height - 20);
  };

  const drawPlaceholderGame = (ctx: CanvasRenderingContext2D, width: number, height: number, gameId: string) => {
    // Clear background with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#4A2DEF20");
    gradient.addColorStop(1, "#FF573320");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw game placeholder
    ctx.font = "24px Arial";
    ctx.fillStyle = "#4A2DEF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${gameId.replace("-", " ").toUpperCase()}`, width / 2, height / 2 - 20);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText("Game coming soon!", width / 2, height / 2 + 20);
  };

  const handlePlayPause = () => {
    if (gameState === "idle") {
      setGameState("playing");
      setIsPlaying(true);
    } else if (gameState === "playing") {
      setGameState("paused");
      setIsPlaying(false);
    } else if (gameState === "paused") {
      setGameState("playing");
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setGameState("idle");
    setIsPlaying(false);
    setScore(0);
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        initializeGame(canvasRef.current, ctx, gameId);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Score: </span>
            <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Status: </span>
            <span className={`capitalize font-medium ${
              gameState === "playing" ? "text-green-600" :
              gameState === "paused" ? "text-yellow-600" :
              gameState === "gameOver" ? "text-red-600" :
              "text-muted-foreground"
            }`}>
              {gameState === "idle" ? "Ready" : gameState}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="game-canvas w-full border rounded-lg bg-white"
          style={{ aspectRatio: "4/3", maxHeight: "500px" }}
          onClick={() => {
            if (gameState === "idle") {
              handlePlayPause();
            }
          }}
        />
        
        {gameState === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
            <Button size="lg" onClick={handlePlayPause}>
              <Play className="w-6 h-6 mr-2" />
              Start Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}