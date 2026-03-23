-- MacroClawAgent — Supabase Database Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New Query → Paste & Run

-- ============================================================
-- USERS TABLE
-- Extends Supabase's built-in auth.users with app-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  -- Strava integration
  strava_athlete_id   TEXT UNIQUE,
  strava_access_token  TEXT,  -- Store encrypted in production
  strava_refresh_token TEXT,  -- Store encrypted in production
  strava_token_expires_at TIMESTAMPTZ,
  -- Health profile (collected in onboarding)
  weight_kg        NUMERIC(5,2),
  height_cm        INTEGER,
  date_of_birth    DATE,
  gender           TEXT CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  unit_preference  TEXT DEFAULT 'metric',
  profile_complete BOOLEAN DEFAULT FALSE,
  -- App preferences
  calorie_goal   INTEGER DEFAULT 2000,
  protein_goal   INTEGER DEFAULT 120,  -- grams
  carbs_goal     INTEGER DEFAULT 250,  -- grams
  fat_goal       INTEGER DEFAULT 70,   -- grams
  fitness_goal   TEXT DEFAULT 'performance', -- lose_weight | build_muscle | performance | maintain
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add fitness_goal to existing databases (safe to run if column already exists)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fitness_goal TEXT DEFAULT 'performance';

-- ============================================================
-- MEAL PLANS TABLE
-- Stores AI-generated meal plans linked to Strava activity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date            DATE NOT NULL,
  -- AI-generated meal data as JSONB for flexibility
  meals           JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Macro totals
  total_calories  INTEGER,
  total_protein   INTEGER,
  total_carbs     INTEGER,
  total_fat       INTEGER,
  -- Source activity that triggered this plan
  strava_activity_id TEXT,
  -- Uber Eats integration
  uber_cart_id    TEXT,
  uber_checkout_url TEXT,
  cart_status     TEXT DEFAULT 'pending' CHECK (cart_status IN ('pending', 'built', 'ordered', 'delivered')),
  -- Metadata
  ai_model        TEXT DEFAULT 'claude-sonnet-4-6',
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- One plan per user per day
  UNIQUE (user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only see and modify their own meal plans
CREATE POLICY "meal_plans_all_own"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a users row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE
-- ============================================================
-- Run this manually in Supabase Dashboard → Storage → New Bucket:
--   Name: avatars
--   Public bucket: YES
-- Then add a policy so authenticated users can upload to their own folder:
--   Allowed operation: INSERT
--   Policy: (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================================
-- PHASE 2 — DATA-DRIVEN ARCHITECTURE
-- ============================================================

-- Activities (synced from Strava or manually added)
CREATE TABLE IF NOT EXISTS public.activities (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  strava_activity_id    TEXT UNIQUE,
  type                  TEXT NOT NULL CHECK (type IN ('Run','Ride','Swim','Other')),
  name                  TEXT NOT NULL,
  started_at            TIMESTAMPTZ NOT NULL,
  duration_seconds      INTEGER NOT NULL,
  distance_meters       NUMERIC(10,2) NOT NULL,
  calories              INTEGER NOT NULL DEFAULT 0,
  elevation_meters      NUMERIC(8,1),
  avg_heart_rate        INTEGER,
  pace_seconds_per_km   NUMERIC(8,2),
  speed_kmh             NUMERIC(6,2),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_type ON public.activities (user_id, type);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_all_own" ON public.activities FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Nutrition logs — one row per user per day (pre-aggregated daily totals)
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date                DATE NOT NULL,
  calories_consumed   INTEGER NOT NULL DEFAULT 0,
  protein_g           NUMERIC(7,2) NOT NULL DEFAULT 0,
  carbs_g             NUMERIC(7,2) NOT NULL DEFAULT 0,
  fat_g               NUMERIC(7,2) NOT NULL DEFAULT 0,
  hydration_ml        INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs (user_id, date DESC);

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_logs_all_own" ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Food log items — individual food entries per meal (source of truth; nutrition_logs is derived)
CREATE TABLE IF NOT EXISTS public.food_log_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_tag    TEXT NOT NULL DEFAULT 'Meal',
  name        TEXT NOT NULL,
  calories    INTEGER NOT NULL DEFAULT 0,
  protein_g   NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs_g     NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat_g       NUMERIC(6,1) NOT NULL DEFAULT 0,
  source      TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'photo_ai' | 'barcode'
  batch_id    UUID,       -- shared UUID for all items from the same photo upload
  dish_name   TEXT,       -- human-readable dish name (e.g. "Chicken & Rice")
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Run this if table already exists (adds new columns safely):
-- ALTER TABLE public.food_log_items ADD COLUMN IF NOT EXISTS batch_id UUID;
-- ALTER TABLE public.food_log_items ADD COLUMN IF NOT EXISTS dish_name TEXT;

CREATE INDEX IF NOT EXISTS idx_food_log_items_user_date ON public.food_log_items (user_id, log_date DESC);

ALTER TABLE public.food_log_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_log_items_all_own" ON public.food_log_items FOR ALL USING (auth.uid() = user_id);

-- Chat messages — persists agent conversation history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages (user_id, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_messages_all_own" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- Extend meal_plans with label, activity_summary, and status columns
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS activity_summary TEXT;
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'built', 'ordered', 'delivered'));

-- ============================================================
-- BETA SIGNUPS TABLE
-- Public waitlist collected via /join page (QR code / events).
-- Run in Supabase SQL Editor after deploying the /join page.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.beta_signups (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name     TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  phone         TEXT,
  sport         TEXT,
  signed_up_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (unauthenticated) users to insert a signup
CREATE POLICY "public_insert_beta_signups"
  ON public.beta_signups FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- PHASE 3 — COMMUNITY & SOCIAL
-- Run this block in Supabase SQL Editor
-- ============================================================

-- 1. Extend users with social/profile columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- 2. Broaden users SELECT policy so authenticated users can view each other's profiles
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Community posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  meal_name      TEXT NOT NULL,
  caption        TEXT NOT NULL DEFAULT '',
  post_type      TEXT NOT NULL DEFAULT 'home_cooked'
                   CHECK (post_type IN ('home_cooked','meal_prep','eating_out')),
  restaurant_name TEXT,
  image_uri      TEXT,
  calories       INTEGER NOT NULL DEFAULT 0,
  protein_g      NUMERIC(7,2) NOT NULL DEFAULT 0,
  carbs_g        NUMERIC(7,2) NOT NULL DEFAULT 0,
  fat_g          NUMERIC(7,2) NOT NULL DEFAULT 0,
  ingredients    TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_posts_user ON public.community_posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts (created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community_posts_select_all" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "community_posts_insert_own" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_posts_delete_own" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- 4. Community likes
CREATE TABLE IF NOT EXISTS public.community_likes (
  post_id    UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select_all"  ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own"  ON public.community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own"  ON public.community_likes FOR DELETE USING (auth.uid() = user_id);

-- 5. Follows
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id  UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select_all"  ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 6. Storage bucket for community post images
-- Run manually in Supabase Dashboard → Storage → New Bucket:
--   Name: community-images   Public: YES
-- Policy (INSERT): auth.uid()::text = (storage.foldername(name))[1]
