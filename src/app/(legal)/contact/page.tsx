'use client';

import { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Using Formspree for form handling
      const response = await fetch('https://formspree.io/f/placeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      setError('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">Message Sent!</h1>
        <p className="text-text-primary/70 mb-8 max-w-md mx-auto">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <a href="/" className="text-primary hover:underline">
          ← Back to Home
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">Contact Us</h1>
      <p className="text-text-primary/70 mb-8">
        Have a question, feedback, or need help? We&apos;d love to hear from you.
      </p>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            aria-label="Subject"
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none bg-white"
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="feedback">Feedback</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none resize-none"
            placeholder="How can we help?"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            'Sending...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Other Ways to Reach Us</h2>
        <p className="text-text-primary/70">
          For urgent matters or if the form isn&apos;t working, you can email us directly at{' '}
          <a href="mailto:support@coachinganimator.com" className="text-primary hover:underline">
            support@coachinganimator.com
          </a>
        </p>
      </div>
    </div>
  );
}
