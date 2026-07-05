/** Fail the build if dist/sw.js is missing. */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const swPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'sw.js');

if (!existsSync(swPath)) {
  console.error('[monetag] ERROR: dist/sw.js missing — push install check will fail.');
  process.exit(1);
}

const content = readFileSync(swPath, 'utf8');
if (!content.includes('importScripts') || !content.includes('self.options')) {
  console.error('[monetag] ERROR: dist/sw.js does not look like a Monetag service worker.');
  process.exit(1);
}

if (content.includes('self.lary = ""') || content.includes("self.lary = ''")) {
  console.warn(
    '[monetag] WARNING: self.lary is empty. If push install fails, replace monetag/sw.js with the exact file from Monetag Step 1.'
  );
}

console.log('[monetag] dist/sw.js present');
