-- Add prestige_id column to submission_entries table if it doesn't exist
ALTER TABLE submission_entries ADD COLUMN IF NOT EXISTS prestige_id INTEGER;

-- Update the update_user_submission stored procedure to include prestige_id
CREATE OR REPLACE FUNCTION update_user_submission(
  p_user_id UUID,
  p_entries JSONB
) RETURNS VOID AS $$
BEGIN
  -- Delete existing entries for this user
  DELETE FROM submission_entries WHERE user_id = p_user_id;
  
  -- Insert new entries
  FOR i IN 0..jsonb_array_length(p_entries) - 1 LOOP
    INSERT INTO submission_entries (
      user_id, 
      commander_id, 
      tier,
      prestige_id
    )
    VALUES (
      p_user_id,
      (p_entries->i->>'commander_id')::INTEGER,
      p_entries->i->>'tier',
      (p_entries->i->>'prestige_id')::INTEGER
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_submission_transaction stored procedure to include prestige_id
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
      INSERT INTO submission_entries (user_id, commander_id, tier, prestige_id)
      VALUES (
        p_user_id,
        (entry_record.value->>'commander_id')::INTEGER,
        entry_record.value->>'tier',
        (entry_record.value->>'prestige_id')::INTEGER
      );
    END LOOP;
    
  -- If any error occurs, the transaction will be rolled back
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Update the stored procedure to include prestige_id in the aggregation
CREATE OR REPLACE FUNCTION get_most_common_tiers_for_commanders()
RETURNS TABLE (
  commander_id INTEGER,
  prestige_id INTEGER,
  tier TEXT,
  vote_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH tier_counts AS (
    SELECT 
      submission_entries.commander_id,
      submission_entries.prestige_id,
      submission_entries.tier,
      COUNT(*) as count
    FROM submission_entries
    GROUP BY submission_entries.commander_id, submission_entries.prestige_id, submission_entries.tier
  ),
  ranked_tiers AS (
    SELECT
      tier_counts.commander_id,
      tier_counts.prestige_id,
      tier_counts.tier,
      tier_counts.count as vote_count,
      ROW_NUMBER() OVER (PARTITION BY tier_counts.commander_id, tier_counts.prestige_id ORDER BY tier_counts.count DESC) as rank
    FROM tier_counts
  )
  SELECT 
    ranked_tiers.commander_id,
    ranked_tiers.prestige_id,
    ranked_tiers.tier,
    ranked_tiers.vote_count
  FROM ranked_tiers
  WHERE ranked_tiers.rank = 1;
END;
$$ LANGUAGE plpgsql;
