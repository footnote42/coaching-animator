import { useState } from 'react';
import { serializeForShare } from '@/utils/serializeForShare';
import type { Project } from '@/types';

export function useShareAnimation() {
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shareAnimation = async (project: Project): Promise<string | null> => {
        setIsSharing(true);
        setError(null);

        try {
            const payload = serializeForShare(project);

            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Handle different error scenarios
                if (response.status === 404) {
                    throw new Error('Share feature not available in development. Please deploy to Vercel or run the API server locally.');
                }
                
                if (response.status === 413) {
                    throw new Error('Animation is too large to share. Try reducing the number of frames or removing complex elements.');
                }

                if (response.status === 500) {
                    const errorData = await response.json().catch(() => ({}));
                    if (errorData.setupRequired) {
                        throw new Error('Share feature not configured. Please set up Supabase environment variables.');
                    }
                    throw new Error('Server error occurred. Please try again later.');
                }

                // Try to parse error response, fallback to generic message
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create share (${response.status})`);
            }

            const { id } = await response.json();

            // Construct share URL with environment awareness
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/replay/${id}`;

            // Copy to clipboard with error handling
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch (clipboardError) {
                console.warn('Failed to copy to clipboard:', clipboardError);
                // Still return the URL even if clipboard fails
                return shareUrl;
            }

            return shareUrl;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error occurred while sharing';
            setError(message);
            console.error('Share animation error:', err);
            return null;
        } finally {
            setIsSharing(false);
        }
    };

    return { shareAnimation, isSharing, error };
}
