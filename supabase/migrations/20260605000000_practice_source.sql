-- Source on a Practice (#79). The video or page a Practice is based on: an
-- optional https link and a title. Link only, no embed.
-- Not applied by this branch.

ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_title text;

ALTER TABLE public.practices
  DROP CONSTRAINT IF EXISTS practices_source_url_https,
  DROP CONSTRAINT IF EXISTS practices_source_title_length;

ALTER TABLE public.practices
  ADD CONSTRAINT practices_source_url_https CHECK (
    source_url IS NULL OR (source_url LIKE 'https://%' AND char_length(source_url) <= 2000)
  ),
  ADD CONSTRAINT practices_source_title_length CHECK (
    source_title IS NULL OR char_length(source_title) <= 200
  );
