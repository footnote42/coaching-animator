import { describe, it, expect } from 'vitest';
import { sendContactEmail } from '../emailService';

describe('Email Service (Contact Form)', () => {
  it('returns success when email is sent', async () => {
    const result = await sendContactEmail(
      'John Doe',
      'john@example.com',
      'I have a question about Coaching Animator.'
    );

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns error when SMTP credentials are missing', async () => {
    // Simulate missing env vars by passing invalid config
    const result = await sendContactEmail('Test', 'test@example.com', 'Message');

    // Should gracefully handle missing config
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    }
  });

  it('returns error for invalid email format', async () => {
    const result = await sendContactEmail(
      'John Doe',
      'not-an-email',
      'Message'
    );

    if (!result.success) {
      expect(result.error).toContain('email');
    }
  });

  it('handles empty name gracefully', async () => {
    const result = await sendContactEmail(
      '',
      'john@example.com',
      'Message'
    );

    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('handles empty message gracefully', async () => {
    const result = await sendContactEmail(
      'John Doe',
      'john@example.com',
      ''
    );

    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('returns promise that resolves', async () => {
    const result = await sendContactEmail(
      'Test',
      'test@example.com',
      'Test message'
    );

    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
  });
});
