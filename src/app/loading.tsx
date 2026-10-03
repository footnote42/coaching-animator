import { RugbyBallSpinner } from '@/shared/ui/RugbyBallSpinner';

export default function Loading() {
    return (
        <div
            className="min-h-[50vh] flex items-center justify-center"
            role="status"
            aria-live="polite"
        >
            <RugbyBallSpinner className="w-10 h-10" />
            <span className="sr-only">Loading</span>
        </div>
    );
}
