import { Component, ReactNode } from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackTitle?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component that catches rendering errors and displays
 * a graceful fallback UI instead of crashing the entire application.
 * 
 * Styled according to Tactical Clubhouse aesthetic:
 * - Pitch Green background
 * - Sharp corners (no border-radius)
 * - Monospace fonts for technical details
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details to console for debugging
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error details:', errorInfo);
    }

    handleRefresh = () => {
        // Reload the page to recover
        window.location.reload();
    };

    handleStartNew = () => {
        // Clear all localStorage and reload to start fresh
        localStorage.clear();
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const { fallbackTitle = 'Application Error' } = this.props;
            const { error } = this.state;

            return (
                <div className="flex items-center justify-center h-full bg-pitch-green p-8">
                    <div className="bg-tactics-white border-4 border-pitch-green p-8 max-w-2xl">
                        <div className="mb-6">
                            <h2 className="text-2xl font-heading font-bold text-pitch-green mb-2">
                                {fallbackTitle}
                            </h2>
                            <p className="text-tactical-mono-700 mb-4">
                                Something went wrong in this section of the application.
                            </p>

                            {error && (
                                <details className="mb-4">
                                    <summary className="cursor-pointer text-sm font-mono text-tactical-mono-600 hover:text-pitch-green">
                                        Technical Details
                                    </summary>
                                    <pre className="mt-2 p-4 bg-tactical-mono-100 text-xs font-mono overflow-auto">
                                        {error.message}
                                        {error.stack && `\n\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-tactical-mono-600 mb-4">
                                You can try refreshing the page or starting a new project to recover.
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    onClick={this.handleRefresh}
                                    variant="default"
                                    className="flex-1"
                                >
                                    Refresh Page
                                </Button>

                                <Button
                                    onClick={this.handleStartNew}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Start New Project
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
