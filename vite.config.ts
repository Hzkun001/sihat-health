
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('maplibre-gl')) return 'map-engine';
          if (id.includes('@terraformer') || id.includes('@turf')) return 'geospatial';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('/motion/')) return 'motion';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 8080,
    open: false,
  },
});
