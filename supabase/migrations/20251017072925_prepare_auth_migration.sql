/*
  # Prepare for Supabase Auth Migration

  ## Overview
  Prepares the database for migration to Supabase Auth by creating a temporary
  mapping table and relaxing constraints temporarily.

  ## Changes Made

  1. **Temporarily disable FK constraint**
     - Drop the foreign key to extension_users
     - This allows us to update user_id values after auth user creation

  2. **Keep RLS disabled temporarily**
     - RLS will be enabled after user migration is complete

  3. **Note**
     - Next steps require manual user creation in Supabase Auth Dashboard
     - Then we'll update prompt_generations.user_id to match new auth.users.id
*/

-- Step 1: Drop existing foreign key constraint to allow user_id updates
ALTER TABLE prompt_generations 
DROP CONSTRAINT IF EXISTS prompt_generations_user_id_fkey;

-- Step 2: Temporarily disable RLS to allow service role operations during migration
ALTER TABLE prompt_generations DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing RLS policies
DROP POLICY IF EXISTS "Users can view own prompt generations" ON prompt_generations;
DROP POLICY IF EXISTS "Users can insert own prompt generations" ON prompt_generations;
DROP POLICY IF EXISTS "Users can update own prompt generations" ON prompt_generations;
DROP POLICY IF EXISTS "Users can delete own prompt generations" ON prompt_generations;

-- Migration is prepared. Next steps:
-- 1. Create user in auth.users via Supabase Auth (using Auth Edge Function)
-- 2. Update prompt_generations.user_id to match new auth user ID
-- 3. Apply final migration with FK constraint and RLS policies