// Renders index.html frame-by-frame to MP4.
// usage: node render.mjs [horizontal|vertical] [out.mp4]
import { createRequire } from 'module';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');

const FPS = 30;
const format = process.argv[2] || 'horizontal';
const out = process.argv[3] || `see-group-intro-${format}.mp4`;
const [W, H] = format === 'vertical' ? [1080, 1920] : [1920, 1080];

// tiny static server (fonts don't load from file://)
const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(data);
  });
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--no-proxy-server'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(`http://127.0.0.1:${port}/index.html?capture&format=${format}`);
await page.evaluate(() => window.READY);
const duration = await page.evaluate(() => window.DURATION);
const frames = Math.round(duration * FPS);

const audio = path.join(root, 'assets/soundtrack.wav');   // built by sound.py
const audioArgs = fs.existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', ...audioArgs,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });

const stills = process.env.STILLS ? process.env.STILLS.split(',').map(Number) : null;
const canvas = await page.$('canvas');
if (stills) {
  for (const t of stills) {
    await page.evaluate(t => window.renderFrame(t), t);
    await canvas.screenshot({ path: `${process.env.STILL_DIR || '.'}/${format}-${t}.png` });
  }
  ff.stdin.end();
} else {
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.renderFrame(t), i / FPS);
    const buf = await canvas.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`${format}: frame ${i}/${frames}`);
  }
  ff.stdin.end();
}
await new Promise(r => ff.on('close', r));
await browser.close(); server.close();
console.log('done ->', stills ? 'stills' : out);
