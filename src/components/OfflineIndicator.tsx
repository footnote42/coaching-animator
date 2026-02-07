'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { offlineQueue } from '@/lib/offline-queue';
import { postWithRetry } from '@/lib/api-client';
import { toast } from 'sonner';

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [queueLength, setQueueLength] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Initial check
        setIsOffline(!navigator.onLine);
        setQueueLength(offlineQueue.getQueue().length);

        // Event handlers
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        const handleQueueChange = () => setQueueLength(offlineQueue.getQueue().length);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('offline-queue-changed', handleQueueChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('offline-queue-changed', handleQueueChange);
        };
    }, []);

    const handleSync = async () => {
        if (isSyncing || isOffline) return;

        setIsSyncing(true);
        const queue = offlineQueue.getQueue();
        let successCount = 0;
        const errors: string[] = [];

        toast.info('Syncing offline changes...');

        for (const item of queue) {
            try {
                if (item.method === 'POST') {
                    const result = await postWithRetry(item.endpoint, item.payload);
                    if (result.ok) {
                        offlineQueue.removeItem(item.id);
                        successCount++;
                    } else {
                        // If completely failed (e.g. 400 Bad Request), maybe we should remove it? 
                        // But for now keeping it to prevent data loss.
                        // Unless status is 4xx (client error), then retry is futile.
                        if (result.status >= 400 && result.status < 500) {
                            console.error('Client error syncing item', item.id, result.error);
                            // Optional: Move to "failed" queue or just keep it?
                        }
                        errors.push(result.error || 'Unknown error');
                    }
                }
                // Handle other methods if needed (item.method === 'PUT' etc)
            } catch (e) {
                errors.push(e instanceof Error ? e.message : 'Sync error');
            }
        }

        setIsSyncing(false);

        if (successCount > 0) {
            toast.success(`Synced ${successCount} items successfully.`);
        }

        if (errors.length > 0) {
            toast.error(`Failed to sync ${errors.length} items. Will retry later.`);
        }
    };

    if (!isOffline && queueLength === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {/* Offline Banner */}
            {isOffline && (
                <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto animate-in slide-in-from-bottom-5">
                    <WifiOff className="w-5 h-5 text-red-400" />
                    <div className="text-sm font-medium">
                        You are offline. Changes saved locally.
                    </div>
                </div>
            )}

            {/* Sync Banner */}
            {!isOffline && queueLength > 0 && (
                <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 pointer-events-auto animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <div className="text-sm font-medium">
                            {queueLength} change{queueLength !== 1 ? 's' : ''} pending sync
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors flex items-center gap-2"
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            )}
        </div>
    );
}
