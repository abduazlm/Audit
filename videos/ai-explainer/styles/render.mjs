// Renders styles.html → styles.jpg (three 1080×1920 style samples side by side). usage: node render.mjs
import { createRequire } from 'module'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');
const root = path.dirname(new URL(import.meta.url).pathname);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 3440, height: 2000 } });
await page.goto('file://' + path.join(root, 'styles.html')); await page.evaluate(() => document.fonts.ready);
await (await page.$('#row')).screenshot({ path: path.join(root, 'styles.jpg'), type: 'jpeg', quality: 90 });
await browser.close(); console.log('done');
