// Draws the IBRA ZOMBIE pixel icon and writes build/icon.png + build/icon.ico
const { PNG } = require('pngjs'), fs = require('fs'), path = require('path'), pngToIco = require('png-to-ico');
const S = 32, buf = new Uint8Array(S * S * 4);
const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function P(c, x, y, w = 1, h = 1) { const [r, g, b] = hex(c); for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue; const i = (yy * S + xx) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; } }
const BG = '#14141c', GOLD = '#c9a84c', SK = '#8fae7a', SK2 = '#74935f', INK = '#17110d';
P(BG, 2, 0, 28, 32); P(BG, 0, 2, 32, 28); P(BG, 1, 1, 30, 30);
P(GOLD, 3, 1, 26, 1); P(GOLD, 3, 30, 26, 1); P(GOLD, 1, 3, 1, 26); P(GOLD, 30, 3, 1, 26); P(GOLD, 2, 2); P(GOLD, 29, 2); P(GOLD, 2, 29); P(GOLD, 29, 29);
P('#23233a', 3, 3, 26, 14); P('#2e2a4a', 3, 13, 26, 4);                    // dusk sky
P('#e8cf7a', 23, 5, 3, 3);                                                   // moon
P('#0d0d14', 3, 14, 5, 3); P('#0d0d14', 4, 12, 2, 2); P('#0d0d14', 25, 13, 4, 4); P('#0d0d14', 26, 11, 2, 2); // rooftops
P(SK, 8, 8, 16, 16); P(SK, 9, 7, 14, 1); P(SK, 7, 13, 1, 5); P(SK, 24, 13, 1, 5); P(SK2, 21, 9, 3, 14); P(SK2, 9, 22, 14, 2);
P(BG, 8, 23); P(BG, 23, 23);
P(INK, 8, 5, 16, 3); P(INK, 7, 6, 1, 5); P(INK, 24, 6, 1, 5); P(INK, 10, 8, 3, 1); P(INK, 16, 8, 5, 1);
P(INK, 10, 10, 5, 1); P(INK, 18, 11, 5, 1);
P('#f4e9b0', 10, 12, 5, 5); P('#b3261e', 12, 14, 2, 2); P(INK, 12, 14);
for (const [x, y] of [[18, 13], [22, 13], [19, 14], [21, 14], [20, 15], [19, 16], [21, 16], [18, 17], [22, 17]]) P(INK, x, y);
P('#3a0d0d', 11, 19, 10, 4); P('#f4f4f4', 12, 19, 2, 2); P('#f4f4f4', 15, 19, 2, 2); P('#f4f4f4', 18, 19, 2, 1); P('#f4f4f4', 13, 22, 2, 1); P('#f4f4f4', 17, 22, 2, 1);
P('#7fc24b', 14, 23, 1, 3); P('#5d7a4a', 9, 18, 2, 1);
P(SK2, 13, 24, 6, 2); P(GOLD, 6, 26, 20, 4); P('#a8842f', 6, 29, 20, 1); P(SK, 14, 26, 4, 1); P(GOLD, 5, 27, 1, 3); P(GOLD, 26, 27, 1, 3);
P(SK, 3, 20, 3, 3); P(SK, 2, 19, 1, 2); P(SK, 4, 18, 1, 2); P(SK, 6, 19, 1, 2); P(SK2, 3, 23, 3, 5);   // raised hand
function scaled(n) { const png = new PNG({ width: n, height: n }); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const sx = Math.floor(x * S / n), sy = Math.floor(y * S / n), i = (sy * S + sx) * 4, o = (y * n + x) * 4; png.data[o] = buf[i]; png.data[o + 1] = buf[i + 1]; png.data[o + 2] = buf[i + 2]; png.data[o + 3] = buf[i + 3]; } return PNG.sync.write(png); }
const out = path.join(__dirname, '..', 'build'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon.png'), scaled(512));
pngToIco([16, 32, 48, 64, 128, 256].map(scaled)).then(b => { fs.writeFileSync(path.join(out, 'icon.ico'), b); console.log('icon written', b.length); });
