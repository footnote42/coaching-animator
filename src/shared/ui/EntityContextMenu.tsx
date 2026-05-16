import { useEffect, useRef } from 'react';

export interface EntityContextMenuProps {
    /** Position of the menu */
    position: { x: number; y: number } | null;

    /** Called when duplicate is clicked */
    onDuplicate: () => void;

    /** Called when delete is clicked */
    onDelete: () => void;

    /** Called when edit label is clicked */
    onEditLabel: () => void;

    /** Called when bring forward is clicked */
    onBringForward?: () => void;

    /** Called when send backward is clicked */
    onSendBackward?: () => void;

    /** Whether the entity can be moved forward */
    canBringForward: boolean;

    /** Whether the entity can be moved backward */
    canSendBackward: boolean;

    /** Called when menu should close */
    onClose: () => void;
}

/**
 * EntityContextMenu component.
 * Simple custom right-click context menu for entity actions.
 * Uses Constitution-compliant styling (sharp corners, monospace, pitch green).
 */
export function EntityContextMenu({
    position,
    onDuplicate,
    onDelete,
    onEditLabel,
    onBringForward,
    onSendBackward,
    canBringForward,
    canSendBackward,
    onClose,
}: EntityContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click or Escape key
    useEffect(() => {
        if (!position) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [position, onClose]);

    if (!position) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-48 bg-white border border-[var(--color-border)] shadow-lg"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <button
                onClick={() => {
                    onEditLabel();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-pitch-green hover:text-tactics-white transition-colors border-b border-[var(--color-surface-warm)]"
            >
                Edit Label
            </button>
            <button
                onClick={() => {
                    if (canBringForward && onBringForward) {
                        onBringForward();
                        onClose();
                    }
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-[var(--color-surface-warm)] ${
                    canBringForward 
                    ? "hover:bg-pitch-green hover:text-tactics-white" 
                    : "opacity-40 cursor-not-allowed pointer-events-none"
                }`}
            >
                Bring Forward
            </button>
            <button
                onClick={() => {
                    if (canSendBackward && onSendBackward) {
                        onSendBackward();
                        onClose();
                    }
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-[var(--color-surface-warm)] ${
                    canSendBackward 
                    ? "hover:bg-pitch-green hover:text-tactics-white" 
                    : "opacity-40 cursor-not-allowed pointer-events-none"
                }`}
            >
                Send Backward
            </button>
            <button
                onClick={() => {
                    onDuplicate();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-pitch-green hover:text-tactics-white transition-colors border-b border-[var(--color-surface-warm)]"
            >
                Duplicate
            </button>
            <button
                onClick={() => {
                    onDelete();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-600 hover:text-white transition-colors"
            >
                Delete
            </button>
        </div>
    );
}
