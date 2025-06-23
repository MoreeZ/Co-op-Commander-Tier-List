-- Add advantages and disadvantages columns to prestiges table
ALTER TABLE prestiges ADD COLUMN IF NOT EXISTS advantages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE prestiges ADD COLUMN IF NOT EXISTS disadvantages JSONB DEFAULT '[]'::jsonb;

-- Example data for prestiges
UPDATE prestiges 
SET advantages = '["Increased attack speed", "Higher DPS output"]'::jsonb,
    disadvantages = '["Reduced health", "Higher mineral cost"]'::jsonb
WHERE id = 1;

UPDATE prestiges 
SET advantages = '["Improved defensive capabilities", "Reduced cooldowns"]'::jsonb,
    disadvantages = '["Lower damage output", "Increased gas cost"]'::jsonb
WHERE id = 2;

UPDATE prestiges 
SET advantages = '["Enhanced special abilities", "Unique unit upgrades"]'::jsonb,
    disadvantages = '["Longer build times", "Limited unit selection"]'::jsonb
WHERE id = 3;

-- Note: This is example data. You should replace with actual prestige advantages/disadvantages
-- for each commander's prestiges based on StarCraft 2 Co-op gameplay mechanics.
