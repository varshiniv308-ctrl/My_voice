-- Cognitive AI Database Schema
-- This script creates all necessary tables for the application

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  participants TEXT[] DEFAULT '{}',
  duration INTEGER DEFAULT 0,
  transcript TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  sentiment_score DECIMAL(3, 2) DEFAULT 0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  keywords TEXT[] DEFAULT '{}',
  project TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (for live streaming sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'paused', 'archived', 'terminated')),
  latency INTEGER DEFAULT 0,
  token_efficiency DECIMAL(5, 2) DEFAULT 99 CHECK (token_efficiency >= 0 AND token_efficiency <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encryption_tier TEXT DEFAULT 'standard' CHECK (encryption_tier IN ('standard', 'advanced', 'quantum')),
  ai_model TEXT DEFAULT 'cognitive-pro' CHECK (ai_model IN ('cognitive-lite', 'cognitive-pro', 'cognitive-ultra')),
  voice_tone TEXT DEFAULT 'neutral' CHECK (voice_tone IN ('formal', 'neutral', 'conversational')),
  integration_slack BOOLEAN DEFAULT FALSE,
  integration_github BOOLEAN DEFAULT FALSE,
  integration_notion BOOLEAN DEFAULT FALSE,
  webhook_url TEXT DEFAULT '',
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log for timeline
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- RLS Policies for meetings
CREATE POLICY "meetings_select_own" ON public.meetings 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meetings_insert_own" ON public.meetings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meetings_update_own" ON public.meetings 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meetings_delete_own" ON public.meetings 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "sessions_select_own" ON public.sessions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON public.sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update_own" ON public.sessions 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sessions_delete_own" ON public.sessions 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for settings
CREATE POLICY "settings_select_own" ON public.settings 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON public.settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON public.settings 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "settings_delete_own" ON public.settings 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_log
CREATE POLICY "activity_log_select_own" ON public.activity_log 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_log_insert_own" ON public.activity_log 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_log_delete_own" ON public.activity_log 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON public.meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
