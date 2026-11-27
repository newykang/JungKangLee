import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { createServer } from 'vite';
import { execFileSync } from 'node:child_process';

const vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
let catalog;
try {
  ({ appCatalog: catalog } = await vite.ssrLoadModule('/src/data/index.ts'));
} finally {
  await vite.close();
}

const mimes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

async function collectAssets(directory, prefix = '') {
  const entries = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'server' || entry.name === '.openai') continue;
    const path = directory + '/' + entry.name;
    const url = prefix + '/' + entry.name;
    if (entry.isDirectory()) entries.push(...await collectAssets(path, url));
    else if (mimes[extname(entry.name)]) entries.push([url, [mimes[extname(entry.name)], (await readFile(path)).toString('base64')]]);
  }
  return entries;
}

const assets = Object.fromEntries(await collectAssets('dist'));
if (!assets['/index.html']) throw new Error('Build the Vite app before packaging the Sites Worker.');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const reviewReasons = JSON.parse(await readFile('src/features/reviews/review-reasons.json', 'utf8'));
const reviews = (await readFile('sites-worker/reviews.mjs', 'utf8'))
  .replace(/^import reviewReasons .*;\r?\n/, '')
  .replace('export function createReviewsHandler', 'function createReviewsHandler');
const worker = (await readFile('sites-worker/worker.mjs', 'utf8'))
  .replace("import { createReviewsHandler } from './reviews.mjs';", '')
  .replace('export function createSiteWorker', 'function createSiteWorker');
await mkdir('dist/server', { recursive: true });
await writeFile('dist/server/index.js', 'const reviewReasons = ' + JSON.stringify(reviewReasons) + ';\n' +
  reviews + '\n' + worker + '\nexport default createSiteWorker(' +
  JSON.stringify({ catalog, assets, revision }) + ');\n');
