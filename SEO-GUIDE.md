# StarCraft 2 Co-op Commander Tier List - SEO Guide

This document provides an overview of the SEO implementation for the StarCraft 2 Co-op Commander Tier List website.

## Domain Information

- Primary domain: `https://coop.starcraftier.com`
- No www subdomain (redirects to non-www version)

## SEO Components Implemented

### Meta Tags and Document Head

- **SEO Utility (`src/utils/seo.js`)**: Core utility functions for updating document metadata
- **SEO Component (`src/components/common/SEO.jsx`)**: React component for page-specific SEO
- **MetaTags Component (`src/components/common/MetaTags.jsx`)**: Component for adding structured data
- **Structured Data Utilities (`src/utils/structuredData.js`)**: Functions for generating JSON-LD data

### Structured Data (JSON-LD)

The following structured data types have been implemented:

1. **Website Schema** - Applied globally in Layout component
2. **ItemList Schema** - Applied to the tier list on SummaryPage
3. **BreadcrumbList Schema** - Applied to all pages for navigation context
4. **WebPage Schema** - Applied to the 404 page

### Meta Tags in HTML Template

The `index.html` file includes default meta tags:

- Title and description
- Viewport settings
- Open Graph tags
- Twitter Card tags
- Canonical URL
- Robots directives
- Favicon references

### Server Configuration

#### Netlify Configuration

- **`_redirects`**: Handles SPA routing and domain redirects
- Custom headers for security and caching

#### Apache Configuration (if using Apache)

- **`.htaccess`**: Contains rules for:
  - HTTPS enforcement
  - www to non-www redirects
  - SPA routing fallback
  - Caching headers
  - Compression settings
  - Security headers

### Sitemap and Robots

- **`robots.txt`**: Located in the public folder
- **`sitemap.xml`**: 
  - Static version in public folder
  - Dynamic generation via `scripts/generate-sitemap.js`
  - Integrated with build process in package.json

### Progressive Web App Support

- **Web Manifest**: Located at `public/favicon/site.webmanifest`
- Contains app name, description, icons, and theme colors

## Page-Specific SEO

### Summary Page (Home)

- Title: "Community Co-op Commander Tier List"
- Description: Community-driven tier list for StarCraft 2 Co-op Commanders
- Structured Data: ItemList schema with commander rankings

### User Input Page (Create)

- Title: "Create Your Co-op Commander Tier List"
- Description: Create your personal StarCraft 2 Co-op Commander tier list
- Structured Data: BreadcrumbList schema for navigation context

### 404 Page

- Title: "Page Not Found"
- Description: Custom error message with link back to main page
- Structured Data: WebPage schema with breadcrumb navigation

## Semantic HTML Improvements

- Proper use of heading hierarchy (h1, h2, etc.)
- Semantic roles for navigation, banner, and contentinfo
- ARIA attributes for improved accessibility
- Proper link text and descriptions

## Build Process Integration

The SEO optimization is integrated into the build process:

```json
"scripts": {
  "build": "vite build && node scripts/generate-sitemap.js",
  "generate-sitemap": "node scripts/generate-sitemap.js"
}
```

## Testing and Validation

To validate the SEO implementation:

1. Use Google's Rich Results Test: https://search.google.com/test/rich-results
2. Use Google's Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
3. Validate structured data: https://validator.schema.org/
4. Test meta tags: https://metatags.io/

## Future Improvements

Consider these additional optimizations:

1. Implement server-side rendering (SSR) or static site generation (SSG)
2. Add more detailed commander-specific structured data
3. Implement image optimization with srcset and WebP format
4. Add more social media meta tags for platforms like Discord and LinkedIn
5. Create an XML sitemap index for larger site growth
6. Implement hreflang tags if expanding to multiple languages
7. Add FAQ schema for common questions about the tier list
