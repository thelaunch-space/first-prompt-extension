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

const createIconSVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M ${size * 0.53} ${size * 0.2} L ${size * 0.3} ${size * 0.5} h ${size * 0.23} l -${size * 0.03} ${size * 0.3} ${size * 0.3} -${size * 0.36} h -${size * 0.23} l ${size * 0.03} -${size * 0.24} z" fill="white"/>
</svg>`;

writeFileSync(join(distDir, 'icon16.png'), Buffer.from(createIconSVG(16)));
writeFileSync(join(distDir, 'icon48.png'), Buffer.from(createIconSVG(48)));
writeFileSync(join(distDir, 'icon128.png'), Buffer.from(createIconSVG(128)));
console.log('Created placeholder icons');

console.log('Extension build complete!');
console.log('Load the "dist" folder as an unpacked extension in Chrome');
