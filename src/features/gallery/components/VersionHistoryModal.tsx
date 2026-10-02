'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { X, Clock, User, RotateCcw, Loader2 } from 'lucide-react';

interface Version {
  id: string;
  version_number: string;
  major_version: number;
  minor_version: number;
  created_by: string | null;
  created_at: string;
}

interface VersionHistoryModalProps {
  animationId: string;
  currentVersion: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function VersionHistoryModal({
  animationId,
  currentVersion,
  isOpen,
  onClose,
  onRestore,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchVersions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/animations/${animationId}/versions`);
        if (!response.ok) {
          throw new Error('Failed to load version history');
        }
        const data = await response.json();
        setVersions(data.versions || []);
      } catch (err) {
        console.error('[Versions] Load error:', err);
        setError('Could not load version history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [animationId, isOpen]);

  const handleRestore = async (versionId: string, versionNumber: string) => {
    if (!confirm(`Restore version ${versionNumber}? This will create a new version with the content from v${versionNumber}.`)) {
      return;
    }

    setRestoringId(versionId);
    try {
      const response = await fetch(`/api/animations/${animationId}/versions/${versionId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      const result = await response.json();
      toast.success(`Version restored as new version ${result.new_version}`);

      // Refresh version list
      const refreshResponse = await fetch(`/api/animations/${animationId}/versions`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setVersions(data.versions || []);
      }

      onRestore?.();
    } catch (err) {
      console.error('[Versions] Restore error:', err);
      toast.error("Couldn't restore that version. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60">
      <div className="bg-surface border border-border max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-heading font-semibold text-text-primary">
            Version History
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-warm transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-text-inverse font-medium"
              >
                Close
              </button>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-primary/70">No version history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => {
                const isCurrent = version.version_number === currentVersion;
                const isRestoring = restoringId === version.id;

                return (
                  <div
                    key={version.id}
                    className={`border p-4 ${isCurrent
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-surface'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-lg font-semibold ${isCurrent ? 'text-primary' : 'text-text-primary'
                            }`}>
                            v{version.version_number}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-primary text-text-inverse text-xs font-medium">
                              CURRENT
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-text-primary/70">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(version.created_at)}
                          </span>
                          {version.created_by && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Created by you
                            </span>
                          )}
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => handleRestore(version.id, version.version_number)}
                          disabled={isRestoring}
                          className="flex items-center gap-2 px-3 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {isRestoring ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-primary/50">
            Restoring a version creates a new version with the old content. The latest 4 versions are kept automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
