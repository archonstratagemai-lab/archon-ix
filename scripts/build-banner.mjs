#!/usr/bin/env node
/**
 * ARCHON-IX | OG Banner Builder
 * --------------------------------------------------------------
 * Renders the canonical Sovereign-navy/gold 1200×630 OG card used
 * by the `<meta property="og:image">` tag in `index.html`.
 *
 * Usage
 *   node scripts/build-banner.mjs                       # → public/banner.png
 *   node scripts/build-banner.mjs path/to/out.png       # custom output
 *   node scripts/build-banner.mjs --help
 *
 * Requires
 *   `sharp` (devDependency). Install with `npm install`.
 *
 * Notes
 *   - The SVG source lives in `scripts/banner.source.svg` so the
 *     SVG itself is diffable, lintable, and editor-previewable.
 *     Edit colors/typography there, then re-run this script.
 *   - Vite's `public/` pass-through copies the rendered PNG into
 *     `dist/banner.png` automatically, so no manual copy step.
 *   - Idempotent: overwrites the destination without prompting.
 */

import fs   from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// -------- Help -----------------------------------------------------
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`Usage: node scripts/build-banner.mjs [output-path]

Renders scripts/banner.source.svg to a 1200×630 PNG.

Default output:  <project>/public/banner.png
Override:        <project>/<your-path>.png

Examples:
  npm run build-banner
  npm run build-banner -- dist/social-card.png`);
  process.exit(0);
}

// -------- Lazy-load sharp with friendly fallback -------------------
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('✗ `sharp` is not installed.');
  console.error('  Run:  npm install  (sharp is a devDependency).');
  console.error('  Then: npm run build-banner');
  process.exit(1);
}

// -------- Resolve paths --------------------------------------------
const SRC = path.join(__dirname, 'banner.source.svg');
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, 'public', 'banner.png'));
const W = 1200;
const H = 630;

await fs.mkdir(path.dirname(OUT), { recursive: true });

// -------- Render with actionable errors -----------------------------
try {
  const svg = await fs.readFile(SRC);
  await sharp(svg, { density: 144 })
    .resize(W, H, { fit: 'cover' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(OUT);
} catch (err) {
  console.error('✗ Banner render failed.');
  console.error(`  source: ${SRC}`);
  console.error(`  output: ${OUT}`);
  console.error(`  error : ${err.message}`);
  // Most common authoring pitfall: an unescaped & in a text node or
  // an unclosed tag — librsvg's XML parser will reject it.
  if (/xml|svg|parse/i.test(err.message)) {
    console.error('');
    console.error('  Hint: edit scripts/banner.source.svg. If you inlined text');
    console.error('        containing "&", replace with "&amp;".');
  }
  process.exit(1);
}

// -------- Verify ---------------------------------------------------
const [meta, stat] = await Promise.all([
  sharp(OUT).metadata(),
  fs.stat(OUT),
]);

console.log(`✓ banner.png → ${path.relative(ROOT, OUT)}`);
console.log(`    dims: ${meta.width}x${meta.height} ${meta.format}`);
console.log(`    size: ${stat.size} bytes`);
