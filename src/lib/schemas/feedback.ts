import { z } from 'zod';

export const FEEDBACK_AREAS = ['general', 'editor', 'save-share', 'gallery', 'mobile', 'other'] as const;
export const FEEDBACK_RATINGS = ['works-well', 'needs-improvement', 'broken'] as const;

export const FeedbackSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.union([z.literal(''), z.string().trim().email('Invalid email address').max(254)]).optional(),
  area: z.enum(FEEDBACK_AREAS),
  what: z.string().trim().min(1, 'Please tell us what happened').max(2000),
  rating: z.enum(FEEDBACK_RATINGS),
});

export const AdminFeedbackQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});
