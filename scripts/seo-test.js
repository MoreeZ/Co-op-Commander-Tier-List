/**
 * SEO Test Script for StarCraft 2 Co-op Commander Tier List
 * 
 * This script performs various checks to validate SEO implementation
 * Run with: node scripts/seo-test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Configuration
const SITE_URL = 'https://coop.starcraftier.com';
const REQUIRED_META_TAGS = [
  'description',
  'keywords',
  'author',
  'robots',
  'viewport'
];
const REQUIRED_OG_TAGS = [
  'og:title',
  'og:description',
  'og:image',
  'og:url',
  'og:type'
];
const REQUIRED_TWITTER_TAGS = [
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image'
];
const REQUIRED_FILES = [
  'robots.txt',
  'sitemap.xml',
  '_redirects',
  'favicon/site.webmanifest',
  'favicon/browserconfig.xml',
  'preload.js'
];

/**
 * Checks if the build directory exists
 */
function checkBuildDirectory() {
  console.log('🔍 Checking build directory...');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    return false;
  }
  
  console.log('✅ Build directory exists');
  return true;
}

/**
 * Checks if required files exist
 */
function checkRequiredFiles() {
  console.log('🔍 Checking required files...');
  let allFilesExist = true;
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required file: ${file}`);
      allFilesExist = false;
    } else {
      console.log(`✅ Found: ${file}`);
    }
  }
  
  return allFilesExist;
}

/**
 * Checks the HTML for required meta tags
 */
function checkMetaTags() {
  console.log('🔍 Checking meta tags...');
  
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in build directory');
    return false;
  }
  
  const html = fs.readFileSync(indexPath, 'utf8');
  const dom = new JSDOM(html);
  const { document } = dom.window;
  
  // Check standard meta tags
  let allMetaTagsExist = true;
  for (const tagName of REQUIRED_META_TAGS) {
    const tag = document.querySelector(`meta[name="${tagName}"]`);
    if (!tag) {
      console.error(`❌ Missing meta tag: ${tagName}`);
      allMetaTagsExist = false;
    } else {
      console.log(`✅ Found meta tag: ${tagName}`);
    }
  }
  
  // Check Open Graph tags
  for (const tagName of REQUIRED_OG_TAGS) {
    const tag = document.querySelector(`meta[property="${tagName}"]`);
    if (!tag) {
      console.error(`❌ Missing Open Graph tag: ${tagName}`);
      allMetaTagsExist = false;
    } else {
      console.log(`✅ Found Open Graph tag: ${tagName}`);
    }
  }
  
  // Check Twitter Card tags
  for (const tagName of REQUIRED_TWITTER_TAGS) {
    const tag = document.querySelector(`meta[name="${tagName}"]`);
    if (!tag) {
      console.error(`❌ Missing Twitter Card tag: ${tagName}`);
      allMetaTagsExist = false;
    } else {
      console.log(`✅ Found Twitter Card tag: ${tagName}`);
    }
  }
  
  // Check for canonical link
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    console.error('❌ Missing canonical link');
    allMetaTagsExist = false;
  } else {
    console.log(`✅ Found canonical link: ${canonical.href}`);
  }
  
  // Check for structured data
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  if (!structuredData) {
    console.error('❌ Missing structured data (JSON-LD)');
    allMetaTagsExist = false;
  } else {
    console.log('✅ Found structured data (JSON-LD)');
  }
  
  return allMetaTagsExist;
}

/**
 * Check sitemap.xml content
 */
function checkSitemap() {
  console.log('🔍 Checking sitemap.xml...');
  
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml not found');
    return false;
  }
  
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  
  // Check if sitemap contains the main URL
  if (!sitemap.includes(SITE_URL)) {
    console.error(`❌ sitemap.xml does not contain the main site URL: ${SITE_URL}`);
    return false;
  }
  
  // Check if sitemap contains required paths
  const requiredPaths = ['/', '/contribute'];
  let allPathsExist = true;
  
  for (const urlPath of requiredPaths) {
    const fullUrl = `${SITE_URL}${urlPath}`;
    if (!sitemap.includes(fullUrl)) {
      console.error(`❌ sitemap.xml is missing URL: ${fullUrl}`);
      allPathsExist = false;
    } else {
      console.log(`✅ Found URL in sitemap: ${fullUrl}`);
    }
  }
  
  return allPathsExist;
}

/**
 * Run all SEO tests
 */
async function runTests() {
  console.log('🚀 Starting SEO tests...');
  console.log('=======================');
  
  const buildExists = checkBuildDirectory();
  if (!buildExists) return;
  
  const filesExist = checkRequiredFiles();
  const metaTagsValid = checkMetaTags();
  const sitemapValid = checkSitemap();
  
  console.log('=======================');
  console.log('📊 Test Results:');
  console.log(`Required Files: ${filesExist ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Meta Tags: ${metaTagsValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Sitemap: ${sitemapValid ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallResult = filesExist && metaTagsValid && sitemapValid;
  console.log('=======================');
  console.log(`Overall Result: ${overallResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!overallResult) {
    console.log('\n⚠️ Some SEO tests failed. Please review the errors above.');
  } else {
    console.log('\n🎉 All SEO tests passed! Your site is well-optimized for search engines.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running SEO tests:', error);
});
