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
