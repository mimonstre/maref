-- Create user_profiles table for storing decision preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  budget TEXT DEFAULT 'Modere',
  priority TEXT DEFAULT 'Fiabilite',
  horizon TEXT DEFAULT '3-5 ans',
  usage TEXT DEFAULT 'Usage quotidien',
  risk TEXT DEFAULT 'Prudent',
  compare_count INT DEFAULT 0,
  guide_progress JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);
