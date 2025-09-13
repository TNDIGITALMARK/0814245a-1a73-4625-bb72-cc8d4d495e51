'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameEngine, BRAND_COLORS, Rectangle, Vector2 } from '@/lib/game-engine';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  grounded: boolean;
  trail: Vector2[];
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'wall' | 'laser';
  color: string;
}

interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  pulsePhase: number;
}

interface NeonParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

class NeonRunnerGame extends GameEngine {
  private player: Player;
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private backgroundElements: any[] = [];
  private neonParticles: NeonParticle[] = [];
  private gameSpeed = 200;
  private distance = 0;
  private jumpPower = 400;
  private gravity = 1000;
  private groundY = 0;
  private gameOver = false;
  private spawnTimer = 0;
  private collectibleTimer = 0;
  private speedIncreaseTimer = 0;
  private cameraShake = 0;
  private multiplier = 1;
  private multiplierTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, {
      width: 800,
      height: 500,
      backgroundColor: '#0a0a1a',
      enableTouch: true,
      enableKeyboard: true
    });
  }

  init(): void {
    this.groundY = this.config.height - 100;
    
    this.player = {
      x: 100,
      y: this.groundY - 40,
      width: 30,
      height: 40,
      velocityY: 0,
      grounded: true,
      trail: []
    };
    
    this.obstacles = [];
    this.collectibles = [];
    this.neonParticles = [];
    this.backgroundElements = [];
    this.gameSpeed = 200;
    this.distance = 0;
    this.gameOver = false;
    this.score = 0;
    this.spawnTimer = 0;
    this.collectibleTimer = 0;
    this.speedIncreaseTimer = 0;
    this.cameraShake = 0;
    this.multiplier = 1;
    this.multiplierTimer = 0;
    
    // Initialize background elements
    this.initializeBackground();
  }

  private initializeBackground(): void {
    // Create scrolling background elements
    for (let i = 0; i < 50; i++) {
      this.backgroundElements.push({
        x: Math.random() * this.config.width * 3,
        y: Math.random() * this.config.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 50 + 25,
        color: Math.random() > 0.5 ? BRAND_COLORS.primary : BRAND_COLORS.secondary,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  update(deltaTime: number): void {
    if (this.gameOver) {
      if (this.wasTouchJustPressed() || this.wasKeyJustPressed('Space')) {
        this.init();
        return;
      }
      return;
    }

    this.updatePlayer(deltaTime);
    this.updateObstacles(deltaTime);
    this.updateCollectibles(deltaTime);
    this.updateBackground(deltaTime);
    this.updateParticles(deltaTime);
    this.updateGameLogic(deltaTime);
    this.checkCollisions();
    
    // Update distance and score
    this.distance += this.gameSpeed * deltaTime;
    this.addScore(Math.floor(this.gameSpeed * deltaTime * 0.1) * this.multiplier);

    // Camera shake decay
    this.cameraShake *= 0.95;

    // Multiplier timer
    if (this.multiplierTimer > 0) {
      this.multiplierTimer -= deltaTime;
      if (this.multiplierTimer <= 0) {
        this.multiplier = 1;
      }
    }
  }

  private updatePlayer(deltaTime: number): void {
    // Handle input
    const jump = this.wasTouchJustPressed() || 
                this.wasKeyJustPressed('Space') || 
                this.wasKeyJustPressed('ArrowUp') ||
                this.getSwipeDirection() === 'up';
    
    if (jump && this.player.grounded) {
      this.player.velocityY = -this.jumpPower;
      this.player.grounded = false;
      this.createJumpParticles();
    }

    // Apply gravity
    if (!this.player.grounded) {
      this.player.velocityY += this.gravity * deltaTime;
    }

    // Update position
    this.player.y += this.player.velocityY * deltaTime;

    // Ground collision
    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.velocityY = 0;
      this.player.grounded = true;
    }

    // Update trail
    this.player.trail.push(new Vector2(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2));
    if (this.player.trail.length > 10) {
      this.player.trail.shift();
    }

    // Add running particles
    if (this.player.grounded && Math.random() < 0.3) {
      this.neonParticles.push({
        x: this.player.x,
        y: this.player.y + this.player.height,
        velocityX: -this.gameSpeed * 0.5 + Math.random() * 100 - 50,
        velocityY: -Math.random() * 100,
        life: 1000,
        maxLife: 1000,
        color: BRAND_COLORS.primary,
        size: Math.random() * 3 + 1
      });
    }
  }

  private updateObstacles(deltaTime: number): void {
    // Move existing obstacles
    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.gameSpeed * deltaTime;
    });

    // Remove obstacles that are off-screen
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > -50);

    // Spawn new obstacles
    this.spawnTimer += deltaTime;
    if (this.spawnTimer > 2 - Math.min(this.distance / 10000, 1.5)) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }
  }

  private updateCollectibles(deltaTime: number): void {
    // Move existing collectibles
    this.collectibles.forEach(collectible => {
      collectible.x -= this.gameSpeed * deltaTime;
      collectible.pulsePhase += deltaTime * 5;
    });

    // Remove collectibles that are off-screen
    this.collectibles = this.collectibles.filter(collectible => 
      collectible.x + collectible.width > -50 && !collectible.collected
    );

    // Spawn new collectibles
    this.collectibleTimer += deltaTime;
    if (this.collectibleTimer > 1.5) {
      this.spawnCollectible();
      this.collectibleTimer = 0;
    }
  }

  private updateBackground(deltaTime: number): void {
    this.backgroundElements.forEach(element => {
      element.x -= element.speed * deltaTime;
      if (element.x < -10) {
        element.x = this.config.width + Math.random() * 200;
      }
    });
  }

  private updateParticles(deltaTime: number): void {
    this.neonParticles.forEach(particle => {
      particle.x += particle.velocityX * deltaTime;
      particle.y += particle.velocityY * deltaTime;
      particle.life -= deltaTime * 1000;
    });

    this.neonParticles = this.neonParticles.filter(particle => particle.life > 0);
  }

  private updateGameLogic(deltaTime: number): void {
    // Increase speed over time
    this.speedIncreaseTimer += deltaTime;
    if (this.speedIncreaseTimer > 5) {
      this.gameSpeed += 10;
      this.speedIncreaseTimer = 0;
    }
  }

  private spawnObstacle(): void {
    const types: Obstacle['type'][] = ['spike', 'wall', 'laser'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let obstacle: Obstacle;
    
    switch (type) {
      case 'spike':
        obstacle = {
          x: this.config.width + 50,
          y: this.groundY - 30,
          width: 30,
          height: 30,
          type: 'spike',
          color: '#FF4444'
        };
        break;
      case 'wall':
        obstacle = {
          x: this.config.width + 50,
          y: this.groundY - 80,
          width: 20,
          height: 80,
          type: 'wall',
          color: '#4444FF'
        };
        break;
      case 'laser':
        obstacle = {
          x: this.config.width + 50,
          y: Math.random() * (this.groundY - 150) + 50,
          width: 5,
          height: 100,
          type: 'laser',
          color: BRAND_COLORS.secondary
        };
        break;
    }
    
    this.obstacles.push(obstacle);
  }

  private spawnCollectible(): void {
    this.collectibles.push({
      x: this.config.width + Math.random() * 200,
      y: Math.random() * (this.groundY - 100) + 50,
      width: 20,
      height: 20,
      collected: false,
      pulsePhase: 0
    });
  }

  private checkCollisions(): void {
    const playerRect = new Rectangle(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    // Check obstacle collisions
    this.obstacles.forEach(obstacle => {
      const obstacleRect = new Rectangle(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      if (playerRect.intersects(obstacleRect)) {
        this.gameOver = true;
        this.cameraShake = 20;
        this.createExplosionParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
      }
    });

    // Check collectible collisions
    this.collectibles.forEach(collectible => {
      if (collectible.collected) return;
      
      const collectibleRect = new Rectangle(
        collectible.x,
        collectible.y,
        collectible.width,
        collectible.height
      );

      if (playerRect.intersects(collectibleRect)) {
        collectible.collected = true;
        this.addScore(100 * this.multiplier);
        this.multiplier = Math.min(this.multiplier + 0.1, 3);
        this.multiplierTimer = 5; // 5 seconds
        this.createCollectParticles(collectible.x + collectible.width / 2, collectible.y + collectible.height / 2);
      }
    });
  }

  private createJumpParticles(): void {
    for (let i = 0; i < 10; i++) {
      this.neonParticles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height,
        velocityX: Math.random() * 200 - 100,
        velocityY: Math.random() * 100 + 50,
        life: 800,
        maxLife: 800,
        color: BRAND_COLORS.primary,
        size: Math.random() * 4 + 2
      });
    }
  }

  private createCollectParticles(x: number, y: number): void {
    for (let i = 0; i < 15; i++) {
      this.neonParticles.push({
        x,
        y,
        velocityX: Math.random() * 300 - 150,
        velocityY: Math.random() * 300 - 150,
        life: 1500,
        maxLife: 1500,
        color: BRAND_COLORS.secondary,
        size: Math.random() * 3 + 2
      });
    }
  }

  private createExplosionParticles(x: number, y: number): void {
    for (let i = 0; i < 30; i++) {
      this.neonParticles.push({
        x,
        y,
        velocityX: Math.random() * 400 - 200,
        velocityY: Math.random() * 400 - 200,
        life: 2000,
        maxLife: 2000,
        color: Math.random() > 0.5 ? '#FF4444' : BRAND_COLORS.primary,
        size: Math.random() * 5 + 3
      });
    }
  }

  render(): void {
    this.clear();
    
    // Apply camera shake
    if (this.cameraShake > 0) {
      this.ctx.save();
      this.ctx.translate(
        Math.random() * this.cameraShake - this.cameraShake / 2,
        Math.random() * this.cameraShake - this.cameraShake / 2
      );
    }

    this.renderBackground();
    this.renderGround();
    this.renderObstacles();
    this.renderCollectibles();
    this.renderPlayer();
    this.renderParticles();
    this.renderUI();
    
    if (this.gameOver) {
      this.renderGameOverScreen();
    }

    if (this.cameraShake > 0) {
      this.ctx.restore();
    }
  }

  private renderBackground(): void {
    // Render scrolling background elements
    this.backgroundElements.forEach(element => {
      this.ctx.fillStyle = element.color + Math.floor(element.alpha * 255).toString(16).padStart(2, '0');
      this.ctx.fillRect(element.x, element.y, element.size, element.size);
    });

    // Render grid lines
    this.ctx.strokeStyle = BRAND_COLORS.primary + '20';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x < this.config.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.config.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.config.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.config.width, y);
      this.ctx.stroke();
    }
  }

  private renderGround(): void {
    // Main ground
    this.drawRect(0, this.groundY, this.config.width, this.config.height - this.groundY, BRAND_COLORS.primary + '40');
    
    // Ground edge glow
    this.ctx.strokeStyle = BRAND_COLORS.primary;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.config.width, this.groundY);
    this.ctx.stroke();
  }

  private renderPlayer(): void {
    // Player trail
    this.ctx.strokeStyle = BRAND_COLORS.primary + '80';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    
    this.player.trail.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    this.ctx.stroke();

    // Player body (neon rectangle)
    this.ctx.fillStyle = BRAND_COLORS.secondary;
    this.ctx.fillRect(this.player.x + 2, this.player.y + 2, this.player.width - 4, this.player.height - 4);
    
    // Player glow
    this.ctx.shadowColor = BRAND_COLORS.secondary;
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = BRAND_COLORS.secondary;
    this.ctx.fillRect(this.player.x + 2, this.player.y + 2, this.player.width - 4, this.player.height - 4);
    this.ctx.shadowBlur = 0;

    // Player outline
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
  }

  private renderObstacles(): void {
    this.obstacles.forEach(obstacle => {
      this.ctx.fillStyle = obstacle.color;
      
      switch (obstacle.type) {
        case 'spike':
          // Draw triangle spike
          this.ctx.beginPath();
          this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
          this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
          this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          this.ctx.closePath();
          this.ctx.fill();
          break;
          
        case 'wall':
          this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          // Add glow effect
          this.ctx.shadowColor = obstacle.color;
          this.ctx.shadowBlur = 10;
          this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          this.ctx.shadowBlur = 0;
          break;
          
        case 'laser':
          // Pulsing laser beam
          const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
          this.ctx.fillStyle = obstacle.color + Math.floor(pulseIntensity * 255).toString(16).padStart(2, '0');
          this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          
          // Laser glow
          this.ctx.shadowColor = obstacle.color;
          this.ctx.shadowBlur = 20 * pulseIntensity;
          this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          this.ctx.shadowBlur = 0;
          break;
      }
    });
  }

  private renderCollectibles(): void {
    this.collectibles.forEach(collectible => {
      if (collectible.collected) return;
      
      const pulse = 0.8 + 0.2 * Math.sin(collectible.pulsePhase);
      const size = collectible.width * pulse;
      const offset = (collectible.width - size) / 2;
      
      // Collectible glow
      this.ctx.shadowColor = BRAND_COLORS.secondary;
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = BRAND_COLORS.secondary;
      this.drawCircle(
        collectible.x + collectible.width / 2,
        collectible.y + collectible.height / 2,
        size / 2,
        BRAND_COLORS.secondary
      );
      this.ctx.shadowBlur = 0;
      
      // Inner core
      this.drawCircle(
        collectible.x + collectible.width / 2,
        collectible.y + collectible.height / 2,
        size / 4,
        '#ffffff'
      );
    });
  }

  private renderParticles(): void {
    this.neonParticles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = particle.size * 2;
      this.drawCircle(particle.x, particle.y, particle.size, particle.color);
      this.ctx.shadowBlur = 0;
    });
  }

  private renderUI(): void {
    // Score
    this.drawText(`Score: ${Math.floor(this.score)}`, 20, 30, 24, BRAND_COLORS.light);
    
    // Distance
    this.drawText(`Distance: ${Math.floor(this.distance / 10)}m`, 20, 60, 18, BRAND_COLORS.secondary);
    
    // Speed
    this.drawText(`Speed: ${Math.floor(this.gameSpeed)}`, this.config.width - 150, 30, 18, BRAND_COLORS.primary);
    
    // Multiplier
    if (this.multiplier > 1) {
      this.drawText(`x${this.multiplier.toFixed(1)}`, this.config.width - 80, 60, 20, BRAND_COLORS.secondary);
    }
    
    // FPS counter
    this.drawText(`${this.getFPS()} FPS`, this.config.width - 80, this.config.height - 20, 14, '#666');
  }

  private renderGameOverScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // Game Over text with glow
    this.ctx.shadowColor = BRAND_COLORS.primary;
    this.ctx.shadowBlur = 20;
    this.drawText('GAME OVER', this.config.width / 2, this.config.height / 2 - 60, 48, BRAND_COLORS.primary, 'center');
    this.ctx.shadowBlur = 0;
    
    this.drawText(`Final Score: ${Math.floor(this.score)}`, this.config.width / 2, this.config.height / 2 - 10, 24, BRAND_COLORS.secondary, 'center');
    this.drawText(`Distance: ${Math.floor(this.distance / 10)}m`, this.config.width / 2, this.config.height / 2 + 20, 20, BRAND_COLORS.light, 'center');
    
    // Restart instruction
    const instructionText = 'Tap or press SPACE to restart';
    const pulseAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    this.ctx.globalAlpha = pulseAlpha;
    this.drawText(instructionText, this.config.width / 2, this.config.height / 2 + 80, 18, '#ccc', 'center');
    this.ctx.globalAlpha = 1;
  }
}

interface NeonRunnerProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, distance: number) => void;
}

export function NeonRunner({ onScoreUpdate, onGameOver }: NeonRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<NeonRunnerGame | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new NeonRunnerGame(canvasRef.current);
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
        className="game-canvas border-2 border-primary/30 rounded-lg shadow-lg bg-gradient-to-b from-slate-900 to-slate-800"
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
        <p><strong>Controls:</strong> Tap, press SPACE, or swipe up to jump. Avoid obstacles and collect neon orbs for bonus points!</p>
      </div>
    </div>
  );
}