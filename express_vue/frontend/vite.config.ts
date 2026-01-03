import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false, // keep readable code
    sourcemap: true, // enable source maps

    rollupOptions: {
      output: {
        manualChunks: () => 'everything.js', // single JS file
      },
    },
    cssCodeSplit: false,
  },
});
