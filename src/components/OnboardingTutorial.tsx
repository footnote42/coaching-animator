'use client';

import { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step {
    title: string;
    description: string;
    image?: string;
}

const STEPS: Step[] = [
    {
        title: 'Welcome to Coaching Animator',
        description: 'Create professional rugby animations in minutes. Here\'s a quick guide to get you started.',
    },
    {
        title: '1. Add Players & Equipment',
        description: 'Drag and drop players, balls, and equipment from the sidebar onto the pitch. Supports Union, League, and Touch fields.',
    },
    {
        title: '2. Create Animation Frames',
        description: 'Move players to their next position and click "Add Frame". We smooth out the movement between frames automatically.',
    },
    {
        title: '3. Share & Export',
        description: 'Save your animation to your library, share it with a link, or export as a GIF/MP4 for social media.',
    }
];

interface OnboardingTutorialProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface-warm/50">
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-8 rounded-full transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-border'
                                    }`}
                            />
                        ))}
                    </div>
                    <button onClick={onClose} className="text-text-primary/50 hover:text-text-primary" aria-label="Close tutorial">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-2xl">
                        {currentStep === 0 ? '👋' :
                            currentStep === 1 ? '🏉' :
                                currentStep === 2 ? '🎬' : '🚀'}
                    </div>

                    <h2 className="text-2xl font-heading font-bold text-text-primary mb-3">
                        {step.title}
                    </h2>
                    <p className="text-text-primary/70 leading-relaxed">
                        {step.description}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex justify-between items-center bg-surface-warm/30">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="text-text-primary/70"
                    >
                        Back
                    </Button>

                    <Button
                        onClick={handleNext}
                        className="flex items-center gap-2"
                    >
                        {currentStep === STEPS.length - 1 ? (
                            <>Get Started <Check className="w-4 h-4" /></>
                        ) : (
                            <>Next <ChevronRight className="w-4 h-4" /></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
