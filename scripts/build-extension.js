// Build script for Chrome extension

import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

console.log('Building Chrome extension...');

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

copyFileSync(join(publicDir, 'manifest.json'), join(distDir, 'manifest.json'));
console.log('Copied manifest.json');

// Copy actual PNG icons from public directory
const iconSizes = ['16', '32', '48', '128'];
iconSizes.forEach(size => {
  const iconFile = `icon${size}.png`;
  copyFileSync(join(publicDir, iconFile), join(distDir, iconFile));
});
console.log('Copied extension icons (16, 32, 48, 128)');

console.log('Extension build complete!');
console.log('Load the "dist" folder as an unpacked extension in Chrome');
