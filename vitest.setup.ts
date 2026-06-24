// Wired in via `test.setupFiles` in vite.config.js. Registers the
// `@testing-library/jest-dom` custom matchers (toBeInTheDocument, …)
// against vitest's `expect()` before any test imports it. Without this
// import the matcher is a no-op and vitest fails the assertion with
// `Error: Invalid Chai property: toBeInTheDocument`.
import '@testing-library/jest-dom/vitest';
