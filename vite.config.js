import { defineConfig } from 'vite'

export default defineConfig({
  // Use relative base path for GitHub Pages compatibility
  // This ensures assets are referenced as ./assets/... instead of /assets/...
  base: './',
  
  server: {
    port: 5173,
    open: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: './index.html'
    }
  }
})
