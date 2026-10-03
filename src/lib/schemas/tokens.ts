import { z } from 'zod';

export const createTokenSchema = z.object({
  name: z.string().min(1).max(50),
});
