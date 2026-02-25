import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const UpdateProfileSchema = z.object({
  display_name: z.string().max(50).optional().nullable(),
  club_name: z.string().max(100).optional().nullable(),
  primary_strip_color: z.string().regex(hexColorRegex, 'Must be a hex color like #FF0000').optional().nullable(),
  secondary_strip_color: z.string().regex(hexColorRegex, 'Must be a hex color like #FF0000').optional().nullable(),
  club_badge_url: z.string().url('Must be a valid URL').optional().nullable(),
});

export const UserRoleSchema = z.enum(['user', 'admin']);

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().max(50).nullable(),
  animation_count: z.number().int().min(0),
  role: UserRoleSchema,
  banned_at: z.string().nullable(),
  ban_reason: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ReportActionSchema = z.object({
  action: z.enum(['dismiss', 'hide', 'delete', 'warn_user', 'ban_user']),
  reason: z.string().max(500).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ReportActionInput = z.infer<typeof ReportActionSchema>;
