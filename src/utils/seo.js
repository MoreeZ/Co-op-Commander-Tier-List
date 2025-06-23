/**
 * SEO utility functions for the StarCraft 2 Co-op Tier List website
 */

/**
 * Updates the document title and meta tags for SEO
 * @param {Object} seoData - SEO data to be applied
 * @param {string} seoData.title - Page title
 * @param {string} seoData.description - Page description
 * @param {string} seoData.canonicalUrl - Canonical URL
 * @param {Object} seoData.structuredData - Structured data for the page (JSON-LD)
 */
export const updateSEO = (seoData) => {
  const { title, description, canonicalUrl, structuredData } = seoData;
  
  // Update document title
  document.title = title ? `${title} | StarCraft 2 Co-op Commander Tier List` : 'StarCraft 2 Co-op Commander Tier List';
  
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description || 'Community-driven tier list for StarCraft 2 Co-op Commanders. Rate and view rankings for all commanders from Raynor to Zeratul.';
  
  // Update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl || 'https://coop.starcraftier.com';
  
  // Add Open Graph meta tags
  updateOpenGraphTags({
    title: title || 'StarCraft 2 Co-op Commander Tier List',
    description: description || 'Community-driven tier list for StarCraft 2 Co-op Commanders. Rate and view rankings for all commanders from Raynor to Zeratul.',
    url: canonicalUrl || 'https://coop.starcraftier.com',
    image: 'https://coop.starcraftier.com/og-image.jpg' // Default OG image
  });
  
  // Add Twitter Card meta tags
  updateTwitterCardTags({
    title: title || 'StarCraft 2 Co-op Commander Tier List',
    description: description || 'Community-driven tier list for StarCraft 2 Co-op Commanders. Rate and view rankings for all commanders from Raynor to Zeratul.',
    image: 'https://coop.starcraftier.com/og-image.jpg' // Default Twitter image
  });
  
  // Add structured data if provided
  if (structuredData) {
    updateStructuredData(structuredData);
  }
};

/**
 * Updates Open Graph meta tags
 * @param {Object} ogData - Open Graph data
 */
const updateOpenGraphTags = (ogData) => {
  const { title, description, url, image } = ogData;
  
  // Helper function to update or create meta tags
  const updateMetaTag = (property, content) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };
  
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:url', url);
  updateMetaTag('og:image', image);
  updateMetaTag('og:type', 'website');
  updateMetaTag('og:site_name', 'StarCraft 2 Co-op Tier List');
};

/**
 * Updates Twitter Card meta tags
 * @param {Object} twitterData - Twitter Card data
 */
const updateTwitterCardTags = (twitterData) => {
  const { title, description, image } = twitterData;
  
  // Helper function to update or create meta tags
  const updateMetaTag = (name, content) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };
  
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', image);
};

/**
 * Updates structured data (JSON-LD)
 * @param {Object} data - Structured data object
 */
const updateStructuredData = (data) => {
  // Remove any existing JSON-LD script
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create new JSON-LD script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Creates default structured data for the website
 * @returns {Object} Default structured data
 */
export const createDefaultStructuredData = () => {
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
 * Creates structured data for a tier list page
 * @param {Array} commanders - List of commanders with their tiers
 * @returns {Object} Structured data for tier list
 */
export const createTierListStructuredData = (commanders) => {
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
