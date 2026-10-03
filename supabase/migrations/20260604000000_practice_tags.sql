-- Tags on a Practice (#78). Up to five, from a fixed list, stored on the row
-- and not in the Practice Script. The list repeats src/lib/practice-tags.ts;
-- practice-tags.test.ts checks the two match.
-- Not applied by this branch.

ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.practices
  DROP CONSTRAINT IF EXISTS practices_tags_valid;

ALTER TABLE public.practices
  ADD CONSTRAINT practices_tags_valid CHECK (
    cardinality(tags) <= 5
    AND tags <@ ARRAY[
      'Attack',
      'Defence',
      'Gain possession',
      'Go forward',
      'Support',
      'Continuity',
      'Pressure',
      'Score',
      'Contest possession',
      'Regain possession',
      'Pass / catch',
      'Tackling',
      'Footwork',
      'Agility',
      'Kicking',
      'Body control',
      'Fitness',
      'Attacking shape',
      'Defensive line',
      'Ruck / maul',
      'Scrum',
      'Lineout',
      'Offside',
      'Run forward / pass back',
      'Decision making',
      'Teamwork',
      'Awareness',
      'Self-organising'
    ]::text[]
  );
