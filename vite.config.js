import { defineConfig } from 'vite'

// Vite's built-in esbuild handles JSX out of the box; no extra React plugin
// is required for the production build. Skip @vitejs/plugin-react to avoid
// the version-skew install failures we hit this morning.
export default defineConfig({
  // Polyfill `process` for browser — alchemy-sdk references process.env
  // internally, which doesn't exist in the browser without Node.
  define: {
    'process.env': {},
    'process.platform': JSON.stringify('browser'),
  },
  // Vitest config — picked up by `npx vitest --run` (no-arg form). Include
  // every `*.{test,spec}.{ts,tsx}` anywhere under src/ regardless of whether
  // it's a JSX component test (tsx) or a TS module test (ts). Exclude only
  // non-source artifacts — pairing a narrower include with a `src/**/*.test.tsx`
  // exclude (as the previous config did) is a self-overlap trap that filters
  // every discovered file out, which is how we hit `No test files found`.
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', '.git/**'],
    environment: 'jsdom',
    // Custom-matchers (toBeInTheDocument, …) registered in the setup file.
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // JSDOM globals — window, document, etc. — set up via environment above.
  },
  // Vitest 4 moved poolOptions out of the `test:` namespace into top-level
  // config (deprecation warning was emitted while it stayed nested). Single
  // thread avoids worker spawn issues in constrained environments.
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: true,
    },
  },
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
      // Single HTML entry point — the Telegram Mini App entry
      // (./archon-wallet/index.html + main.tsx) was quarantined to
      // archon-wallet/_unused/ because it imports @account-kit/react,
      // which is not installed. The Mini App can be revived by
      // following archon-wallet/_unused/README.md and re-adding this
      // `mini:` input line.
      input: {
        main: './index.html',
      },
    }
  }
})
