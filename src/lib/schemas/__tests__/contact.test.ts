import { describe, it, expect } from 'vitest';
import { contactFormSchema } from '../contact';

describe('Contact Form Schema (Zod)', () => {
  it('validates a complete contact form submission', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I have a question about the platform.'
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('rejects when name is empty', () => {
    const data = {
      name: '',
      email: 'john@example.com',
      message: 'Message'
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('rejects when email is invalid', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      message: 'Message'
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('rejects when message is empty', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: ''
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('rejects when message is too long (>1000 chars)', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'a'.repeat(1001)
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('accepts message at max boundary (1000 chars)', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'a'.repeat(1000)
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('trims whitespace from name', () => {
    const data = {
      name: '  John Doe  ',
      email: 'john@example.com',
      message: 'Message'
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
    }
  });

  it('rejects when required fields are missing', () => {
    const data = {
      name: 'John'
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('rejects extra fields and coerces to expected shape', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Message',
      extra: 'field'
    };

    const result = contactFormSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data)).not.toContain('extra');
    }
  });
});
