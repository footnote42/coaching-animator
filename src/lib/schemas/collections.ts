import { z } from 'zod';

// Reuse visibility schema for consistency
export const CollectionVisibilitySchema = z.enum(['private', 'public']);

// Create collection schema
export const CreateCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  visibility: CollectionVisibilitySchema.optional().default('public'),
});

// Update collection schema (all fields optional for partial updates)
export const UpdateCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  visibility: CollectionVisibilitySchema.optional(),
});

// Add animation to collection schema
export const AddAnimationToCollectionSchema = z.object({
  animation_id: z.string().uuid('Invalid animation ID'),
});

// Query params for listing collections
export const ListCollectionsQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  visibility: CollectionVisibilitySchema.optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

// TypeScript types inferred from schemas
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
export type AddAnimationToCollectionInput = z.infer<typeof AddAnimationToCollectionSchema>;
export type ListCollectionsQuery = z.infer<typeof ListCollectionsQuerySchema>;
