'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameEngine, BRAND_COLORS, Rectangle, Vector2 } from '@/lib/game-engine';

interface Block {
  type: number;
  x: number;
  y: number;
  isSelected: boolean;
  isMatched: boolean;
  fallDistance: number;
  color: string;
}

class PuzzleQuestGame extends GameEngine {
  private grid: Block[][];
  private gridSize = 8;
  private blockSize = 60;
  private selectedBlocks: Vector2[] = [];
  private colors = [
    BRAND_COLORS.primary,    // Blue
    BRAND_COLORS.secondary,  // Orange
    '#9C27B0',               // Purple
    '#4CAF50',               // Green
    '#F44336',               // Red
    '#FFEB3B'                // Yellow
  ];
  private particles: Particle[] = [];
  private comboMultiplier = 1;
  private comboTimer = 0;
  private moveCount = 0;
  private targetScore = 1000;
  private gameWon = false;
  private powerUpCharge = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, {
      width: 600,
      height: 700,
      backgroundColor: '#1a1a2e',
      enableTouch: true,
      enableKeyboard: false
    });
  }

  init(): void {
    this.initializeGrid();
    this.score = 0;
    this.moveCount = 0;
    this.gameWon = false;
    this.comboMultiplier = 1;
    this.powerUpCharge = 0;
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = this.createRandomBlock(col, row);
      }
    }
    // Remove initial matches
    this.removeMatches();
    this.fillEmptySpaces();
  }

  private createRandomBlock(x: number, y: number): Block {
    const type = Math.floor(Math.random() * this.colors.length);
    return {
      type,
      x,
      y,
      isSelected: false,
      isMatched: false,
      fallDistance: 0,
      color: this.colors[type]
    };
  }

  update(deltaTime: number): void {
    this.updateParticles(deltaTime);
    this.updateComboTimer(deltaTime);
    
    if (this.wasTouchJustPressed()) {
      this.handleTouchInput();
    }

    // Apply gravity to falling blocks
    this.applyGravity(deltaTime);

    // Check for matches after blocks have settled
    if (this.checkForMatches()) {
      this.removeMatches();
      this.fillEmptySpaces();
      this.comboMultiplier += 0.5;
      this.comboTimer = 2000; // 2 seconds
    }

    // Check win condition
    if (this.score >= this.targetScore && !this.gameWon) {
      this.gameWon = true;
      this.createCelebrationParticles();
    }
  }

  private handleTouchInput(): void {
    const touch = this.getTouchPosition();
    const gridPos = this.screenToGrid(touch.x, touch.y);
    
    if (this.isValidGridPosition(gridPos.x, gridPos.y)) {
      const block = this.grid[gridPos.y][gridPos.x];
      
      if (this.selectedBlocks.length === 0) {
        // First selection
        this.selectedBlocks.push(new Vector2(gridPos.x, gridPos.y));
        block.isSelected = true;
      } else if (this.selectedBlocks.length === 1) {
        // Second selection
        const firstBlock = this.selectedBlocks[0];
        
        if (gridPos.x === firstBlock.x && gridPos.y === firstBlock.y) {
          // Deselect if clicking the same block
          this.clearSelection();
        } else if (this.areAdjacent(firstBlock, new Vector2(gridPos.x, gridPos.y))) {
          // Attempt swap
          this.selectedBlocks.push(new Vector2(gridPos.x, gridPos.y));
          this.attemptSwap();
        } else {
          // Select new block
          this.clearSelection();
          this.selectedBlocks.push(new Vector2(gridPos.x, gridPos.y));
          block.isSelected = true;
        }
      }
    }
  }

  private screenToGrid(screenX: number, screenY: number): Vector2 {
    const offsetX = (this.config.width - this.gridSize * this.blockSize) / 2;
    const offsetY = 80; // Leave space for UI
    
    return new Vector2(
      Math.floor((screenX - offsetX) / this.blockSize),
      Math.floor((screenY - offsetY) / this.blockSize)
    );
  }

  private isValidGridPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  private areAdjacent(pos1: Vector2, pos2: Vector2): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  private attemptSwap(): void {
    if (this.selectedBlocks.length !== 2) return;
    
    const [pos1, pos2] = this.selectedBlocks;
    const block1 = this.grid[pos1.y][pos1.x];
    const block2 = this.grid[pos2.y][pos2.x];
    
    // Perform the swap
    this.grid[pos1.y][pos1.x] = block2;
    this.grid[pos2.y][pos2.x] = block1;
    
    // Update block positions
    [block1.x, block1.y] = [pos2.x, pos2.y];
    [block2.x, block2.y] = [pos1.x, pos1.y];
    
    // Check if this creates any matches
    if (this.wouldCreateMatches(pos1) || this.wouldCreateMatches(pos2)) {
      this.moveCount++;
      this.comboMultiplier = 1;
      this.createSwapParticles(pos1, pos2);
    } else {
      // Revert the swap
      this.grid[pos1.y][pos1.x] = block1;
      this.grid[pos2.y][pos2.x] = block2;
      [block1.x, block1.y] = [pos1.x, pos1.y];
      [block2.x, block2.y] = [pos2.x, pos2.y];
    }
    
    this.clearSelection();
  }

  private wouldCreateMatches(pos: Vector2): boolean {
    const block = this.grid[pos.y][pos.x];
    return this.getMatchingBlocks(pos.x, pos.y, block.type).length >= 3;
  }

  private checkForMatches(): boolean {
    let hasMatches = false;
    
    // Reset match flags
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col].isMatched = false;
      }
    }
    
    // Find all matches
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const block = this.grid[row][col];
        if (block) {
          const matches = this.getMatchingBlocks(col, row, block.type);
          if (matches.length >= 3) {
            hasMatches = true;
            matches.forEach(pos => {
              this.grid[pos.y][pos.x].isMatched = true;
            });
          }
        }
      }
    }
    
    return hasMatches;
  }

  private getMatchingBlocks(startX: number, startY: number, type: number): Vector2[] {
    const matches: Vector2[] = [];
    const visited = new Set<string>();
    const queue = [new Vector2(startX, startY)];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (!this.isValidGridPosition(current.x, current.y)) continue;
      
      const block = this.grid[current.y][current.x];
      if (!block || block.type !== type) continue;
      
      matches.push(current);
      
      // Check adjacent blocks
      const directions = [
        new Vector2(0, 1), new Vector2(0, -1),
        new Vector2(1, 0), new Vector2(-1, 0)
      ];
      
      directions.forEach(dir => {
        const next = current.add(dir);
        if (!visited.has(`${next.x},${next.y}`)) {
          queue.push(next);
        }
      });
    }
    
    return matches;
  }

  private removeMatches(): void {
    let blocksRemoved = 0;
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].isMatched) {
          this.createMatchParticles(col, row);
          blocksRemoved++;
          this.grid[row][col] = null as any;
        }
      }
    }
    
    if (blocksRemoved > 0) {
      const baseScore = blocksRemoved * 10;
      const comboScore = Math.floor(baseScore * this.comboMultiplier);
      this.addScore(comboScore);
      this.powerUpCharge += blocksRemoved;
    }
  }

  private fillEmptySpaces(): void {
    // Make blocks fall
    for (let col = 0; col < this.gridSize; col++) {
      let emptyRow = this.gridSize - 1;
      
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (this.grid[row][col]) {
          if (row !== emptyRow) {
            this.grid[emptyRow][col] = this.grid[row][col];
            this.grid[emptyRow][col].y = emptyRow;
            this.grid[row][col] = null as any;
          }
          emptyRow--;
        }
      }
      
      // Fill empty spaces with new blocks
      for (let row = emptyRow; row >= 0; row--) {
        this.grid[row][col] = this.createRandomBlock(col, row);
        this.grid[row][col].fallDistance = (emptyRow - row + 1) * this.blockSize;
      }
    }
  }

  private applyGravity(deltaTime: number): void {
    const fallSpeed = 800; // pixels per second
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const block = this.grid[row][col];
        if (block && block.fallDistance > 0) {
          const fallAmount = fallSpeed * deltaTime;
          block.fallDistance = Math.max(0, block.fallDistance - fallAmount);
        }
      }
    }
  }

  private updateParticles(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.life > 0;
    });
  }

  private updateComboTimer(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime * 1000;
      if (this.comboTimer <= 0) {
        this.comboMultiplier = 1;
      }
    }
  }

  private createMatchParticles(gridX: number, gridY: number): void {
    const offsetX = (this.config.width - this.gridSize * this.blockSize) / 2;
    const offsetY = 80;
    const centerX = offsetX + gridX * this.blockSize + this.blockSize / 2;
    const centerY = offsetY + gridY * this.blockSize + this.blockSize / 2;
    
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(
        centerX,
        centerY,
        Math.random() * Math.PI * 2,
        100 + Math.random() * 100,
        BRAND_COLORS.secondary,
        1000
      ));
    }
  }

  private createSwapParticles(pos1: Vector2, pos2: Vector2): void {
    const offsetX = (this.config.width - this.gridSize * this.blockSize) / 2;
    const offsetY = 80;
    
    [pos1, pos2].forEach(pos => {
      const centerX = offsetX + pos.x * this.blockSize + this.blockSize / 2;
      const centerY = offsetY + pos.y * this.blockSize + this.blockSize / 2;
      
      for (let i = 0; i < 4; i++) {
        this.particles.push(new Particle(
          centerX,
          centerY,
          Math.random() * Math.PI * 2,
          50,
          BRAND_COLORS.primary,
          500
        ));
      }
    });
  }

  private createCelebrationParticles(): void {
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(
        Math.random() * this.config.width,
        this.config.height,
        Math.PI + Math.random() * Math.PI,
        200 + Math.random() * 200,
        this.colors[Math.floor(Math.random() * this.colors.length)],
        3000
      ));
    }
  }

  private clearSelection(): void {
    this.selectedBlocks.forEach(pos => {
      this.grid[pos.y][pos.x].isSelected = false;
    });
    this.selectedBlocks = [];
  }

  render(): void {
    this.clear();
    this.renderUI();
    this.renderGrid();
    this.renderParticles();
    
    if (this.gameWon) {
      this.renderWinScreen();
    }
  }

  private renderUI(): void {
    // Score
    this.drawText(`Score: ${this.score}`, 20, 30, 24, BRAND_COLORS.light);
    this.drawText(`Target: ${this.targetScore}`, 20, 55, 18, BRAND_COLORS.secondary);
    
    // Moves
    this.drawText(`Moves: ${this.moveCount}`, this.config.width - 120, 30, 20, BRAND_COLORS.light);
    
    // Combo multiplier
    if (this.comboMultiplier > 1) {
      this.drawText(`Combo x${this.comboMultiplier.toFixed(1)}`, this.config.width / 2 - 50, 30, 22, BRAND_COLORS.primary, 'center');
    }
    
    // Power-up charge
    const chargeWidth = 200;
    const chargeHeight = 10;
    const chargeX = (this.config.width - chargeWidth) / 2;
    const chargeY = 50;
    const chargePercent = Math.min(this.powerUpCharge / 50, 1);
    
    this.drawRect(chargeX, chargeY, chargeWidth, chargeHeight, '#333');
    this.drawRect(chargeX, chargeY, chargeWidth * chargePercent, chargeHeight, BRAND_COLORS.primary);
  }

  private renderGrid(): void {
    const offsetX = (this.config.width - this.gridSize * this.blockSize) / 2;
    const offsetY = 80;
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const block = this.grid[row][col];
        if (!block) continue;
        
        const x = offsetX + col * this.blockSize;
        const y = offsetY + row * this.blockSize + block.fallDistance;
        
        // Block background
        this.drawRoundedRect(
          x + 2,
          y + 2,
          this.blockSize - 4,
          this.blockSize - 4,
          8,
          block.color
        );
        
        // Selection highlight
        if (block.isSelected) {
          this.ctx.strokeStyle = BRAND_COLORS.light;
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.roundRect(x + 2, y + 2, this.blockSize - 4, this.blockSize - 4, 8);
          this.ctx.stroke();
        }
        
        // Block symbol
        this.drawText(
          this.getBlockSymbol(block.type),
          x + this.blockSize / 2,
          y + this.blockSize / 2 + 8,
          30,
          '#ffffff',
          'center'
        );
      }
    }
  }

  private getBlockSymbol(type: number): string {
    const symbols = ['◆', '●', '▲', '■', '★', '♦'];
    return symbols[type] || '?';
  }

  private renderParticles(): void {
    this.particles.forEach(particle => particle.render(this.ctx));
  }

  private renderWinScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // Win text
    this.drawText('LEVEL COMPLETE!', this.config.width / 2, this.config.height / 2 - 40, 48, BRAND_COLORS.primary, 'center');
    this.drawText(`Final Score: ${this.score}`, this.config.width / 2, this.config.height / 2, 24, BRAND_COLORS.secondary, 'center');
    this.drawText(`Moves Used: ${this.moveCount}`, this.config.width / 2, this.config.height / 2 + 30, 20, BRAND_COLORS.light, 'center');
    this.drawText('Tap to play again', this.config.width / 2, this.config.height / 2 + 80, 18, '#ccc', 'center');
    
    if (this.wasTouchJustPressed()) {
      this.init();
    }
  }
}

class Particle {
  public life: number;
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private color: string;
  private maxLife: number;

  constructor(x: number, y: number, angle: number, speed: number, color: string, life: number) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }

  update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vy += 300 * deltaTime; // Gravity
    this.life -= deltaTime * 1000;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

interface PuzzleQuestProps {
  onScoreUpdate?: (score: number) => void;
  onGameComplete?: (score: number, moves: number) => void;
}

export function PuzzleQuest({ onScoreUpdate, onGameComplete }: PuzzleQuestProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<PuzzleQuestGame | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new PuzzleQuestGame(canvasRef.current);
    gameRef.current = game;
    game.start();
    setIsGameReady(true);

    return () => {
      game.cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="game-canvas border-2 border-primary/30 rounded-lg shadow-lg"
        style={{
          maxWidth: '100%',
          height: 'auto',
          touchAction: 'none'
        }}
      />
      {!isGameReady && (
        <div className="text-center text-muted-foreground">
          Loading game...
        </div>
      )}
      <div className="text-sm text-muted-foreground text-center max-w-md">
        <p><strong>How to play:</strong> Tap blocks to select them, then tap an adjacent block to swap. Match 3 or more blocks of the same type to score points!</p>
      </div>
    </div>
  );
}