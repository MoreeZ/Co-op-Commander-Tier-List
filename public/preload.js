/**
 * Preload script for the StarCraft 2 Co-op Commander Tier List website
 * This script preloads critical assets and improves initial page load performance
 */

// Preload critical images
function preloadCriticalImages() {
  const imagesToPreload = [
    '/og-image.jpg',
    '/favicon/favicon.ico',
    '/favicon/android-chrome-192x192.png'
  ];
  
  imagesToPreload.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Preconnect to important domains
function setupPreconnect() {
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  preloadCriticalImages();
  setupPreconnect();
});
