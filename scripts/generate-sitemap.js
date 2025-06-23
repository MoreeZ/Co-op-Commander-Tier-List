/**
 * Script to generate a dynamic sitemap.xml for the StarCraft 2 Co-op Commander Tier List website
 * This script can be run during the build process to create an up-to-date sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://coop.starcraftier.com';
const DIST_FOLDER = path.resolve(__dirname, '../dist');
const SITEMAP_PATH = path.join(DIST_FOLDER, 'sitemap.xml');
const CURRENT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// Routes to include in the sitemap
const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    path: '/create',
    priority: '0.8',
    changefreq: 'weekly'
  }
];

/**
 * Generate the sitemap XML content
 * @returns {string} The sitemap XML content
 */
function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${route.path}</loc>\n`;
    sitemap += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  return sitemap;
}

/**
 * Write the sitemap to the file system
 */
function writeSitemap() {
  // Ensure the dist directory exists
  if (!fs.existsSync(DIST_FOLDER)) {
    fs.mkdirSync(DIST_FOLDER, { recursive: true });
  }
  
  // Generate and write the sitemap
  const sitemapContent = generateSitemap();
  fs.writeFileSync(SITEMAP_PATH, sitemapContent);
  
  console.log(`Sitemap generated at: ${SITEMAP_PATH}`);
}

// Execute the script
writeSitemap();
