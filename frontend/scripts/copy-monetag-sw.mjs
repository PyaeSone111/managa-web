/**
 * Copies Monetag dashboard sw.js into public/ before build.
 * Download from: Push zone → Step 1 → Download JS file → save as monetag/sw.js
 * Do NOT edit the file — Monetag installation check compares it byte-for-byte.
 */
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dashboardPath = join(root, 'monetag', 'sw.js');
const publicPath = join(root, 'public', 'sw.js');

if (!existsSync(dashboardPath)) {
  if (!existsSync(publicPath)) {
    console.error(
      '[monetag] ERROR: Missing monetag/sw.js (download from Monetag Push → Step 1) and public/sw.js'
    );
    process.exit(1);
  }
  console.warn(
    '[monetag] WARNING: monetag/sw.js not found — using existing public/sw.js.\n' +
      '  Push install may fail unless public/sw.js is the exact file from Monetag Step 1.'
  );
  process.exit(0);
}

copyFileSync(dashboardPath, publicPath);
const preview = readFileSync(publicPath, 'utf8');
const zoneMatch = preview.match(/"zoneId"\s*:\s*(\d+)/);
const laryMatch = preview.match(/self\.lary\s*=\s*"([^"]*)"/);
console.log(
  `[monetag] copied monetag/sw.js → public/sw.js` +
    (zoneMatch ? ` (zoneId=${zoneMatch[1]})` : '') +
    (laryMatch ? ` (lary ${laryMatch[1] ? 'set' : 'empty'})` : '')
);
