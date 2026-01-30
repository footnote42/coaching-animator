'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Plus, Loader2, FolderOpen } from 'lucide-react';
import { AnimationCard, AnimationSummary } from '@/components/AnimationCard';
import { EditMetadataModal } from '@/components/EditMetadataModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { MyAnimationsQuery } from '@/lib/schemas/animations';

type SortField = MyAnimationsQuery['sort'];
type SortOrder = MyAnimationsQuery['order'];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'duration_ms', label: 'Duration' },
  { value: 'animation_type', label: 'Type' },
];

export default function MyGalleryPage() {
  const router = useRouter();
  const [animations, setAnimations] = useState<AnimationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sort, setSort] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnimations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sort,
        order,
        limit: '50',
        offset: '0',
      });

      const response = await fetch(`/api/animations?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirect=/my-gallery');
          return;
        }
        throw new Error('Failed to fetch animations');
      }

      const data = await response.json();
      setAnimations(data.animations);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sort, order, router]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/my-gallery');
        return;
      }
      
      fetchAnimations();
    };

    checkAuth();
  }, [fetchAnimations, router]);

  const handleSortChange = (newSort: SortField) => {
    if (newSort === sort) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(newSort);
      setOrder('desc');
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleEditSave = async () => {
    setEditingId(null);
    await fetchAnimations();
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/animations/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to delete animation');
      }

      setDeletingId(null);
      await fetchAnimations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setError(message);
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlay = (id: string) => {
    router.push(`/app?load=${id}`);
  };

  const editingAnimation = editingId 
    ? animations.find(a => a.id === editingId) 
    : null;

  const deletingAnimation = deletingId
    ? animations.find(a => a.id === deletingId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              My Playbook
            </h1>
            <p className="text-sm text-text-primary/70">
              {total} animation{total !== 1 ? 's' : ''} saved
            </p>
          </div>
          
          <a
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Animation
          </a>
        </div>
      </header>

      {/* Sorting controls */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b border-border bg-surface-warm">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-text-primary/70" />
          <span className="text-sm text-text-primary/70 mr-2">Sort by:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                sort === option.value
                  ? 'bg-primary text-text-inverse'
                  : 'bg-surface border border-border hover:border-primary'
              }`}
            >
              {option.label}
              {sort === option.value && (
                <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAnimations}
              className="px-4 py-2 bg-primary text-text-inverse font-medium"
            >
              Try Again
            </button>
          </div>
        ) : animations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {animations.map((animation) => (
              <AnimationCard
                key={animation.id}
                animation={animation}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingAnimation && (
        <EditMetadataModal
          animation={editingAnimation}
          onClose={() => setEditingId(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation */}
      {deletingAnimation && (
        <DeleteConfirmDialog
          title={deletingAnimation.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 bg-surface-warm border-2 border-dashed border-border flex items-center justify-center">
        <FolderOpen className="w-12 h-12 text-text-primary/30" />
      </div>
      <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
        Your Playbook is Empty
      </h2>
      <p className="text-text-primary/70 mb-6 max-w-md mx-auto">
        Start creating rugby animations and save them to the cloud to build your personal playbook.
      </p>
      <a
        href="/app"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Your First Animation
      </a>
    </div>
  );
}
