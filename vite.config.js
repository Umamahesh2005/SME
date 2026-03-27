import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SME Finance Platform',
        short_name: 'SME Finance',
        description: 'Financial management center for Small and Medium Enterprises.',
        theme_color: '#4F46E5',
        background_color: '#F3F4F6',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3651/3651915.png', // Temporary Icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
