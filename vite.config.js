// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // Add the PWA plugin configuration
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
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
    ,
    // Generate a bundle analysis HTML file for inspection
    visualizer({ filename: 'dist/bundle-stats.html', gzipSize: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Large UI / data libraries - split into their own chunks
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('@supabase') || id.includes('@supabase/supabase-js') || id.includes('supabase-js')) return 'supabase';
          if (id.includes('@dnd-kit')) return 'dnd-kit';
          // Split some additional large/commonly-bundled libs observed in vendor
          if (id.includes('react-router')) return 'router';
          if (id.includes('prop-types')) return 'prop-types';
          if (id.includes('react-modal')) return 'modal';
          if (id.includes('lodash') || id.includes('lodash-es')) return 'lodash';
          if (id.includes('d3-') || id.includes('d3/')) return 'd3';
          // Group React internals into a dedicated chunk so they can be cached separately
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'react';
          if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons';
          if (id.includes('node-fetch')) return 'fetch';

          // Default vendor grouping for smaller deps
          return 'vendor';
        }
      }
    }
  }
});