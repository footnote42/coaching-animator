import { useState, useEffect } from 'react';
import type { SharePayloadV1 } from '@/types/share';

export function useSharePayload(shareId: string | undefined) {
    const [payload, setPayload] = useState<SharePayloadV1 | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shareId) {
            setError('Invalid share ID');
            setIsLoading(false);
            return;
        }

        const fetchPayload = async () => {
            try {
                const response = await fetch(`/api/share/${shareId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Share not found');
                    } else if (response.status === 410) {
                        throw new Error('Share expired (90-day limit)');
                    } else {
                        throw new Error('Failed to load animation');
                    }
                }

                const data = await response.json();
                setPayload(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayload();
    }, [shareId]);

    return { payload, isLoading, error };
}
