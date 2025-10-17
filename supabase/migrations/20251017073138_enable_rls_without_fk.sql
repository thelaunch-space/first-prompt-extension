/*
  # Enable RLS Policies (Without FK Constraint Yet)

  ## Overview
  This enables Row Level Security policies on prompt_generations table.
  The foreign key constraint to auth.users will be added AFTER migrating existing data.

  ## Changes Made

  1. **Row Level Security Policies**
     - Enable RLS on prompt_generations table
     - Create policies using auth.uid() for authenticated users
     - Users can only access their own prompt generations

  2. **Next Steps Required**
     - Create new user account via the extension (this will create them in auth.users)
     - Manually update existing prompt_generations.user_id to match new auth user ID
     - Then apply FK constraint in a follow-up migration

  ## Security Features
  - All operations restricted to authenticated users
  - Users can only access their own data via auth.uid() matching
*/

-- Step 1: Enable RLS on prompt_generations
ALTER TABLE prompt_generations ENABLE ROW LEVEL SECURITY;

-- Step 2: Create comprehensive RLS policies using auth.uid()

-- SELECT policy: Users can only view their own prompt generations
CREATE POLICY "Users can view own prompt generations"
  ON prompt_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy: Users can only create prompt generations for themselves
CREATE POLICY "Users can insert own prompt generations"
  ON prompt_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own prompt generations
CREATE POLICY "Users can update own prompt generations"
  ON prompt_generations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can only delete their own prompt generations
CREATE POLICY "Users can delete own prompt generations"
  ON prompt_generations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Foreign key to auth.users will be added after data migration
-- Note: extension_users table preserved for reference