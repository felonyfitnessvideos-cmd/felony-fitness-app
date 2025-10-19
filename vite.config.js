// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

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
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Keep conservative splits only for very large libs that are safe to separate
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('@supabase') || id.includes('@supabase/supabase-js') || id.includes('supabase-js')) return 'supabase';
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'react';

          // default vendor
          return 'vendor';
        }
      }
    }
  }
});