// HTML5 Canvas Game Engine with Touch Controls
// Designed for 60fps performance and mobile optimization

export interface GameConfig {
  width: number;
  height: number;
  targetFPS: number;
  enableTouch: boolean;
  enableKeyboard: boolean;
  backgroundColor: string;
}

export interface TouchInput {
  x: number;
  y: number;
  startX: number;
  startY: number;
  isDown: boolean;
  justPressed: boolean;
  justReleased: boolean;
  swipeDirection?: 'up' | 'down' | 'left' | 'right' | null;
}

export interface KeyboardInput {
  keys: Set<string>;
  justPressed: Set<string>;
  justReleased: Set<string>;
}

export abstract class GameEngine {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected config: GameConfig;
  protected touch: TouchInput;
  protected keyboard: KeyboardInput;
  protected isRunning = false;
  protected lastFrameTime = 0;
  protected fps = 0;
  protected frameCount = 0;
  protected fpsUpdateTime = 0;
  protected score = 0;
  protected gameStartTime = 0;
  protected isPaused = false;

  constructor(canvas: HTMLCanvasElement, config: Partial<GameConfig> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.config = {
      width: 800,
      height: 600,
      targetFPS: 60,
      enableTouch: true,
      enableKeyboard: true,
      backgroundColor: '#1a1a2e',
      ...config
    };

    this.touch = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      isDown: false,
      justPressed: false,
      justReleased: false,
      swipeDirection: null
    };

    this.keyboard = {
      keys: new Set(),
      justPressed: new Set(),
      justReleased: new Set()
    };

    this.setupCanvas();
    this.setupInputHandlers();
  }

  private setupCanvas(): void {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.touchAction = 'none';
    this.canvas.style.userSelect = 'none';
    
    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupInputHandlers(): void {
    if (this.config.enableTouch) {
      this.setupTouchControls();
    }

    if (this.config.enableKeyboard) {
      this.setupKeyboardControls();
    }
  }

  private setupTouchControls(): void {
    // Touch/Mouse events with unified handling
    const getEventPos = (e: TouchEvent | MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      let clientX: number, clientY: number;
      
      if (e instanceof TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    // Unified start handler
    const handleStart = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      const pos = getEventPos(e);
      this.touch.x = pos.x;
      this.touch.y = pos.y;
      this.touch.startX = pos.x;
      this.touch.startY = pos.y;
      this.touch.isDown = true;
      this.touch.justPressed = true;
      this.touch.swipeDirection = null;
    };

    // Unified move handler
    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!this.touch.isDown) return;
      e.preventDefault();
      const pos = getEventPos(e);
      this.touch.x = pos.x;
      this.touch.y = pos.y;
      
      // Calculate swipe direction
      const deltaX = this.touch.x - this.touch.startX;
      const deltaY = this.touch.y - this.touch.startY;
      const minSwipeDistance = 30;
      
      if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.touch.swipeDirection = deltaX > 0 ? 'right' : 'left';
        } else {
          this.touch.swipeDirection = deltaY > 0 ? 'down' : 'up';
        }
      }
    };

    // Unified end handler
    const handleEnd = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      this.touch.isDown = false;
      this.touch.justReleased = true;
    };

    // Touch events
    this.canvas.addEventListener('touchstart', handleStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleMove, { passive: false });
    this.canvas.addEventListener('touchend', handleEnd, { passive: false });

    // Mouse events for desktop testing
    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mousemove', handleMove);
    this.canvas.addEventListener('mouseup', handleEnd);
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.keyboard.keys.has(e.code)) {
        this.keyboard.justPressed.add(e.code);
      }
      this.keyboard.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keyboard.keys.delete(e.code);
      this.keyboard.justReleased.add(e.code);
    });
  }

  // Input utility methods
  protected isKeyPressed(key: string): boolean {
    return this.keyboard.keys.has(key);
  }

  protected wasKeyJustPressed(key: string): boolean {
    return this.keyboard.justPressed.has(key);
  }

  protected isTouchDown(): boolean {
    return this.touch.isDown;
  }

  protected wasTouchJustPressed(): boolean {
    return this.touch.justPressed;
  }

  protected getTouchPosition(): { x: number; y: number } {
    return { x: this.touch.x, y: this.touch.y };
  }

  protected getSwipeDirection(): string | null {
    return this.touch.swipeDirection || null;
  }

  // Game loop
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameStartTime = Date.now();
    this.lastFrameTime = performance.now();
    this.init();
    this.gameLoop();
  }

  public pause(): void {
    this.isPaused = !this.isPaused;
  }

  public stop(): void {
    this.isRunning = false;
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // FPS calculation
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }

    if (!this.isPaused) {
      this.update(deltaTime);
    }
    
    this.render();
    this.clearInputStates();

    requestAnimationFrame(this.gameLoop);
  };

  private clearInputStates(): void {
    this.touch.justPressed = false;
    this.touch.justReleased = false;
    this.keyboard.justPressed.clear();
    this.keyboard.justReleased.clear();
  }

  // Rendering utilities
  protected clear(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  protected drawText(text: string, x: number, y: number, size: number = 20, color: string = '#ffffff', align: CanvasTextAlign = 'left'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px 'Roboto Condensed', monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  protected drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  protected drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  protected drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.fill();
  }

  // Game state methods
  protected addScore(points: number): void {
    this.score += points;
  }

  protected getScore(): number {
    return this.score;
  }

  protected getGameTime(): number {
    return Date.now() - this.gameStartTime;
  }

  protected getFPS(): number {
    return this.fps;
  }

  // Abstract methods that games must implement
  abstract init(): void;
  abstract update(deltaTime: number): void;
  abstract render(): void;

  // Optional method for cleanup
  public cleanup(): void {
    this.stop();
  }
}

// Utility functions for game development
export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static distance(a: Vector2, b: Vector2): number {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  static normalize(v: Vector2): Vector2 {
    const length = Math.sqrt(v.x ** 2 + v.y ** 2);
    return length > 0 ? new Vector2(v.x / length, v.y / length) : new Vector2();
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
}

export class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  contains(x: number, y: number): boolean {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  intersects(other: Rectangle): boolean {
    return !(other.x > this.x + this.width || 
             other.x + other.width < this.x || 
             other.y > this.y + this.height || 
             other.y + other.height < this.y);
  }
}

// Color utilities using the specified brand colors
export const BRAND_COLORS = {
  primary: '#4A2DEF',      // Vibrant Blue
  secondary: '#FF5733',    // Energetic Orange  
  dark: '#2A2A2A',         // Dark neutral
  light: '#F5F5F5',        // Light neutral
  success: '#00C851',
  warning: '#FFD54F',
  error: '#FF6B6B'
};

// Performance monitoring
export class PerformanceMonitor {
  private metrics = {
    frameTime: 0,
    updateTime: 0,
    renderTime: 0,
    lastUpdate: 0
  };

  startFrame(): void {
    this.metrics.lastUpdate = performance.now();
  }

  markUpdate(): void {
    const now = performance.now();
    this.metrics.updateTime = now - this.metrics.lastUpdate;
    this.metrics.lastUpdate = now;
  }

  markRender(): void {
    const now = performance.now();
    this.metrics.renderTime = now - this.metrics.lastUpdate;
    this.metrics.frameTime = this.metrics.updateTime + this.metrics.renderTime;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}