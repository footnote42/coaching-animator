import { z } from 'zod';

export const PracticeVisibilitySchema = z.enum(['private', 'link', 'public']);

export const CreatePracticeSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().max(2000).nullish(),
  visibility: PracticeVisibilitySchema.default('private'),
  script: z.unknown(),
});
