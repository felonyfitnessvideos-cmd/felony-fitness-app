// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

export default defineConfig({
  // Enable optimized development
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['react-icons'] // Exclude unused packages
  },
  plugins: [
    react(),
    VitePWA({ // Add the PWA plugin configuration
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        // Add caching strategies for better performance
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Felony Fitness',
        short_name: 'FelonyFit',
        description: 'Your personal fitness and nutrition tracker.',
        theme_color: '#1a202c',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020', // Modern target for better optimization
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Route-based code splitting for better caching
          if (id.includes('src/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (pageName) return `page-${pageName.toLowerCase()}`;
          }

          if (!id.includes('node_modules')) return;

          // More granular vendor splitting
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('@supabase') || id.includes('supabase')) return 'supabase';
          if (id.includes('react') || id.includes('scheduler')) return 'react';
          if (id.includes('react-router')) return 'router';
          if (id.includes('lucide-react')) return 'icons';
          
          // Group smaller utilities
          if (id.includes('@dnd-kit') || id.includes('react-modal')) return 'ui-utils';

          // Default vendor chunk for remaining dependencies
          return 'vendor';
        }
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000
  }
});