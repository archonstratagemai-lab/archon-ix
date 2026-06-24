import { promises as fs } from 'fs';
import { resolve, join } from 'path';

/**
 * Simple build helper for MiniApp assets.
 * Currently it copies static assets from src/assets into the Vite build output directory.
 * This script is intended to be run after `npm run build` (which emits to ./dist).
 */
async function copyAssets() {
  const srcDir = resolve('src', 'assets');
  const outDir = resolve('dist', 'assets');
  try {
    await fs.mkdir(outDir, { recursive: true });
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const srcPath = join(srcDir, entry.name);
        const destPath = join(outDir, entry.name);
        await fs.copyFile(srcPath, destPath);
        console.log(`Copied asset: ${entry.name}`);
      }
    }
  } catch (err) {
    console.error('Error copying MiniApp assets:', err);
    process.exit(1);
  }
}

await copyAssets();
