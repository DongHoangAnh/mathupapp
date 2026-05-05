-- Supabase schema generated from shared/schema.ts
-- Run in Supabase SQL editor or with psql using your project connection string.

-- enable UUID generator (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  grade text,
  subject text,
  points integer DEFAULT 0,
  streak integer DEFAULT 0,
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  achievements jsonb,
  created_at timestamptz DEFAULT now()
);

-- Assessments
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  knowledge_map jsonb NOT NULL,
  responses jsonb,
  completed_at timestamptz DEFAULT now()
);

-- Learning paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text,
  subject text NOT NULL,
  duration integer NOT NULL,
  topics jsonb NOT NULL,
  priority text,
  progress integer DEFAULT 0,
  estimated_duration text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Game scores
CREATE TABLE IF NOT EXISTS public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_type text,
  score integer NOT NULL,
  questions_answered integer,
  completed_at timestamptz DEFAULT now()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  topic text NOT NULL,
  difficulty integer NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON public.questions(subject, topic);

-- Optional: lightweight search index for users.username
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON public.users(LOWER(username));

-- End of schema
