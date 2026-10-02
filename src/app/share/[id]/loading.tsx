// Matches the fixed full-screen ShareViewer layout so the page does not jump.
export default function Loading() {
    return (
        <div
            className="bg-black flex items-center justify-center text-white/50"
            style={{ position: 'fixed', inset: 0 }}
            role="status"
            aria-live="polite"
        >
            Loading…
        </div>
    );
}
