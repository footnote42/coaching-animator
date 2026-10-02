// Matches the replay page layout: header band above a viewer area.
export default function Loading() {
    return (
        <div
            className="min-h-screen bg-[var(--color-surface-warm)]"
            role="status"
            aria-live="polite"
        >
            <header className="border-b border-border bg-surface">
                <div className="max-w-4xl mx-auto px-4 py-4 animate-pulse">
                    <div className="h-7 w-2/3 bg-text-primary/10" />
                    <div className="h-4 w-1/3 bg-text-primary/10 mt-3" />
                </div>
            </header>
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="animate-pulse bg-surface h-[300px] w-full flex items-center justify-center text-text-primary/50">
                    Loading replay...
                </div>
            </div>
        </div>
    );
}
