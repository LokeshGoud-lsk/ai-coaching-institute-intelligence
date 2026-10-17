import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(distDir)) {
  console.error('[prepare-gh-pages] Error: dist directory does not exist. Run build first.');
  process.exit(1);
}

// 1. Ensure .nojekyll exists
const nojekyllPath = path.join(distDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '# Disable Jekyll processing for GitHub Pages\n', 'utf-8');
  console.log('[prepare-gh-pages] Created dist/.nojekyll');
}

// 2. Ensure 404.html exists in dist
const dist404Path = path.join(distDir, '404.html');
const public404Path = path.join(publicDir, '404.html');

if (fs.existsSync(public404Path)) {
  fs.copyFileSync(public404Path, dist404Path);
  console.log('[prepare-gh-pages] Copied public/404.html to dist/404.html');
} else {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    fs.copyFileSync(indexHtmlPath, dist404Path);
    console.log('[prepare-gh-pages] Created dist/404.html as fallback from dist/index.html');
  }
}

console.log('[prepare-gh-pages] GitHub Pages assets verified successfully.');
