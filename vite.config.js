import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: ".svelte",
    emptyOutDir: true
  },
  plugins: [svelte()],
  resolve: {
    alias: {
      $src: path.resolve(__dirname, './src'),
      $lib: path.resolve(__dirname, './src/lib'),
      $assets: path.resolve(__dirname, "./src/assets")
    }
  }
})
