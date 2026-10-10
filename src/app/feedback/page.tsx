'use client';

import { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [what, setWhat] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, area, what, rating }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      setError('Failed to send. Please try again or email hello@waynetellis.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-text-primary">
        <div className="w-16 h-16 bg-success-surface flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-4">Feedback received</h1>
        <p className="text-text-primary/70 mb-8">
          Thank you — your input will help shape the app.
        </p>
        <Link href="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 text-text-primary">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-heading font-bold mb-2">Send Feedback</h1>
      <p className="text-text-primary/70 mb-8">
        We&apos;re running a coach testing session. Tell us what worked, what didn&apos;t, and what&apos;s missing. No need to be formal — just tell us what you noticed.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="feedback-name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="feedback-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="feedback-email" className="block text-sm font-medium mb-1">
            Email <span className="font-normal text-text-muted">(optional — for follow-up)</span>
          </label>
          <input
            id="feedback-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="feedback-area" className="block text-sm font-medium mb-1">Area</label>
          <select
            id="feedback-area"
            name="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
            aria-label="Area"
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none bg-surface"
          >
            <option value="">Select an area</option>
            <option value="general">General</option>
            <option value="editor">Practice editor</option>
            <option value="save-share">Save &amp; Share</option>
            <option value="gallery">Gallery</option>
            <option value="mobile">Mobile Layout</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="feedback-what" className="block text-sm font-medium mb-1">What happened / what you expected</label>
          <textarea
            id="feedback-what"
            name="what"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none resize-none"
            placeholder="Describe what you found..."
          />
        </div>

        <div className="mb-6">
          <label htmlFor="feedback-rating" className="block text-sm font-medium mb-1">Overall</label>
          <select
            id="feedback-rating"
            name="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
            aria-label="Overall rating"
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none bg-surface"
          >
            <option value="">Select one</option>
            <option value="works-well">Works well</option>
            <option value="needs-improvement">Needs improvement</option>
            <option value="broken">Broken</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-surface border border-danger/40 text-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Sending...' : (
            <>
              <Send className="w-4 h-4" />
              Send Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
