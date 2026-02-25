-- Migration: Create club-badges storage bucket and RLS policies
-- Description: Storage for club badge images (F-PERS-05)
-- Created: 2026-02-25

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-badges',
  'club-badges',
  true,
  524288, -- 512KB (500KB per PRD, using 512KB = 512 * 1024)
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Allow authenticated users to upload their own badge
CREATE POLICY "Users can upload their own club badge"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-badges'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Allow authenticated users to update their own badge
CREATE POLICY "Users can update their own club badge"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'club-badges'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Allow authenticated users to delete their own badge
CREATE POLICY "Users can delete their own club badge"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'club-badges'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Allow public read access (bucket is public)
CREATE POLICY "Club badges are publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'club-badges');
