/**
 * Utility functions for generating structured data for SEO
 */

/**
 * Generate structured data for the website
 * @returns {Object} Website structured data
 */
export const generateWebsiteData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StarCraft 2 Co-op Commander Tier List",
    "url": "https://coop.starcraftier.com",
    "description": "Community-driven tier list for StarCraft 2 Co-op Commanders. Rate and view rankings for all commanders from Raynor to Zeratul.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://coop.starcraftier.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

/**
 * Generate structured data for the tier list page
 * @param {Array} commanders - List of commanders with their tiers
 * @returns {Object} Tier list structured data
 */
export const generateTierListData = (commanders) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": commanders.map((commander, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Thing",
        "name": commander.name,
        "description": `${commander.name} is ranked in Tier ${commander.tier} in the StarCraft 2 Co-op Commander Tier List.`
      }
    }))
  };
};

/**
 * Generate breadcrumb structured data
 * @param {Array} items - Breadcrumb items
 * @returns {Object} Breadcrumb structured data
 */
export const generateBreadcrumbData = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://coop.starcraftier.com${item.path}`
    }))
  };
};
