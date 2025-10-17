/*
  # Add Pain Points and Project Description Columns

  ## Changes
  1. Schema Updates
    - Add `pain_points` column (text) to store user's target audience pain points
    - Add `project_description` column (text) to store natural language solution description
    - Retain `core_features` for backward compatibility but make it nullable

  ## Migration Strategy
    - New columns are nullable to allow existing records to remain valid
    - Future records will use the new columns while old records keep using core_features

  ## Security
    - No RLS changes needed - existing policies already cover these columns
*/

DO $$
BEGIN
  -- Add pain_points column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompt_generations' AND column_name = 'pain_points'
  ) THEN
    ALTER TABLE prompt_generations ADD COLUMN pain_points text;
  END IF;

  -- Add project_description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompt_generations' AND column_name = 'project_description'
  ) THEN
    ALTER TABLE prompt_generations ADD COLUMN project_description text;
  END IF;
END $$;
