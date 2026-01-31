'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Group, Circle, Ellipse, Text, Line } from 'react-konva';

interface Frame {
  id: string;
  duration?: number;
  entities: Record<string, Entity>;
  annotations?: Annotation[];
}

interface Entity {
  id: string;
  type: 'player' | 'ball' | 'cone' | 'marker';
  x: number;
  y: number;
  team: 'attack' | 'defense' | 'neutral';
  color: string;
  label?: string;
}

interface Annotation {
  id: string;
  type: 'arrow' | 'line';
  points: number[];
  color: string;
}

interface Payload {
  version: string;
  name: string;
  sport: string;
  frames: Frame[];
  settings: Record<string, unknown>;
}

interface ReplayViewerProps {
  payload: Payload;
}

const DESIGN_TOKENS = {
  colors: {
    primary: '#1A3D1A',
    textInverse: '#F8F9FA',
    attack: ['#2563EB', '#10B981', '#06B6D4', '#8B5CF6'],
    defense: ['#DC2626', '#EA580C', '#F59E0B', '#EF4444'],
    neutral: ['#FFFFFF', '#8B4513', '#FFD700', '#FF6B35'],
  }
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function ReplayViewer({ payload }: ReplayViewerProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fieldImage, setFieldImage] = useState<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Load field SVG
  useEffect(() => {
    const img = new window.Image();
    img.src = '/assets/fields/rugby-union.svg';
    img.onload = () => setFieldImage(img);
    img.onerror = () => console.error('Failed to load field image');
  }, []);

  const frames = payload?.frames || [];
  const currentFrame = frames[currentFrameIndex];

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => {
      if (prev >= frames.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  const prevFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentFrameIndex, frames.length]);

  // Use requestAnimationFrame for smooth playback
  useEffect(() => {
    if (!isPlaying || !currentFrame) return;

    const duration = currentFrame.duration || 1000;
    
    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastFrameTimeRef.current;
      
      if (elapsed >= duration) {
        lastFrameTimeRef.current = timestamp;
        nextFrame();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameTimeRef.current = 0;
    };
  }, [isPlaying, currentFrame, nextFrame]);

  if (!frames.length) {
    return (
      <div className="text-center py-20 text-text-primary/70">
        No frames to display
      </div>
    );
  }

  const entities = currentFrame ? Object.values(currentFrame.entities || {}) : [];
  const annotations = currentFrame?.annotations || [];

  // Get entity color matching editor logic
  const getEntityColor = (entity: Entity): string => {
    if (entity.color) return entity.color;
    
    switch (entity.type) {
      case 'ball':
        return '#854D0E';
      case 'cone':
        return '#EA580C';
      case 'marker':
        return DESIGN_TOKENS.colors.primary;
      case 'player':
        const teamColors = {
          attack: DESIGN_TOKENS.colors.attack[0],
          defense: DESIGN_TOKENS.colors.defense[0],
          neutral: DESIGN_TOKENS.colors.neutral[0]
        };
        return teamColors[entity.team] || DESIGN_TOKENS.colors.primary;
      default:
        return DESIGN_TOKENS.colors.primary;
    }
  };

  // Get entity radius matching editor logic
  const getEntityRadius = (type: Entity['type']): number => {
    switch (type) {
      case 'player': return 20;
      case 'ball': return 12;
      case 'cone': return 15;
      case 'marker': return 10;
      default: return 20;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Canvas using react-konva to match editor */}
      <div className="w-full max-w-[800px] aspect-[4/3] border border-border overflow-hidden">
        <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          {/* Field background layer */}
          <Layer listening={false}>
            {fieldImage && (
              <KonvaImage
                image={fieldImage}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                listening={false}
              />
            )}
          </Layer>

          {/* Annotations layer */}
          <Layer listening={false}>
            {annotations.map((annotation) => {
              if (annotation.points.length < 4) return null;
              return (
                <Line
                  key={annotation.id}
                  points={annotation.points}
                  stroke={annotation.color}
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}
          </Layer>

          {/* Entities layer */}
          <Layer>
            {entities.map((entity) => {
              const color = getEntityColor(entity);
              const radius = getEntityRadius(entity.type);
              
              return (
                <Group key={entity.id} x={entity.x} y={entity.y}>
                  {entity.type === 'ball' ? (
                    <Ellipse
                      radiusX={18}
                      radiusY={12}
                      fill={color}
                      stroke="#1A3D1A"
                      strokeWidth={1}
                    />
                  ) : (
                    <Circle
                      radius={radius}
                      fill={color}
                    />
                  )}
                  {entity.type === 'player' && entity.label && (
                    <Text
                      text={entity.label}
                      fontSize={14}
                      fontFamily="Inter, system-ui, sans-serif"
                      fill={DESIGN_TOKENS.colors.textInverse}
                      align="center"
                      verticalAlign="middle"
                      width={radius * 2}
                      height={radius * 2}
                      offsetX={radius}
                      offsetY={radius}
                      listening={false}
                    />
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={reset}
          className="p-2 border border-border hover:bg-surface-warm transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={prevFrame}
          disabled={currentFrameIndex === 0}
          className="p-2 border border-border hover:bg-surface-warm transition-colors disabled:opacity-50"
          title="Previous frame"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="p-3 bg-primary text-text-inverse hover:bg-primary/90 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={nextFrame}
          disabled={currentFrameIndex >= frames.length - 1}
          className="p-2 border border-border hover:bg-surface-warm transition-colors disabled:opacity-50"
          title="Next frame"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <span className="text-sm text-text-primary/70 ml-2">
          Frame {currentFrameIndex + 1} / {frames.length}
        </span>
      </div>

      {/* Frame strip */}
      <div className="mt-4 flex gap-1 overflow-x-auto pb-2 max-w-full">
        {frames.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentFrameIndex(index);
              setIsPlaying(false);
            }}
            className={`w-8 h-8 flex-shrink-0 border transition-colors ${
              index === currentFrameIndex
                ? 'bg-primary text-text-inverse border-primary'
                : 'bg-surface border-border hover:border-primary'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
