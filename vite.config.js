import { defineConfig } from 'vite'

export default defineConfig({
  // Absolute subpath required for GitHub Pages subdirectory hosting
  base: '/archon-ix/',

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
