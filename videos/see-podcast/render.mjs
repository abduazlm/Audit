// Renders index.html (25 fps) frame by frame into MP4 with assets/soundtrack.wav.
// usage: node render.mjs out.mp4      (STILLS=1.2,3.4 STILL_DIR=dir node render.mjs /dev/null for stills)
import { createRequire } from 'module';
import { spawn, execFileSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');
const root = path.dirname(new URL(import.meta.url).pathname);
const out = process.argv[2] || 'see-offer-9x16.mp4', FPS = 25;
if (!process.env.NO_FRAMES) execFileSync(path.join(root, "frames.sh"), { stdio: "inherit" });
const types = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
const browser = await chromium.launch({ args: ['--no-proxy-server'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
await page.evaluate(() => window.READY);
const canvas = await page.$('canvas');
const draw = t => page.evaluate(async t => { await window.prepare(t); window.renderFrame(t); }, t);
if (process.env.STILLS) {
  for (const t of process.env.STILLS.split(',').map(Number)) { await draw(t); await canvas.screenshot({ path: `${process.env.STILL_DIR || '.'}/s-${t}.png` }); }
} else {
  const n = Math.round(await page.evaluate(() => window.DURATION) * FPS);
  const audio = path.join(root, 'assets/soundtrack.wav');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...(fs.existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await draw(i / FPS);
    const buf = await canvas.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 75 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close(); server.close(); console.log('done');
