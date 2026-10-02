// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { AnimationCard } from '@/features/gallery/components/AnimationCard';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="icon-clock" />,
  Layers: () => <div data-testid="icon-layers" />,
  EyeOff: () => <div data-testid="icon-eye-off" />,
  Link: () => <div data-testid="icon-link" />,
  Globe: () => <div data-testid="icon-globe" />,
  Pencil: () => <div data-testid="icon-pencil" />,
  Settings: () => <div data-testid="icon-settings" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Play: () => <div data-testid="icon-play" />,
  History: () => <div data-testid="icon-history" />,
  Share2: () => <div data-testid="icon-share" />,
  FilePlus: () => <div data-testid="icon-file-plus" />,
  Unlink: () => <div data-testid="icon-unlink" />,
  MoreHorizontal: () => <div data-testid="icon-more" />,
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock sub-components
vi.mock('@/features/gallery/components/MiniPitchSVG', () => ({
  MiniPitchSVG: () => <div data-testid="mini-pitch-svg" />,
}));

vi.mock('@/features/gallery/components/ProgressionStrip', () => ({
  ProgressionStrip: () => <div data-testid="progression-strip" />,
}));

vi.mock('@/features/gallery/components/VersionHistoryModal', () => ({
  VersionHistoryModal: () => <div data-testid="version-history-modal" />,
}));

vi.mock('@/features/animation/components/ShareSheet', () => ({
  ShareSheet: () => <div data-testid="share-sheet" />,
}));

const mockAnimation = {
  id: 'test-id',
  title: 'Test Animation',
  animation_type: 'tactic' as const,
  duration_ms: 5000,
  frame_count: 5,
  visibility: 'public' as const,
  upvote_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('AnimationCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders "Edit Frames" button for owned animations', () => {
    render(
      <AnimationCard 
        animation={mockAnimation} 
        showActions={true} 
      />
    );

    const editFramesBtn = screen.getByRole('button', { name: /edit frames/i });
    expect(editFramesBtn).toBeDefined();
  });

  it('renders "Edit Info" button instead of generic "Edit"', () => {
    render(
      <AnimationCard 
        animation={mockAnimation} 
        showActions={true} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /more actions/i }));
    const editInfoBtn = screen.getByRole('menuitem', { name: /edit info/i });
    expect(editInfoBtn).toBeDefined();
    expect(screen.queryByRole('button', { name: /^edit$/i })).toBeNull();
  });
});
