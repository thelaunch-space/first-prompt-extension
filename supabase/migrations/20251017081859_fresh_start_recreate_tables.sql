/*
  # Fresh Start - Recreate Tables for Supabase Auth

  ## Overview
  Drops existing tables and recreates them with proper Supabase Auth integration.
  This is a clean slate for the extension.

  ## Changes Made

  1. **Drop Old Tables**
     - Drop prompt_generations table
     - Drop extension_users table (no longer needed)

  2. **Create New prompt_generations Table**
     - Links directly to auth.users via user_id
     - Stores all prompt generation data
     - Includes tracking fields (was_edited, was_copied)

  3. **Security**
     - Enable RLS on prompt_generations
     - Create policies using auth.uid()
     - Users can only access their own data

  ## Important Notes
  - No more extension_users table (using auth.users instead)
  - All authentication handled by Supabase Auth
  - Users will appear in User Management dashboard
  - Proper bcrypt password hashing
  - JWT token management
*/

-- Step 1: Drop existing tables
DROP TABLE IF EXISTS prompt_generations CASCADE;
DROP TABLE IF EXISTS extension_users CASCADE;

-- Step 2: Create prompt_generations table with auth.users FK
CREATE TABLE prompt_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_type text NOT NULL,
  target_audience text NOT NULL,
  core_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  adaptive_answers jsonb DEFAULT '{}'::jsonb,
  design_preferences jsonb DEFAULT '{}'::jsonb,
  generated_prompt text NOT NULL,
  was_edited boolean DEFAULT false,
  was_copied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Step 3: Enable RLS
ALTER TABLE prompt_generations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies using auth.uid()

CREATE POLICY "Users can view own prompt generations"
  ON prompt_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt generations"
  ON prompt_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt generations"
  ON prompt_generations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt generations"
  ON prompt_generations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 5: Create index for better query performance
CREATE INDEX idx_prompt_generations_user_id ON prompt_generations(user_id);
CREATE INDEX idx_prompt_generations_created_at ON prompt_generations(created_at DESC);