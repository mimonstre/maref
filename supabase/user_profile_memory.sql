ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS compare_state JSONB DEFAULT '{"groups":[],"snapshots":{},"updatedAt":null}'::jsonb,
  ADD COLUMN IF NOT EXISTS mimo_memory JSONB DEFAULT '[]'::jsonb;
