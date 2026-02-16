'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Share2, User, Calendar, Loader2 } from 'lucide-react';
import { PublicAnimationCard } from '@/features/gallery/components/PublicAnimationCard';
import { AnimationType } from '@/lib/schemas/animations';
import { useUser } from '@/lib/contexts/UserContext';

interface Animation {
  id: string;
  title: string;
  animation_type: AnimationType;
  thumbnail: string | null;
  duration_ms: number;
  frame_count: number;
  visibility: string;
  upvote_count: number;
  created_at: string;
  added_at: string;
}

interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: 'private' | 'public';
  created_at: string;
  updated_at: string;
}

interface CollectionData {
  collection: Collection;
  animations: Animation[];
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const collectionId = params.id as string;

  const [data, setData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collections/${collectionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Collection not found');
          }
          throw new Error('Failed to load collection');
        }
        const collectionData = await response.json();
        setData(collectionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  const handleShare = async () => {
    const url = `${window.location.origin}/collections/${collectionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL to clipboard');
    }
  };

  const handleView = (animationId: string) => {
    router.push(`/replay/${animationId}`);
  };

  const handleUpvote = async (animationId: string): Promise<{ upvoted: boolean; upvote_count: number } | null> => {
    try {
      const response = await fetch(`/api/animations/${animationId}/upvote`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
    return null;
  };

  const handleLoginRequired = () => {
    router.push(`/login?redirect=/collections/${collectionId}`);
  };

  const handleRemix = (animationId: string) => {
    router.push(`/app?remix=${animationId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            {error || 'Collection not found'}
          </h1>
          <button
            onClick={() => router.push('/gallery')}
            className="mt-4 px-4 py-2 bg-primary text-text-inverse font-medium"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const { collection, animations } = data;
  const formattedDate = new Date(collection.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-primary text-text-inverse">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-text-inverse/80 max-w-3xl">
                  {collection.description}
                </p>
              )}
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-text-inverse text-primary font-medium hover:bg-text-inverse/90 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {shareSuccess ? 'Copied!' : 'Share'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-inverse/80">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Collection by User
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span>
              {animations.length} animation{animations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* Animations Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {animations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏉</div>
            <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
              No Animations Yet
            </h2>
            <p className="text-text-primary/70">
              This collection is empty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {animations.map((animation) => (
              <PublicAnimationCard
                key={animation.id}
                animation={{
                  ...animation,
                  description: null,
                  tags: [],
                  author: { display_name: null },
                  user_has_upvoted: false,
                  thumbnail_url: animation.thumbnail,
                }}
                onView={handleView}
                currentUserId={user?.id ?? null}
                onUpvote={handleUpvote}
                onLoginRequired={handleLoginRequired}
                onRemix={handleRemix}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
