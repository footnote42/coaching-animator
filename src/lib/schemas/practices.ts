import { z } from 'zod';

export const PracticeVisibilitySchema = z.enum(['private', 'link', 'public']);

export const CreatePracticeSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().max(2000).nullish(),
  visibility: PracticeVisibilitySchema.default('private'),
  script: z.unknown(),
});

export const UpdatePracticeSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(2000).nullable().optional(),
    visibility: PracticeVisibilitySchema.optional(),
    script: z.unknown().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: 'Nothing to update' });

export const PublicPracticesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
