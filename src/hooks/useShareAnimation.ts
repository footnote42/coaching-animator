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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create share');
            }

            const { id } = await response.json();

            // Construct share URL
            // Logic: If on localhost, use window.location.origin.
            // In production, we might want to use the configured FRONTEND_URL if available, 
            // but window.location.origin is usually safe IF the app usage flows from the same domain.
            const shareUrl = `${window.location.origin}/replay/${id}`;

            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);

            return shareUrl;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            return null;
        } finally {
            setIsSharing(false);
        }
    };

    return { shareAnimation, isSharing, error };
}
