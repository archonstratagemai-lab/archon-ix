import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    // Remove rollupOptions.input if present — let Vite auto-detect root index.html
  }
})
