'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameEngine, BRAND_COLORS, Rectangle, Vector2 } from '@/lib/game-engine';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  weaponLevel: number;
  shield: number;
  shieldRechargeTimer: number;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  color: string;
  isPlayerBullet: boolean;
  trail: Vector2[];
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  type: 'basic' | 'fast' | 'heavy' | 'boss';
  color: string;
  shootTimer: number;
  shootCooldown: number;
  value: number;
}

interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'health' | 'weapon' | 'shield' | 'multishot';
  color: string;
  pulsePhase: number;
  collected: boolean;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

class SpaceDefenderGame extends GameEngine {
  private player: Player;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private powerUps: PowerUp[] = [];
  private explosions: Explosion[] = [];
  private stars: any[] = [];
  private enemySpawnTimer = 0;
  private powerUpSpawnTimer = 0;
  private waveNumber = 1;
  private enemiesInWave = 0;
  private enemiesSpawned = 0;
  private gameOver = false;
  private wave = { active: false, number: 1, enemiesRemaining: 0 };
  private shootCooldown = 0;
  private maxShootCooldown = 150; // milliseconds
  private difficulty = 1;
  private bossActive = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, {
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1a',
      enableTouch: true,
      enableKeyboard: true
    });
  }

  init(): void {
    this.player = {
      x: this.config.width / 2 - 20,
      y: this.config.height - 80,
      width: 40,
      height: 30,
      speed: 300,
      health: 100,
      maxHealth: 100,
      weaponLevel: 1,
      shield: 0,
      shieldRechargeTimer: 0
    };
    
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.explosions = [];
    this.stars = [];
    this.gameOver = false;
    this.score = 0;
    this.waveNumber = 1;
    this.enemiesInWave = 5;
    this.enemiesSpawned = 0;
    this.wave = { active: true, number: 1, enemiesRemaining: 5 };
    this.shootCooldown = 0;
    this.difficulty = 1;
    this.bossActive = false;
    
    this.initializeStars();
    this.startWave();
  }

  private initializeStars(): void {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.config.width,
        y: Math.random() * this.config.height,
        speed: Math.random() * 100 + 25,
        size: Math.random() * 2 + 1,
        brightness: Math.random()
      });
    }
  }

  private startWave(): void {
    this.wave.active = true;
    this.wave.number = this.waveNumber;
    this.wave.enemiesRemaining = this.enemiesInWave;
    this.enemiesSpawned = 0;
    this.enemySpawnTimer = 0;
    
    // Increase difficulty
    this.difficulty = 1 + (this.waveNumber - 1) * 0.2;
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
    this.updateBullets(deltaTime);
    this.updateEnemies(deltaTime);
    this.updatePowerUps(deltaTime);
    this.updateExplosions(deltaTime);
    this.updateStars(deltaTime);
    this.updateWaveLogic(deltaTime);
    this.handleShooting(deltaTime);
    this.checkCollisions();
    
    // Update cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime * 1000;
    }

    // Shield recharge
    if (this.player.shieldRechargeTimer > 0) {
      this.player.shieldRechargeTimer -= deltaTime;
    } else if (this.player.shield < 50) {
      this.player.shield += deltaTime * 10;
      this.player.shield = Math.min(this.player.shield, 50);
    }
  }

  private updatePlayer(deltaTime: number): void {
    const moveLeft = this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA') ||
                    (this.isTouchDown() && this.getTouchPosition().x < this.player.x + this.player.width / 2);
    const moveRight = this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD') ||
                     (this.isTouchDown() && this.getTouchPosition().x > this.player.x + this.player.width / 2);
    const moveUp = this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW') ||
                  (this.isTouchDown() && this.getTouchPosition().y < this.player.y + this.player.height / 2);
    const moveDown = this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS') ||
                    (this.isTouchDown() && this.getTouchPosition().y > this.player.y + this.player.height / 2);

    if (moveLeft) {
      this.player.x -= this.player.speed * deltaTime;
    }
    if (moveRight) {
      this.player.x += this.player.speed * deltaTime;
    }
    if (moveUp) {
      this.player.y -= this.player.speed * deltaTime;
    }
    if (moveDown) {
      this.player.y += this.player.speed * deltaTime;
    }

    // Keep player in bounds
    this.player.x = Math.max(0, Math.min(this.config.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.config.height - this.player.height, this.player.y));
  }

  private handleShooting(deltaTime: number): void {
    const shooting = this.isKeyPressed('Space') || this.isTouchDown();
    
    if (shooting && this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = this.maxShootCooldown / this.player.weaponLevel;
    }
  }

  private shoot(): void {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y;
    
    switch (this.player.weaponLevel) {
      case 1:
        this.createBullet(centerX, centerY, 0, -500, true);
        break;
      case 2:
        this.createBullet(centerX - 5, centerY, 0, -500, true);
        this.createBullet(centerX + 5, centerY, 0, -500, true);
        break;
      case 3:
        this.createBullet(centerX, centerY, 0, -500, true);
        this.createBullet(centerX - 10, centerY, -50, -500, true);
        this.createBullet(centerX + 10, centerY, 50, -500, true);
        break;
      case 4:
        this.createBullet(centerX - 10, centerY, 0, -500, true);
        this.createBullet(centerX + 10, centerY, 0, -500, true);
        this.createBullet(centerX - 15, centerY, -100, -500, true);
        this.createBullet(centerX + 15, centerY, 100, -500, true);
        break;
    }
  }

  private createBullet(x: number, y: number, vx: number, vy: number, isPlayer: boolean): void {
    this.bullets.push({
      x,
      y,
      width: isPlayer ? 4 : 6,
      height: isPlayer ? 12 : 8,
      velocityX: vx,
      velocityY: vy,
      damage: isPlayer ? 25 * this.player.weaponLevel : 15,
      color: isPlayer ? BRAND_COLORS.primary : BRAND_COLORS.secondary,
      isPlayerBullet: isPlayer,
      trail: []
    });
  }

  private updateBullets(deltaTime: number): void {
    this.bullets.forEach(bullet => {
      bullet.x += bullet.velocityX * deltaTime;
      bullet.y += bullet.velocityY * deltaTime;
      
      // Add to trail
      bullet.trail.push(new Vector2(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2));
      if (bullet.trail.length > 5) {
        bullet.trail.shift();
      }
    });

    // Remove bullets that are off-screen
    this.bullets = this.bullets.filter(bullet => 
      bullet.x > -50 && bullet.x < this.config.width + 50 &&
      bullet.y > -50 && bullet.y < this.config.height + 50
    );
  }

  private updateEnemies(deltaTime: number): void {
    // Spawn enemies
    if (this.wave.active && this.enemiesSpawned < this.enemiesInWave) {
      this.enemySpawnTimer += deltaTime;
      if (this.enemySpawnTimer > 1 / this.difficulty) {
        this.spawnEnemy();
        this.enemySpawnTimer = 0;
      }
    }

    // Update existing enemies
    this.enemies.forEach(enemy => {
      enemy.x += enemy.velocityX * deltaTime;
      enemy.y += enemy.velocityY * deltaTime;
      
      // Simple AI: move toward player
      if (enemy.type !== 'boss') {
        const playerCenterX = this.player.x + this.player.width / 2;
        const enemyCenterX = enemy.x + enemy.width / 2;
        
        if (enemyCenterX < playerCenterX) {
          enemy.velocityX = Math.min(enemy.velocityX + 50 * deltaTime, 100);
        } else {
          enemy.velocityX = Math.max(enemy.velocityX - 50 * deltaTime, -100);
        }
      }
      
      // Shooting
      enemy.shootTimer += deltaTime;
      if (enemy.shootTimer > enemy.shootCooldown) {
        this.enemyShoot(enemy);
        enemy.shootTimer = 0;
      }
    });

    // Remove enemies that are off-screen (below)
    this.enemies = this.enemies.filter(enemy => enemy.y < this.config.height + 100);
  }

  private spawnEnemy(): void {
    if (this.enemiesSpawned >= this.enemiesInWave) return;
    
    let enemy: Enemy;
    const rand = Math.random();
    const spawnX = Math.random() * (this.config.width - 40);
    
    if (this.waveNumber % 5 === 0 && this.enemiesSpawned === this.enemiesInWave - 1 && !this.bossActive) {
      // Spawn boss
      enemy = {
        x: this.config.width / 2 - 40,
        y: -80,
        width: 80,
        height: 60,
        velocityX: 0,
        velocityY: 30,
        health: 200 * this.difficulty,
        maxHealth: 200 * this.difficulty,
        type: 'boss',
        color: '#FF00FF',
        shootTimer: 0,
        shootCooldown: 0.3,
        value: 500
      };
      this.bossActive = true;
    } else if (rand < 0.6) {
      // Basic enemy
      enemy = {
        x: spawnX,
        y: -40,
        width: 30,
        height: 25,
        velocityX: 0,
        velocityY: 50 + Math.random() * 50,
        health: 50 * this.difficulty,
        maxHealth: 50 * this.difficulty,
        type: 'basic',
        color: BRAND_COLORS.secondary,
        shootTimer: 0,
        shootCooldown: 1 + Math.random(),
        value: 50
      };
    } else if (rand < 0.8) {
      // Fast enemy
      enemy = {
        x: spawnX,
        y: -30,
        width: 20,
        height: 20,
        velocityX: Math.random() * 100 - 50,
        velocityY: 80 + Math.random() * 50,
        health: 25 * this.difficulty,
        maxHealth: 25 * this.difficulty,
        type: 'fast',
        color: '#00FFFF',
        shootTimer: 0,
        shootCooldown: 0.5,
        value: 75
      };
    } else {
      // Heavy enemy
      enemy = {
        x: spawnX,
        y: -60,
        width: 50,
        height: 40,
        velocityX: 0,
        velocityY: 30,
        health: 100 * this.difficulty,
        maxHealth: 100 * this.difficulty,
        type: 'heavy',
        color: '#FF4444',
        shootTimer: 0,
        shootCooldown: 1.5,
        value: 100
      };
    }
    
    this.enemies.push(enemy);
    this.enemiesSpawned++;
  }

  private enemyShoot(enemy: Enemy): void {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height;
    
    if (enemy.type === 'boss') {
      // Boss shoots multiple bullets
      for (let i = -2; i <= 2; i++) {
        this.createBullet(centerX + i * 15, centerY, i * 50, 200, false);
      }
    } else {
      this.createBullet(centerX, centerY, 0, 150, false);
    }
  }

  private updatePowerUps(deltaTime: number): void {
    // Spawn power-ups occasionally
    this.powerUpSpawnTimer += deltaTime;
    if (this.powerUpSpawnTimer > 10 + Math.random() * 10) {
      this.spawnPowerUp();
      this.powerUpSpawnTimer = 0;
    }

    this.powerUps.forEach(powerUp => {
      powerUp.y += 50 * deltaTime;
      powerUp.pulsePhase += deltaTime * 3;
    });

    // Remove power-ups that are off-screen
    this.powerUps = this.powerUps.filter(powerUp => 
      powerUp.y < this.config.height + 50 && !powerUp.collected
    );
  }

  private spawnPowerUp(): void {
    const types: PowerUp['type'][] = ['health', 'weapon', 'shield', 'multishot'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = {
      health: '#00FF00',
      weapon: BRAND_COLORS.primary,
      shield: '#FFFF00',
      multishot: BRAND_COLORS.secondary
    };
    
    this.powerUps.push({
      x: Math.random() * (this.config.width - 30),
      y: -30,
      width: 30,
      height: 30,
      type,
      color: colors[type],
      pulsePhase: 0,
      collected: false
    });
  }

  private updateExplosions(deltaTime: number): void {
    this.explosions.forEach(explosion => {
      explosion.life -= deltaTime;
      explosion.radius = explosion.maxRadius * (1 - explosion.life / explosion.maxLife);
    });

    this.explosions = this.explosions.filter(explosion => explosion.life > 0);
  }

  private updateStars(deltaTime: number): void {
    this.stars.forEach(star => {
      star.y += star.speed * deltaTime;
      if (star.y > this.config.height) {
        star.y = -5;
        star.x = Math.random() * this.config.width;
      }
    });
  }

  private updateWaveLogic(deltaTime: number): void {
    if (this.wave.active && this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesInWave) {
      // Wave complete
      this.wave.active = false;
      this.waveNumber++;
      this.enemiesInWave += 2;
      this.bossActive = false;
      
      // Bonus score for wave completion
      this.addScore(this.waveNumber * 100);
      
      // Start next wave after delay
      setTimeout(() => {
        if (!this.gameOver) {
          this.startWave();
        }
      }, 2000);
    }
  }

  private checkCollisions(): void {
    const playerRect = new Rectangle(this.player.x, this.player.y, this.player.width, this.player.height);

    // Bullet vs Enemy collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.isPlayerBullet) {
        this.enemies.forEach((enemy, enemyIndex) => {
          const enemyRect = new Rectangle(enemy.x, enemy.y, enemy.width, enemy.height);
          const bulletRect = new Rectangle(bullet.x, bullet.y, bullet.width, bullet.height);
          
          if (bulletRect.intersects(enemyRect)) {
            enemy.health -= bullet.damage;
            this.bullets.splice(bulletIndex, 1);
            this.createSmallExplosion(bullet.x, bullet.y);
            
            if (enemy.health <= 0) {
              this.addScore(enemy.value);
              this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === 'boss' ? 60 : 30);
              this.enemies.splice(enemyIndex, 1);
              
              // Chance to drop power-up
              if (Math.random() < 0.2) {
                this.spawnPowerUpAt(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              }
            }
          }
        });
      } else {
        // Enemy bullet vs Player
        const bulletRect = new Rectangle(bullet.x, bullet.y, bullet.width, bullet.height);
        if (bulletRect.intersects(playerRect)) {
          this.bullets.splice(bulletIndex, 1);
          this.damagePlayer(bullet.damage);
        }
      }
    });

    // Enemy vs Player collisions
    this.enemies.forEach((enemy, enemyIndex) => {
      const enemyRect = new Rectangle(enemy.x, enemy.y, enemy.width, enemy.height);
      if (enemyRect.intersects(playerRect)) {
        this.damagePlayer(30);
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 30);
        this.enemies.splice(enemyIndex, 1);
      }
    });

    // Power-up vs Player collisions
    this.powerUps.forEach((powerUp, powerUpIndex) => {
      const powerUpRect = new Rectangle(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      if (powerUpRect.intersects(playerRect)) {
        this.collectPowerUp(powerUp);
        this.powerUps.splice(powerUpIndex, 1);
      }
    });
  }

  private damagePlayer(damage: number): void {
    if (this.player.shield > 0) {
      this.player.shield = Math.max(0, this.player.shield - damage / 2);
      this.player.shieldRechargeTimer = 3;
    } else {
      this.player.health -= damage;
    }
    
    if (this.player.health <= 0) {
      this.gameOver = true;
      this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 50);
    }
  }

  private collectPowerUp(powerUp: PowerUp): void {
    switch (powerUp.type) {
      case 'health':
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
        break;
      case 'weapon':
        this.player.weaponLevel = Math.min(4, this.player.weaponLevel + 1);
        break;
      case 'shield':
        this.player.shield = Math.min(100, this.player.shield + 50);
        break;
      case 'multishot':
        this.player.weaponLevel = Math.min(4, this.player.weaponLevel + 2);
        break;
    }
    
    this.createSmallExplosion(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    this.addScore(25);
  }

  private spawnPowerUpAt(x: number, y: number): void {
    const types: PowerUp['type'][] = ['health', 'weapon', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = {
      health: '#00FF00',
      weapon: BRAND_COLORS.primary,
      shield: '#FFFF00',
      multishot: BRAND_COLORS.secondary
    };
    
    this.powerUps.push({
      x: x - 15,
      y: y - 15,
      width: 30,
      height: 30,
      type,
      color: colors[type],
      pulsePhase: 0,
      collected: false
    });
  }

  private createExplosion(x: number, y: number, maxRadius: number): void {
    this.explosions.push({
      x,
      y,
      radius: 0,
      maxRadius,
      life: 0.5,
      maxLife: 0.5,
      color: BRAND_COLORS.secondary
    });
  }

  private createSmallExplosion(x: number, y: number): void {
    this.createExplosion(x, y, 15);
  }

  render(): void {
    this.clear();
    this.renderStars();
    this.renderBullets();
    this.renderEnemies();
    this.renderPowerUps();
    this.renderPlayer();
    this.renderExplosions();
    this.renderUI();
    
    if (this.gameOver) {
      this.renderGameOverScreen();
    } else if (!this.wave.active) {
      this.renderWaveTransition();
    }
  }

  private renderStars(): void {
    this.stars.forEach(star => {
      const alpha = Math.floor(star.brightness * 255).toString(16).padStart(2, '0');
      this.ctx.fillStyle = '#ffffff' + alpha;
      this.drawCircle(star.x, star.y, star.size, '#ffffff' + alpha);
    });
  }

  private renderPlayer(): void {
    // Player ship
    this.ctx.fillStyle = BRAND_COLORS.primary;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    
    // Player glow
    this.ctx.shadowColor = BRAND_COLORS.primary;
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    this.ctx.shadowBlur = 0;

    // Shield visualization
    if (this.player.shield > 0) {
      const shieldRadius = 30;
      const alpha = Math.floor((this.player.shield / 50) * 100).toString(16).padStart(2, '0');
      this.ctx.strokeStyle = '#00FFFF' + alpha;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        shieldRadius,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }
  }

  private renderBullets(): void {
    this.bullets.forEach(bullet => {
      // Bullet trail
      if (bullet.trail.length > 1) {
        this.ctx.strokeStyle = bullet.color + '80';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        bullet.trail.forEach((point, index) => {
          if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });
        this.ctx.stroke();
      }
      
      // Bullet
      this.ctx.fillStyle = bullet.color;
      this.ctx.shadowColor = bullet.color;
      this.ctx.shadowBlur = 5;
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      this.ctx.shadowBlur = 0;
    });
  }

  private renderEnemies(): void {
    this.enemies.forEach(enemy => {
      // Enemy body
      this.ctx.fillStyle = enemy.color;
      this.ctx.shadowColor = enemy.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      this.ctx.shadowBlur = 0;
      
      // Health bar for damaged enemies
      if (enemy.health < enemy.maxHealth) {
        const healthBarWidth = enemy.width;
        const healthBarHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        this.drawRect(enemy.x, enemy.y - 8, healthBarWidth, healthBarHeight, '#333');
        this.drawRect(enemy.x, enemy.y - 8, healthBarWidth * healthPercent, healthBarHeight, '#ff0000');
      }
      
      // Boss special effects
      if (enemy.type === 'boss') {
        const pulseAlpha = Math.floor(50 + 50 * Math.sin(Date.now() * 0.01)).toString(16).padStart(2, '0');
        this.ctx.strokeStyle = '#FF00FF' + pulseAlpha;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
      }
    });
  }

  private renderPowerUps(): void {
    this.powerUps.forEach(powerUp => {
      if (powerUp.collected) return;
      
      const pulse = 0.8 + 0.2 * Math.sin(powerUp.pulsePhase);
      const size = powerUp.width * pulse;
      const offset = (powerUp.width - size) / 2;
      
      // Power-up glow
      this.ctx.shadowColor = powerUp.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = powerUp.color;
      this.ctx.fillRect(powerUp.x + offset, powerUp.y + offset, size, size);
      this.ctx.shadowBlur = 0;
      
      // Power-up icon
      this.drawText(
        this.getPowerUpIcon(powerUp.type),
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2 + 5,
        16,
        '#ffffff',
        'center'
      );
    });
  }

  private getPowerUpIcon(type: PowerUp['type']): string {
    const icons = {
      health: '+',
      weapon: '⚡',
      shield: '🛡',
      multishot: '※'
    };
    return icons[type] || '?';
  }

  private renderExplosions(): void {
    this.explosions.forEach(explosion => {
      const alpha = explosion.life / explosion.maxLife;
      this.ctx.strokeStyle = explosion.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Inner explosion
      this.ctx.strokeStyle = '#ffffff' + Math.floor(alpha * 128).toString(16).padStart(2, '0');
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(explosion.x, explosion.y, explosion.radius * 0.5, 0, Math.PI * 2);
      this.ctx.stroke();
    });
  }

  private renderUI(): void {
    // Score
    this.drawText(`Score: ${Math.floor(this.score)}`, 20, 30, 24, BRAND_COLORS.light);
    
    // Wave
    this.drawText(`Wave: ${this.waveNumber}`, 20, 60, 18, BRAND_COLORS.secondary);
    
    // Health bar
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthPercent = this.player.health / this.player.maxHealth;
    
    this.drawText('Health:', 20, 100, 16, BRAND_COLORS.light);
    this.drawRect(80, 85, healthBarWidth, healthBarHeight, '#333');
    this.drawRect(80, 85, healthBarWidth * healthPercent, healthBarHeight, '#00ff00');
    
    // Shield bar
    if (this.player.shield > 0) {
      const shieldPercent = this.player.shield / 50;
      this.drawText('Shield:', 20, 130, 16, BRAND_COLORS.light);
      this.drawRect(80, 115, healthBarWidth, healthBarHeight, '#333');
      this.drawRect(80, 115, healthBarWidth * shieldPercent, healthBarHeight, '#00ffff');
    }
    
    // Weapon level
    this.drawText(`Weapon: Lv.${this.player.weaponLevel}`, this.config.width - 150, 30, 18, BRAND_COLORS.primary);
    
    // Enemy count
    this.drawText(`Enemies: ${this.enemies.length}`, this.config.width - 150, 60, 16, BRAND_COLORS.secondary);
  }

  private renderWaveTransition(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // Wave complete text
    this.ctx.shadowColor = BRAND_COLORS.primary;
    this.ctx.shadowBlur = 20;
    this.drawText(`Wave ${this.waveNumber - 1} Complete!`, this.config.width / 2, this.config.height / 2 - 40, 36, BRAND_COLORS.primary, 'center');
    this.ctx.shadowBlur = 0;
    
    this.drawText('Prepare for next wave...', this.config.width / 2, this.config.height / 2 + 20, 20, BRAND_COLORS.secondary, 'center');
  }

  private renderGameOverScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // Game Over text
    this.ctx.shadowColor = BRAND_COLORS.secondary;
    this.ctx.shadowBlur = 20;
    this.drawText('GAME OVER', this.config.width / 2, this.config.height / 2 - 60, 48, BRAND_COLORS.secondary, 'center');
    this.ctx.shadowBlur = 0;
    
    this.drawText(`Final Score: ${Math.floor(this.score)}`, this.config.width / 2, this.config.height / 2 - 10, 24, BRAND_COLORS.light, 'center');
    this.drawText(`Wave Reached: ${this.waveNumber}`, this.config.width / 2, this.config.height / 2 + 20, 20, BRAND_COLORS.primary, 'center');
    
    // Restart instruction
    const pulseAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    this.ctx.globalAlpha = pulseAlpha;
    this.drawText('Tap or press SPACE to restart', this.config.width / 2, this.config.height / 2 + 80, 18, '#ccc', 'center');
    this.ctx.globalAlpha = 1;
  }
}

interface SpaceDefenderProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, wave: number) => void;
}

export function SpaceDefender({ onScoreUpdate, onGameOver }: SpaceDefenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<SpaceDefenderGame | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new SpaceDefenderGame(canvasRef.current);
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
        className="game-canvas border-2 border-primary/30 rounded-lg shadow-lg bg-gradient-to-b from-slate-900 to-black"
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
        <p><strong>Controls:</strong> Move with WASD/Arrow keys or touch. Hold SPACE or tap to shoot. Collect power-ups and survive the waves!</p>
      </div>
    </div>
  );
}