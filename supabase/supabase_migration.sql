-- Create the submission_entries table
CREATE TABLE IF NOT EXISTS submission_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  commander_id INTEGER NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, commander_id)
);

-- Drop the submissions table if it exists (we're moving to submission_entries only)
DROP TABLE IF EXISTS submissions;

-- Create a function to handle submission updates
CREATE OR REPLACE FUNCTION update_user_submission(
  p_user_id UUID,
  p_entries JSONB
) RETURNS VOID AS $$
BEGIN
  -- Delete existing entries for this user
  DELETE FROM submission_entries WHERE user_id = p_user_id;
  
  -- The new entries will be inserted by the application
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle the entire submission transaction
CREATE OR REPLACE FUNCTION handle_submission_transaction(
  p_user_id UUID,
  p_entries TEXT
) RETURNS VOID AS $$
DECLARE
  entry_record RECORD;
  entries_json JSONB;
BEGIN
  -- Parse the JSON string into JSONB
  entries_json := p_entries::JSONB;
  
  -- Start a transaction
  BEGIN
    -- Delete existing entries for this user
    DELETE FROM submission_entries WHERE user_id = p_user_id;
    
    -- Insert new entries from the JSON array
    FOR entry_record IN SELECT * FROM jsonb_array_elements(entries_json)
    LOOP
      INSERT INTO submission_entries (user_id, commander_id, tier)
      VALUES (
        p_user_id,
        (entry_record.value->>'commander_id')::INTEGER,
        entry_record.value->>'tier'
      );
    END LOOP;
    
  -- If any error occurs, the transaction will be rolled back
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submission_entries_user_id ON submission_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_entries_commander_id ON submission_entries(commander_id);
CREATE INDEX IF NOT EXISTS idx_submission_entries_tier ON submission_entries(tier);

-- Create a function to get the most common tier for each commander
CREATE OR REPLACE FUNCTION get_most_common_tiers_for_commanders()
RETURNS TABLE (
  commander_id INTEGER,
  most_common_tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_tiers AS (
    SELECT 
      se.commander_id,
      se.tier,
      COUNT(*) as tier_count,
      ROW_NUMBER() OVER (PARTITION BY se.commander_id ORDER BY COUNT(*) DESC) as rank
    FROM 
      submission_entries se
    GROUP BY 
      se.commander_id, se.tier
  )
  SELECT 
    rt.commander_id,
    rt.tier as most_common_tier
  FROM 
    ranked_tiers rt
  WHERE 
    rt.rank = 1;
END;
$$ LANGUAGE plpgsql;

-- Create an index on the submission_entries table to speed up queries
CREATE INDEX IF NOT EXISTS idx_submission_entries_commander_tier 
ON submission_entries(commander_id, tier);

-- Create an index on the user_id column for faster lookups
CREATE INDEX IF NOT EXISTS idx_submission_entries_user_id
ON submission_entries(user_id);
