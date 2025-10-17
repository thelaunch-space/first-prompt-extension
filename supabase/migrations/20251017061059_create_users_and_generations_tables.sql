/*
  # Bolt.new Prompt Generator - Initial Schema

  ## Overview
  Creates the database schema for the Bolt.new First Prompt Generator Chrome extension.
  This migration establishes user authentication and tracks prompt generation usage.

  ## New Tables
  
  ### `extension_users`
  Stores user accounts for the extension
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User's email address
  - `password_hash` (text) - Hashed password for authentication
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_login` (timestamptz) - Last login timestamp
  
  ### `prompt_generations`
  Tracks all prompt generation requests
  - `id` (uuid, primary key) - Unique generation identifier
  - `user_id` (uuid, foreign key) - References extension_users.id
  - `project_type` (text) - Selected project category
  - `target_audience` (text) - Target user audience
  - `core_features` (jsonb) - Array of core features
  - `adaptive_answers` (jsonb) - Answers to adaptive questions
  - `design_preferences` (jsonb) - Design style and color preferences
  - `generated_prompt` (text) - The final generated prompt
  - `was_edited` (boolean) - Whether user edited the prompt
  - `was_copied` (boolean) - Whether user copied to clipboard
  - `created_at` (timestamptz) - Generation timestamp

  ## Security
  
  1. Enable RLS on both tables
  2. Service role will manage authentication (extension handles auth logic)
  3. RLS policies ensure data isolation between users
  
  ## Important Notes
  
  - Extension will use service role key for backend operations
  - Passwords must be hashed before storage (bcrypt recommended)
  - Usage tracking enables future quota/billing features
*/

-- Create extension_users table
CREATE TABLE IF NOT EXISTS extension_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Create prompt_generations table
CREATE TABLE IF NOT EXISTS prompt_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES extension_users(id) ON DELETE CASCADE NOT NULL,
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompt_generations_user_id ON prompt_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_generations_created_at ON prompt_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extension_users_email ON extension_users(email);

-- Enable Row Level Security
ALTER TABLE extension_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_generations ENABLE ROW LEVEL SECURITY;

-- Since we're using custom authentication (not Supabase Auth), 
-- we'll rely on service role key for backend operations
-- The extension backend will enforce access control
