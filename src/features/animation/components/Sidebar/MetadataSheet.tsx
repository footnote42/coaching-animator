import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { useProjectStore } from '@/core/stores/projectStore';

const YOUTUBE_URL_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/;

function validateVideoUrl(url: string): { isValid: boolean; error?: string } {
    if (!url || url.trim() === '') {
        return { isValid: true };
    }
    if (!YOUTUBE_URL_REGEX.test(url.trim())) {
        return {
            isValid: false,
            error: 'Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)',
        };
    }
    return { isValid: true };
}

export interface MetadataSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MetadataSheet({ open, onOpenChange }: MetadataSheetProps) {
    const project = useProjectStore((state) => state.project);
    const updateProjectSettings = useProjectStore((state) => state.updateProjectSettings);

    const [videoUrl, setVideoUrl] = useState('');
    const [videoUrlError, setVideoUrlError] = useState('');

    useEffect(() => {
        if (open) {
            setVideoUrl(project?.videoUrl || '');
            setVideoUrlError('');
        }
    }, [open, project?.videoUrl]);

    const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(e.target.value);
        if (videoUrlError) {
            setVideoUrlError('');
        }
    };

    const handleVideoUrlBlur = () => {
        const validation = validateVideoUrl(videoUrl);
        if (!validation.isValid) {
            setVideoUrlError(validation.error || 'Invalid URL');
        } else {
            setVideoUrlError('');
            if (project) {
                updateProjectSettings({ videoUrl: videoUrl.trim() || undefined });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Animation Metadata</DialogTitle>
                    <DialogDescription>
                        Edit the title and associate a tutorial video with this animation.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                    {/* Title Input */}
                    <div>
                        <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">
                            Animation Title
                        </label>
                        <Input
                            type="text"
                            value={project?.name || ''}
                            onChange={(e) => updateProjectSettings({ name: e.target.value })}
                            placeholder="Enter animation title"
                            disabled={!project}
                            className="w-full text-sm"
                        />
                    </div>

                    {/* Video URL Input */}
                    <div>
                        <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">
                            Tutorial Video URL (YouTube)
                        </label>
                        <Input
                            type="url"
                            value={videoUrl}
                            onChange={handleVideoUrlChange}
                            onBlur={handleVideoUrlBlur}
                            placeholder="https://youtube.com/watch?v=..."
                            disabled={!project}
                            className={`w-full text-sm ${videoUrlError ? 'border-red-500' : ''}`}
                        />
                        {videoUrlError && (
                            <p className="text-xs text-red-600 mt-1">{videoUrlError}</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
