import { useEffect, useRef, useState } from 'react';

export interface InlineEditorProps {
    /** Initial value for the input */
    initialValue: string;

    /** Position of the editor (screen coordinates) */
    position: { x: number; y: number };

    /** Called when editing is confirmed (Enter key) */
    onConfirm: (value: string) => void;

    /** Called when editing is cancelled (Escape key or blur) */
    onCancel: () => void;

    /** Maximum length for the input */
    maxLength?: number;
}

/**
 * InlineEditor component.
 * Absolute-positioned text input for editing entity labels on the canvas.
 */
export function InlineEditor({
    initialValue,
    position,
    onConfirm,
    onCancel,
    maxLength = 10,
}: InlineEditorProps) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus and select text on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onConfirm(value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    };

    const handleBlur = () => {
        // Confirm on blur
        onConfirm(value);
    };

    return (
        <div
            className="fixed z-50"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                maxLength={maxLength}
                className="w-20 px-2 py-1 text-sm text-center font-mono border-2 border-pitch-green bg-white focus:outline-none focus:ring-2 focus:ring-pitch-green"
            />
        </div>
    );
}
