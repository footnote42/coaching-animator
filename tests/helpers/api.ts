import { Page } from '@playwright/test';

/**
 * Create test animation via API
 * Returns animation ID
 */
export async function createTestAnimation(
  page: Page,
  options: {
    title?: string;
    tags?: string[];
    videoUrl?: string;
  } = {}
): Promise<string> {
  const payload = {
    title: options.title || 'Test Animation',
    animation_type: 'tactic',
    tags: options.tags || [],
    video_url: options.videoUrl,
    visibility: 'public',
    payload: {
      version: '1.0.0',
      name: options.title || 'Test Animation',
      sport: 'rugby-union',
      frames: [
        {
          id: 'frame-1',
          entities: {
            'player-1': {
              id: 'player-1',
              type: 'player',
              team: 'attack',
              x: 400,
              y: 300,
              color: '#ef4444',
              label: 'Att 01',
            },
          },
          annotations: [],
        },
      ],
      settings: {
        pitchLayout: 'standard',
        defaultTransitionDuration: 2000,
        exportResolution: '720p',
      },
    },
  };

  const response = await page.request.post('/api/animations', {
    data: payload,
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Failed to create animation: ${response.status()} - ${body}`);
  }

  const data = await response.json();
  // API returns animation object directly (not wrapped)
  return data.id;
}

/**
 * Create test collection via API
 * Returns collection ID
 */
export async function createTestCollection(
  page: Page,
  title: string = 'Test Collection',
  isPublic: boolean = false
): Promise<string> {
  const response = await page.request.post('/api/collections', {
    data: {
      name: title,
      description: 'E2E test collection',
      visibility: isPublic ? 'public' : 'private',
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create collection: ${response.status()}`);
  }

  const data = await response.json();
  return data.collection.id;
}

/**
 * Add animation to collection via API
 */
export async function addAnimationToCollection(
  page: Page,
  collectionId: string,
  animationId: string
): Promise<void> {
  const response = await page.request.post(
    `/api/collections/${collectionId}/animations`,
    {
      data: { animation_id: animationId },
    }
  );

  if (!response.ok()) {
    throw new Error(`Failed to add animation to collection: ${response.status()}`);
  }
}
