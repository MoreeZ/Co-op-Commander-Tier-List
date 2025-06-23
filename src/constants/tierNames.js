// Tier names used throughout the application
export const TIER_NAMES = {
  BROKEN: 'Over Powered',
  SUPER_STRONG: 'Very Strong',
  STRONG: 'Strong',
  WEAK: 'Meh',
  DOGSHIT: 'Poop',
  UNASSIGNED: 'Never Played'
};

// Array of tier names in order (excluding unassigned)
export const TIER_NAMES_ORDERED = [
  TIER_NAMES.BROKEN,
  TIER_NAMES.SUPER_STRONG,
  TIER_NAMES.STRONG,
  TIER_NAMES.WEAK,
  TIER_NAMES.DOGSHIT,
  TIER_NAMES.UNASSIGNED
];


// Function to get an empty tier list structure
export const getEmptyTierList = () => {
  return {
    [TIER_NAMES.BROKEN]: [],
    [TIER_NAMES.SUPER_STRONG]: [],
    [TIER_NAMES.STRONG]: [],
    [TIER_NAMES.WEAK]: [],
    [TIER_NAMES.DOGSHIT]: [],
    [TIER_NAMES.UNASSIGNED]: []
  };
};
