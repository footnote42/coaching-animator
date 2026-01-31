import { toast } from 'sonner';

export interface OfflineQueueItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE';
    payload: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
}

const QUEUE_KEY = 'offline_mutation_queue';

export const offlineQueue = {
    getQueue(): OfflineQueueItem[] {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse offline queue', e);
            return [];
        }
    },

    addItem(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): string {
        const queue = this.getQueue();
        const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newItem: OfflineQueueItem = {
            ...item,
            id,
            timestamp: Date.now(),
            retryCount: 0,
        };

        queue.push(newItem);
        this.saveQueue(queue);
        toast.info('Saved to offline queue. Will sync when online.');
        return id;
    },

    removeItem(id: string) {
        const queue = this.getQueue();
        const filtered = queue.filter(item => item.id !== id);
        this.saveQueue(filtered);
    },

    saveQueue(queue: OfflineQueueItem[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        // Trigger evident sync event or state update if we had a global store
        window.dispatchEvent(new Event('offline-queue-changed'));
    },

    clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(QUEUE_KEY);
        window.dispatchEvent(new Event('offline-queue-changed'));
    }
};
