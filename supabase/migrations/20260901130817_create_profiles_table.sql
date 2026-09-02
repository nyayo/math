/*
# Create profiles table for MathMaster

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users ON DELETE CASCADE)
  - `first_name` (text, not null)
  - `username` (text, not null, unique)
  - `email` (text, not null)
  - `role` (text, not null, default 'student' — 'student' or 'teacher')
  - `level` (text, nullable — S1-S6 or 'University' for students)
  - `school` (text, nullable — school name for teachers)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only access their own profile row.
- SELECT: auth.uid() = id
- INSERT: auth.uid() = id
- UPDATE: auth.uid() = id
- DELETE: auth.uid() = id

3. Notes
- The `id` column matches the auth.users id, so profile rows are 1:1 with auth users.
- Username is unique across all users.
- Role defaults to 'student' for safety.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  username text NOT NULL UNIQUE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  level text,
  school text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username);
