'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Maximize, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// Lazy load game components for better performance
const PuzzleQuest = React.lazy(() => import('@/components/games/puzzle-quest').then(m => ({ default: m.PuzzleQuest })));
const NeonRunner = React.lazy(() => import('@/components/games/neon-runner').then(m => ({ default: m.NeonRunner })));
const SpaceDefender = React.lazy(() => import('@/components/games/space-defender').then(m => ({ default: m.SpaceDefender })));

interface GameWrapperProps {
  gameId: string;
  gameTitle: string;
  gameDescription: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  onScoreUpdate?: (score: number) => void;
  onGameComplete?: (score: number, ...args: any[]) => void;
}

export function GameWrapper({
  gameId,
  gameTitle,
  gameDescription,
  difficulty = 'medium',
  onScoreUpdate,
  onGameComplete
}: GameWrapperProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [gameKey, setGameKey] = React.useState(0);
  const gameContainerRef = React.useRef<HTMLDivElement>(null);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleFullscreen = async () => {
    if (!gameContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await gameContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const restartGame = () => {
    setGameKey(prev => prev + 1);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderGame = () => {
    const gameProps = {
      key: gameKey,
      onScoreUpdate,
      onGameComplete
    };

    switch (gameId) {
      case 'puzzle-quest':
        return <PuzzleQuest {...gameProps} />;
      case 'neon-runner':
        return <NeonRunner {...gameProps} />;
      case 'space-defender':
        return <SpaceDefender {...gameProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Game not available</p>
              <p className="text-sm text-muted-foreground mt-2">
                The requested game "{gameId}" could not be loaded.
              </p>
            </div>
          </div>
        );
    }
  };

  // Handle fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-heading">{gameTitle}</CardTitle>
            <p className="text-muted-foreground">{gameDescription}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getDifficultyColor(difficulty)} text-white border-none`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              <Badge variant="secondary">
                HTML5 Canvas
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={restartGame}
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={gameContainerRef}
          className={`relative rounded-lg overflow-hidden ${isFullscreen ? 'fullscreen-game' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}
        >
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="game-loading mb-4">
                    <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-muted-foreground">Loading game...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Initializing game engine and assets
                  </p>
                </div>
              </div>
            }
          >
            {renderGame()}
          </Suspense>
          
          {/* Performance indicator for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
              FPS: <span className="fps-counter">60</span>
            </div>
          )}
        </div>
      </CardContent>

      <style jsx>{`
        .fullscreen-game {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fullscreen-game canvas {
          max-width: 100vw;
          max-height: 100vh;
          object-fit: contain;
        }
      `}</style>
    </Card>
  );
}

// Mobile-optimized game controls component
export function MobileGameControls({ 
  onMove, 
  onAction, 
  showDirectional = true, 
  showAction = true 
}: {
  onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAction?: (action: 'primary' | 'secondary') => void;
  showDirectional?: boolean;
  showAction?: boolean;
}) {
  if (!showDirectional && !showAction) return null;

  return (
    <div className="mobile-controls fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-50 lg:hidden">
      {showDirectional && (
        <div className="directional-pad grid grid-cols-3 gap-1">
          <div />
          <button 
            className="control-button"
            onTouchStart={() => onMove?.('up')}
            onTouchEnd={(e) => e.preventDefault()}
          >
            ↑
          </button>
          <div />
          
          <button 
            className="control-button"
            onTouchStart={() => onMove?.('left')}
            onTouchEnd={(e) => e.preventDefault()}
          >
            ←
          </button>
          <div />
          <button 
            className="control-button"
            onTouchStart={() => onMove?.('right')}
            onTouchEnd={(e) => e.preventDefault()}
          >
            →
          </button>
          
          <div />
          <button 
            className="control-button"
            onTouchStart={() => onMove?.('down')}
            onTouchEnd={(e) => e.preventDefault()}
          >
            ↓
          </button>
          <div />
        </div>
      )}

      {showAction && (
        <div className="action-buttons flex gap-2">
          <button 
            className="control-button bg-primary text-primary-foreground"
            onTouchStart={() => onAction?.('primary')}
            onTouchEnd={(e) => e.preventDefault()}
          >
            A
          </button>
          <button 
            className="control-button bg-secondary text-secondary-foreground"
            onTouchStart={() => onAction?.('secondary')}
            onTouchEnd={(e) => e.preventDefault()}
          >
            B
          </button>
        </div>
      )}

      <style jsx>{`
        .control-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(74, 45, 239, 0.8);
          border: none;
          color: white;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px -3px rgba(74, 45, 239, 0.4);
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
          transition: all 0.1s ease;
        }

        .control-button:active {
          transform: scale(0.95);
          background: rgba(74, 45, 239, 1);
        }

        .mobile-controls {
          pointer-events: none;
        }

        .control-button {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}

// Game statistics component
interface GameStatsProps {
  stats: {
    score?: number;
    time?: number;
    level?: number;
    lives?: number;
    [key: string]: any;
  };
}

export function GameStats({ stats }: GameStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
      {stats.score !== undefined && (
        <div className="text-center">
          <div className="text-2xl font-bold text-primary score-display">
            {stats.score.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Score</div>
        </div>
      )}
      
      {stats.time !== undefined && (
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">
            {formatTime(stats.time)}
          </div>
          <div className="text-sm text-muted-foreground">Time</div>
        </div>
      )}
      
      {stats.level !== undefined && (
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {stats.level}
          </div>
          <div className="text-sm text-muted-foreground">Level</div>
        </div>
      )}
      
      {stats.lives !== undefined && (
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive">
            {stats.lives}
          </div>
          <div className="text-sm text-muted-foreground">Lives</div>
        </div>
      )}
    </div>
  );
}