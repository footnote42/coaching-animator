import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface ShareSheetProps {
    animationId: string;
    animationTitle: string;
    open: boolean;
    onClose: () => void;
}

export function ShareSheet({ animationId, animationTitle, open, onClose }: ShareSheetProps) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/share/${animationId}` : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link', error);
            toast.error('Failed to copy link');
        }
    };

    const handleShare = async () => {
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: animationTitle,
                    url: url
                });
                return;
            } catch (error) {
                // Ignore AbortError if user cancels the share sheet
            }
        }
        // Fallback to copy if share API is not supported or fails
        handleCopy();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Animation</DialogTitle>
                    <DialogDescription>
                        Anyone with this link can view the animation.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-4">
                    <Input
                        readOnly
                        value={url}
                        className="flex-1 text-sm font-mono"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button type="button" size="icon" onClick={handleShare}>
                        <span className="sr-only">Copy</span>
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
