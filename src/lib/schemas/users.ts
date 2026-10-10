import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  display_name: z.string().max(50).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
