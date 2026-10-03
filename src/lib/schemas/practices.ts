import { z } from 'zod';
import { PRACTICE_TAGS, MAX_PRACTICE_TAGS } from '@/lib/practice-tags';

export const PracticeVisibilitySchema = z.enum(['private', 'link', 'public']);

/** Up to five known Tags, no repeats. */
export const PracticeTagsSchema = z
  .array(z.enum(PRACTICE_TAGS))
  .max(MAX_PRACTICE_TAGS)
  .refine((t) => new Set(t).size === t.length, { message: 'Tags must not repeat' });

export const CreatePracticeSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().max(2000).nullish(),
  visibility: PracticeVisibilitySchema.default('private'),
  tags: PracticeTagsSchema.default([]),
  script: z.unknown(),
});

export const UpdatePracticeSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(2000).nullable().optional(),
    visibility: PracticeVisibilitySchema.optional(),
    tags: PracticeTagsSchema.optional(),
    script: z.unknown().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: 'Nothing to update' });

export const PublicPracticesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export const PRACTICE_REPORT_REASONS = ['inappropriate', 'spam', 'copyright', 'safeguarding', 'other'] as const;

export const PracticeReportSchema = z.object({
  reason: z.enum(PRACTICE_REPORT_REASONS),
  details: z.string().trim().max(500).optional(),
});

export const AdminPracticeReportsQuerySchema = z.object({
  status: z.enum(['open', 'dismissed', 'actioned']).default('open'),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const PracticeReportActionSchema = z.object({
  action: z.enum(['dismiss', 'hide', 'unhide', 'delete', 'ban_user']),
  reason: z.string().trim().max(500).optional(),
});
