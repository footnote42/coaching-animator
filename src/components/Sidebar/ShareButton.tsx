import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useShareAnimation } from '@/hooks/useShareAnimation';
import { useProjectStore } from '@/store/projectStore';
import { Share2, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

const PRIVACY_NOTICE_KEY = 'share_privacy_notice_shown';

export function ShareButton() {
    const project = useProjectStore(state => state.project);
    const { shareAnimation, isSharing, error } = useShareAnimation();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleShare = async () => {
        if (!project) return;

        // Show privacy notice on first use
        const noticeShown = localStorage.getItem(PRIVACY_NOTICE_KEY);
        if (!noticeShown) {
            // Use a long duration for the privacy notice or just info
            // Ideally this should be a proper dialog or non-intrusive toast
            // For now, mirroring the intent with a toast
            // console.log('Privacy Notice shown'); 
            // We can use a custom toast or just info
        }

        const url = await shareAnimation(project);
        if (url) {
            toast.success('Link copied - paste into WhatsApp');
            // Check if first use for privacy notice to bundle
            if (!noticeShown) {
                toast.info('Privacy Notice: Shared animations are stored for 90 days.');
                localStorage.setItem(PRIVACY_NOTICE_KEY, 'true');
            }
        } else if (error) {
            toast.error(`Failed to share: ${error}`);
        }
    };

    return (
        <Button
            onClick={handleShare}
            disabled={!project || !isOnline || isSharing}
            variant="secondary"
            className="w-full gap-2"
        >
            {!isOnline ? (
                <>
                    <WifiOff className="h-4 w-4" />
                    Offline
                </>
            ) : isSharing ? (
                <>Sharing...</>
            ) : (
                <>
                    <Share2 className="h-4 w-4" />
                    Share Link
                </>
            )}
        </Button>
    );
}
