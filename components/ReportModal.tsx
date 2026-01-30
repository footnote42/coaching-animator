'use client';

import { useState } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import { ReportReason } from '@/lib/schemas/animations';

interface ReportModalProps {
  animationId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Contains offensive or inappropriate material' },
  { value: 'spam', label: 'Spam', description: 'Promotional content or repetitive posts' },
  { value: 'copyright', label: 'Copyright Violation', description: 'Uses copyrighted material without permission' },
  { value: 'other', label: 'Other', description: 'Another reason not listed above' },
];

export function ReportModal({ animationId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animation_id: animationId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDetails('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-heading font-semibold">Report Animation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-warm transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Report Submitted</h3>
            <p className="text-sm text-text-primary/70">
              Thank you for helping keep our community safe. Our team will review your report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            <p className="text-sm text-text-primary/70 mb-4">
              Please select a reason for reporting this animation. Our moderation team will review your report.
            </p>

            {/* Reason selection */}
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                    reason === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-text-primary/60">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Additional details */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Additional Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-border focus:border-primary focus:outline-none text-sm resize-none"
                placeholder="Provide any additional context..."
              />
              <div className="text-xs text-text-primary/50 text-right mt-1">
                {details.length}/500
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border hover:border-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
