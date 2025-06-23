import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ViteSitemapPlugin from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteSitemapPlugin({
      hostname: 'https://coop.starcraftier.com',
      dynamicRoutes: ['/', '/create'],
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
      outDir: 'dist',
      filename: 'sitemap.xml',
    }),
  ],
  build: {
    outDir: 'dist',
    // Generate source maps for better debugging
    sourcemap: true,
    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
  server: {
    // Configure server options for development
    port: 3000,
    strictPort: true,
    host: true,
  },
  preview: {
    // Configure preview server options
    port: 4173,
    strictPort: true,
    host: true,
  },
})
