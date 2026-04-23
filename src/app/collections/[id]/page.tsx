'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Share2, User, Calendar, Loader2, Plus, Trash2, X, Check } from 'lucide-react';
import { PublicAnimationCard } from '@/features/gallery/components/PublicAnimationCard';
import { AnimationSummary } from '@/features/gallery/components/AnimationCard';
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
  // Phase 2: Progression fields
  is_progression?: boolean;
  parent_animation_id?: string | null;
  progression_order?: number;
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

  // Owner add/remove state
  const [removingAnimId, setRemovingAnimId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userAnimations, setUserAnimations] = useState<AnimationSummary[]>([]);
  const [loadingUserAnims, setLoadingUserAnims] = useState(false);
  const [addingAnimId, setAddingAnimId] = useState<string | null>(null);
  const [addedAnimIds, setAddedAnimIds] = useState<Set<string>>(new Set());

  const fetchCollection = useCallback(async () => {
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
  }, [collectionId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

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

  const handleRemove = async (animationId: string) => {
    if (!confirm('Remove this animation from the collection?')) return;

    setRemovingAnimId(animationId);
    try {
      const response = await fetch(
        `/api/collections/${collectionId}/animations/${animationId}`,
        { method: 'DELETE' }
      );

      if (response.status === 401) {
        router.push(`/login?redirect=/collections/${collectionId}`);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to remove animation');
      }

      setData(prev =>
        prev
          ? { ...prev, animations: prev.animations.filter(a => a.id !== animationId) }
          : null
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove animation');
    } finally {
      setRemovingAnimId(null);
    }
  };

  const fetchUserAnimations = async () => {
    setLoadingUserAnims(true);
    try {
      const response = await fetch('/api/animations?limit=100&sort=created_at&order=desc');
      if (response.status === 401) {
        router.push(`/login?redirect=/collections/${collectionId}`);
        return;
      }
      if (response.ok) {
        const responseData = await response.json();
        setUserAnimations(responseData.animations || []);
      }
    } catch (err) {
      console.error('Failed to fetch user animations:', err);
    } finally {
      setLoadingUserAnims(false);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddedAnimIds(new Set());
    fetchUserAnimations();
  };

  const handleAdd = async (animationId: string) => {
    setAddingAnimId(animationId);
    try {
      const response = await fetch(`/api/collections/${collectionId}/animations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animation_id: animationId }),
      });

      if (response.status === 401) {
        router.push(`/login?redirect=/collections/${collectionId}`);
        return;
      }

      if (response.ok || response.status === 409) {
        // 409 = already in collection — mark as added either way
        setAddedAnimIds(prev => new Set(prev).add(animationId));
      } else {
        throw new Error('Failed to add animation');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add animation');
    } finally {
      setAddingAnimId(null);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    if (addedAnimIds.size > 0) {
      // Refresh collection to show newly added animations
      setIsLoading(true);
      fetchCollection();
    }
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
  const isOwner = user?.id === collection.user_id;
  const formattedDate = new Date(collection.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Build set of animation IDs already in this collection (for add modal)
  const existingAnimIds = new Set(animations.map(a => a.id));

  // Phase 2: Group progressions under their base animations
  const collectionAnimationIds = existingAnimIds;
  const bases = animations.filter(a => !a.is_progression);
  const progressionMap = new Map<string, Animation[]>();
  const orphanProgressions: Animation[] = [];

  animations
    .filter(a => a.is_progression)
    .sort((a, b) => (a.progression_order ?? 0) - (b.progression_order ?? 0))
    .forEach(p => {
      if (p.parent_animation_id && collectionAnimationIds.has(p.parent_animation_id)) {
        const list = progressionMap.get(p.parent_animation_id) ?? [];
        list.push(p);
        progressionMap.set(p.parent_animation_id, list);
      } else {
        orphanProgressions.push(p);
      }
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
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-text-inverse/20 hover:bg-text-inverse/30 text-text-inverse font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Animations
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-text-inverse text-primary font-medium hover:bg-text-inverse/90 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {shareSuccess ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-inverse/80">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {isOwner ? 'Your Collection' : 'Collection by User'}
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
            <p className="text-text-primary/70 mb-4">
              This collection is empty.
            </p>
            {isOwner && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Animations
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Phase 2: Render base animations, each followed by their progressions */}
            {bases.map((animation) => (
              <div key={animation.id} className="contents">
                {/* Base animation card */}
                <div className="relative group">
                  <PublicAnimationCard
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
                  {isOwner && (
                    <button
                      onClick={() => handleRemove(animation.id)}
                      disabled={removingAnimId === animation.id}
                      className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                      title="Remove from collection"
                    >
                      {removingAnimId === animation.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Remove
                    </button>
                  )}
                </div>

                {/* Progression cards indented under base */}
                {progressionMap.get(animation.id)?.map((prog, i) => (
                  <div key={prog.id} className="relative group col-span-1 pl-4 border border-border">
                    <p className="text-xs text-text-primary/60 font-medium mb-1">
                      Progression {i + 1}
                    </p>
                    <PublicAnimationCard
                      animation={{
                        ...prog,
                        description: null,
                        tags: [],
                        author: { display_name: null },
                        user_has_upvoted: false,
                        thumbnail_url: prog.thumbnail,
                      }}
                      onView={handleView}
                      currentUserId={user?.id ?? null}
                      onUpvote={handleUpvote}
                      onLoginRequired={handleLoginRequired}
                      onRemix={handleRemix}
                    />
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(prog.id)}
                        disabled={removingAnimId === prog.id}
                        className="absolute top-7 left-6 z-10 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                        title="Remove from collection"
                      >
                        {removingAnimId === prog.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Phase 2: Orphaned progressions — parent not in this collection */}
            {orphanProgressions.map((prog) => (
              <div key={prog.id} className="relative group">
                <p className="text-xs text-text-primary/40 mb-1">
                  Progression (base not in collection)
                </p>
                <PublicAnimationCard
                  animation={{
                    ...prog,
                    description: null,
                    tags: [],
                    author: { display_name: null },
                    user_has_upvoted: false,
                    thumbnail_url: prog.thumbnail,
                  }}
                  onView={handleView}
                  currentUserId={user?.id ?? null}
                  onUpvote={handleUpvote}
                  onLoginRequired={handleLoginRequired}
                  onRemix={handleRemix}
                />
                {isOwner && (
                  <button
                    onClick={() => handleRemove(prog.id)}
                    disabled={removingAnimId === prog.id}
                    className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                    title="Remove from collection"
                  >
                    {removingAnimId === prog.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Animations Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-border w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Add Animations to Collection
              </h2>
              <button
                onClick={handleCloseAddModal}
                className="p-2 hover:bg-surface-warm transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingUserAnims ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : userAnimations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-primary/70 mb-4">
                    You have no saved animations.
                  </p>
                  <a
                    href="/app"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Animation
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {userAnimations.map((anim) => {
                    const alreadyIn = existingAnimIds.has(anim.id) || addedAnimIds.has(anim.id);
                    const isAdding = addingAnimId === anim.id;

                    return (
                      <div
                        key={anim.id}
                        className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">
                            {anim.title}
                          </p>
                          <p className="text-xs text-text-primary/60 mt-0.5 capitalize">
                            {anim.animation_type} · {anim.frame_count} frames
                          </p>
                        </div>
                        <button
                          onClick={() => !alreadyIn && handleAdd(anim.id)}
                          disabled={alreadyIn || isAdding}
                          className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                            alreadyIn
                              ? 'bg-surface-warm text-text-primary/40 cursor-default'
                              : 'bg-primary text-text-inverse hover:bg-primary/90 disabled:opacity-50'
                          }`}
                        >
                          {isAdding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : alreadyIn ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          {alreadyIn ? 'Added' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={handleCloseAddModal}
                className="px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
