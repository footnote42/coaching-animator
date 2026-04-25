import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be 1000 characters or less')
}).strip();
