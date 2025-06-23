-- Create a stored procedure to get the most common tier for each commander
CREATE OR REPLACE FUNCTION get_most_common_tiers_for_commanders()
RETURNS TABLE (
  commander_id INTEGER,
  most_common_tier TEXT,
  vote_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH tier_counts AS (
    SELECT 
      commander_id,
      tier,
      COUNT(*) as count
    FROM submission_entries
    GROUP BY commander_id, tier
  ),
  ranked_tiers AS (
    SELECT
      commander_id,
      tier as most_common_tier,
      count as vote_count,
      ROW_NUMBER() OVER (PARTITION BY commander_id ORDER BY count DESC) as rank
    FROM tier_counts
  )
  SELECT 
    commander_id,
    most_common_tier,
    vote_count
  FROM ranked_tiers
  WHERE rank = 1;
END;
$$ LANGUAGE plpgsql;
