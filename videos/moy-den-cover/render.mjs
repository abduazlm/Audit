// Renders cover.html → cover-9x16.jpg (1080×1920) and cover-4x3.jpg (1440×1080). usage: node render.mjs
import { createRequire } from 'module'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');
const root = path.dirname(new URL(import.meta.url).pathname);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 3100 } });
await page.goto('file://' + path.join(root, 'cover.html')); await page.evaluate(() => document.fonts.ready);
await (await page.$('#tall')).screenshot({ path: path.join(root, 'cover-9x16.jpg'), type: 'jpeg', quality: 93 });
await (await page.$('#wide')).screenshot({ path: path.join(root, 'cover-4x3.jpg'), type: 'jpeg', quality: 93 });
await browser.close(); console.log('done');
