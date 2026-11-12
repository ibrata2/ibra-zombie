// IBRA ZOMBIE - procedural pixel art (no external images)
const Art = (() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const R = seed => { let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  const P = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const cache = {};

  function tile(type, v) {
    const k = 't' + type + '_' + v; if (cache[k]) return cache[k];
    const c = mk(16, 16), g = c.getContext('2d'), r = R(type * 97 + v * 13 + 5);
    const speck = (base, cols, n) => { P(g, base, 0, 0, 16, 16); for (let i = 0; i < n; i++) P(g, cols[(r() * cols.length) | 0], (r() * 16) | 0, (r() * 16) | 0); };
    switch (type) {
      case 0: speck('#b9a06c', ['#c4ac79', '#a98f5c', '#b29863'], 26); if (v % 5 === 0) P(g, '#8f7a4e', 4 + (r() * 8 | 0), 4 + (r() * 8 | 0), 2, 1); break;
      case 1: speck('#3b3b42', ['#44444c', '#33333a', '#40404a'], 22); if (v % 7 === 0) { P(g, '#2c2c32', 3, 6, 5, 1); P(g, '#2c2c32', 7, 7, 4, 1); } break;
      case 2: speck('#a39c8e', ['#aca596', '#989184'], 10); P(g, '#857f73', 0, 0, 16, 1); P(g, '#857f73', 0, 0, 1, 16); P(g, '#857f73', 8, 0, 1, 16); P(g, '#857f73', 0, 8, 16, 1); break;
      case 3: case 12: P(g, '#cdbb9c', 0, 0, 16, 16); P(g, '#bca988', 0, 0, 16, 1); P(g, '#bca988', 0, 0, 1, 16); P(g, '#bca988', 8, 0, 1, 16); P(g, '#bca988', 0, 8, 16, 1); if (v % 6 === 0) P(g, '#d8c8ab', 10, 10, 4, 4);
        if (type === 12) { P(g, '#6b4a2a', 0, 0, 16, 16); P(g, '#8a6238', 1, 1, 14, 14); P(g, '#6b4a2a', 3, 3, 10, 10); } break;
      case 9: P(g, '#aeb6bb', 0, 0, 16, 16); P(g, '#98a1a7', 0, 0, 16, 1); P(g, '#98a1a7', 0, 0, 1, 16); if (v % 5 === 0) P(g, '#bcc4c9', 4, 4, 8, 8); break;
      case 5: speck('#2c6a78', ['#33788a', '#285f6d'], 14); P(g, '#5fa3b0', (v * 5) % 12, (v * 7) % 14, 4, 1); P(g, '#5fa3b0', (v * 11) % 11, (v * 3) % 13 + 1, 3, 1); break;
      case 6: P(g, '#77777d', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) P(g, '#66666c', i, 0, 1, 16); break;
      case 8: speck('#6f8f43', ['#7c9c4d', '#5f7f38', '#86a655'], 34); break;
      case 7: P(g, '#8a8a86', 0, 0, 16, 16); P(g, '#a3a39e', 0, 0, 16, 4); P(g, '#6e6e6a', 0, 13, 16, 3); P(g, '#77777a', 7, 0, 1, 16);
        if (v % 4 === 1) { P(g, '#b33', 2, 6, 5, 1); P(g, '#b33', 3, 7, 3, 2); } if (v % 4 === 2) P(g, '#2a6', 9, 6, 4, 2); break;
      case 10: P(g, '#b9a06c', 0, 0, 16, 16); for (let i = 0; i < 16; i += 2) P(g, '#5d6166', i, 4, 1, 9); P(g, '#7b8086', 0, 3, 16, 1); P(g, '#7b8086', 0, 12, 16, 1); break;
      case 11: for (let i = 0; i < 4; i++) P(g, i % 2 ? '#222' : '#e3b62f', i * 4, 0, 4, 16); P(g, '#555', 0, 0, 16, 2); P(g, '#555', 0, 14, 16, 2); break;
      case 13: P(g, '#4a4f58', 0, 0, 16, 16); P(g, '#6b727d', 1, 1, 14, 14); P(g, '#4a4f58', 7, 1, 2, 14); P(g, '#e3b62f', 10, 7, 3, 3); P(g, '#222', 11, 8, 1, 1); break;
    }
    return cache[k] = c;
  }
  const WST = [['#c9a45a', '#a8843f', '#dcbb74'], ['#d9cfb4', '#c2b697', '#e8dfc8'], ['#a7a7a2', '#8a8a86', '#c0c0ba'], ['#9c6b45', '#7c5233', '#b98558'], ['#5b8fa8', '#3f6f88', '#8fc0d6'], ['#6b7a4a', '#515e37', '#8a9a62'], ['#8b9097', '#666b72', '#a9aeb5'], ['#cf9f86', '#b08068', '#e2b9a2']];
  function wall(st, v) {
    const k = 'w' + st + '_' + v; if (cache[k]) return cache[k];
    const c = mk(16, 16), g = c.getContext('2d'), [b, d, l] = WST[st] || WST[0];
    P(g, b, 0, 0, 16, 16);
    for (let y = 3; y < 16; y += 4) { P(g, d, 0, y, 16, 1); for (let x = ((y >> 2) % 2) * 4 + (v % 2) * 2; x < 16; x += 8) P(g, d, x, y - 3, 1, 3); }
    P(g, l, 0, 0, 16, 2);
    return cache[k] = c;
  }

  // ---- characters 16x20, dir: 0 down 1 left 2 right 3 up
  function char(o, dir, fr) {
    const k = 'c' + o.id + '_' + dir + '_' + (fr & 1); if (cache[k]) return cache[k];
    const c = mk(16, 20), g = c.getContext('2d');
    const sk = o.skin || '#d9a577', sh = o.shirt || '#3b6ea5', pa = o.pants || '#2f3440', ha = o.hair || '#1b1410', bo = o.shoes || '#1c1c1c';
    const side = dir === 1 || dir === 2, up = dir === 3, step = fr & 1;
    const tw = o.fat ? 10 : 8, tx = o.fat ? 3 : 4;
    if (o.robe) { P(g, o.robe, side ? 5 : tx, 13, side ? 6 : tw, 5); P(g, bo, side ? 6 + (step ? 1 : -1) : 5, 18, 2, 1); P(g, bo, side ? 8 : 9, 18, 2, 1); }
    else if (side) { P(g, pa, 6, 14, 4, 4); if (step) { P(g, pa, 4, 15, 2, 3); P(g, pa, 10, 15, 2, 2); P(g, bo, 3, 18, 3, 1); P(g, bo, 10, 17, 3, 1); } else P(g, bo, 6, 18, 4, 1); }
    else { P(g, pa, 5, 14, 3, step ? 4 : 3); P(g, pa, 8, 14, 3, step ? 3 : 4); P(g, bo, 5, step ? 18 : 17, 3, 1); P(g, bo, 8, step ? 17 : 18, 3, 1); }
    if (side) P(g, sh, 5, 7, 6, 7); else P(g, sh, tx, 7, tw, 7);
    if (o.z) {
      if (side) { P(g, sh, 8, 8, 3, 2); P(g, sk, 11, 8, 3, 2); }
      else if (up) { P(g, sh, tx - 1, 7, 1, 3); P(g, sh, tx + tw, 7, 1, 3); P(g, sk, tx - 1, 5, 1, 2); P(g, sk, tx + tw, 5, 1, 2); }
      else { P(g, sh, tx - 1, 8, 1, 3); P(g, sh, tx + tw, 8, 1, 3); P(g, sk, tx - 1, 11, 2, 3); P(g, sk, tx + tw - 1, 11, 2, 3); }
    } else if (side) { P(g, sh, 7, 8, 2, 4); P(g, sk, 7, 12, 2, 1); }
    else { P(g, sh, tx - 1, 8, 1, 4); P(g, sh, tx + tw, 8, 1, 4); P(g, sk, tx - 1, 12, 1, 1); P(g, sk, tx + tw, 12, 1, 1); }
    if (o.vest && !up) { P(g, o.vest, side ? 6 : tx + 1, 8, side ? 4 : tw - 2, 4); }
    P(g, sk, 5, 1, 6, 6);
    const eye = o.z ? '#3a0505' : '#111';
    if (!up) {
      if (side) P(g, eye, 9, 4, 1, 1); else { P(g, eye, 6, 4, 1, 1); P(g, eye, 9, 4, 1, 1); }
      if (o.z && !side) P(g, '#6a1414', 7, 6, 2, 1);
      if (o.beard) { P(g, ha, side ? 8 : 6, 6, side ? 3 : 4, 1); if (!side) { P(g, ha, 5, 5, 1, 2); P(g, ha, 10, 5, 1, 2); } }
      if (o.stache && !side) P(g, ha, 6, 5, 4, 1);
    }
    if (o.hat === 'hijab') { P(g, o.hatc, 4, 0, 8, 3); P(g, o.hatc, 4, 3, 1, 5); P(g, o.hatc, 11, 3, 1, 5); if (up) P(g, o.hatc, 5, 1, 6, 7); if (side) P(g, o.hatc, 4, 1, 3, 7); }
    else if (o.hat === 'cap') { P(g, o.hatc, 5, 0, 6, 2); P(g, o.hatc, side ? 9 : 4, 2, side ? 4 : 8, 1); }
    else if (o.hat === 'shemagh') { P(g, o.hatc, 4, 0, 8, 2); P(g, o.hatc, 4, 2, 1, 6); P(g, o.hatc, 11, 2, 1, 6); P(g, '#111', 4, 1, 8, 1); if (up) P(g, o.hatc, 5, 2, 6, 6); }
    else if (o.hat === 'helmet') { P(g, o.hatc, 4, 0, 8, 3); }
    else if (!o.bald) { P(g, ha, 5, 0, 6, 2); if (up) P(g, ha, 5, 2, 6, 3); else if (side) P(g, ha, 5, 2, 2, 3); else { P(g, ha, 5, 2, 1, 1); P(g, ha, 10, 2, 1, 1); } }
    if (o.z) { P(g, '#4d7a1e', tx + 2, 9, 1, 1); P(g, sk, tx + tw - 3, 11, 2, 1); P(g, '#6a1414', tx + 1, 12, 2, 1); }
    if (o.bag && !up) { P(g, '#f1f1f1', side ? 12 : 12, 11, 3, 4); P(g, '#c9c9c9', 13, 11, 1, 1); }
    if (o.phone && !up) { P(g, '#111', side ? 12 : 2, 9, 2, 3); P(g, '#6cf', side ? 12 : 2, 10, 2, 1); }
    if (dir === 1) { const m = mk(16, 20), mg = m.getContext('2d'); mg.translate(16, 0); mg.scale(-1, 1); mg.drawImage(c, 0, 0); return cache[k] = m; }
    return cache[k] = c;
  }
  function cat(fr, flip) {
    const k = 'cat' + (fr & 1) + (flip ? 1 : 0); if (cache[k]) return cache[k];
    const c = mk(12, 9), g = c.getContext('2d'), o = '#e39a3b', d = '#b06f1f';
    P(g, o, 2, 3, 7, 4); P(g, o, 7, 1, 4, 4); P(g, o, 7, 0, 1, 1); P(g, o, 10, 0, 1, 1); P(g, '#111', 8, 2, 1, 1); P(g, '#111', 10, 2, 1, 1);
    P(g, d, 3, 3, 1, 3); P(g, d, 5, 3, 1, 3); P(g, o, 0, fr & 1 ? 1 : 2, 1, 3); P(g, o, 1, 3, 1, 1);
    P(g, o, 2, 7, 1, fr & 1 ? 2 : 1); P(g, o, 4, 7, 1, fr & 1 ? 1 : 2); P(g, o, 7, 7, 1, fr & 1 ? 2 : 1); P(g, o, 8, 7, 1, fr & 1 ? 1 : 2);
    if (flip) { const m = mk(12, 9), mg = m.getContext('2d'); mg.translate(12, 0); mg.scale(-1, 1); mg.drawImage(c, 0, 0); return cache[k] = m; }
    return cache[k] = c;
  }

  // ---- vehicles (facing right)
  function veh(type, armor, wreck) {
    const k = 'v' + type + (armor ? 1 : 0) + (wreck || 0); if (cache[k]) return cache[k];
    let c, g;
    if (type === 'bike') { c = mk(16, 8); g = c.getContext('2d'); P(g, '#111', 0, 3, 5, 2); P(g, '#111', 11, 3, 5, 2); P(g, '#c0392b', 4, 3, 8, 2); P(g, '#333', 11, 1, 1, 6); P(g, '#222', 5, 2, 3, 4); }
    else if (type === 'stuta') { c = mk(22, 13); g = c.getContext('2d'); P(g, '#111', 2, 0, 5, 2); P(g, '#111', 2, 11, 5, 2); P(g, '#1f6fb2', 0, 1, 13, 11); P(g, '#174f80', 1, 2, 11, 9); P(g, '#2a2a2a', 13, 4, 4, 5); P(g, '#c0392b', 15, 5, 4, 3); P(g, '#111', 18, 5, 4, 3); P(g, '#eee', 21, 6, 1, 1); P(g, '#444', 16, 2, 1, 9); }
    else if (type === 'kia') { c = mk(30, 14); g = c.getContext('2d'); P(g, '#111', 4, 0, 5, 2); P(g, '#111', 4, 12, 5, 2); P(g, '#111', 21, 0, 5, 2); P(g, '#111', 21, 12, 5, 2); P(g, '#e9e9e4', 0, 1, 30, 12); P(g, '#9aa0a6', 1, 2, 17, 10); P(g, '#7f858b', 2, 3, 15, 8); P(g, '#bfc5ca', 1, 6, 17, 1); P(g, '#f7f7f2', 19, 2, 9, 10); P(g, '#5d8fb0', 24, 3, 3, 8); P(g, '#ffe27a', 29, 2, 1, 2); P(g, '#ffe27a', 29, 10, 1, 2); P(g, '#c0392b', 0, 2, 1, 2); P(g, '#c0392b', 0, 10, 1, 2); }
    else if (type === 'saipa') { c = mk(25, 13); g = c.getContext('2d'); P(g, '#111', 3, 0, 5, 2); P(g, '#111', 3, 11, 5, 2); P(g, '#111', 17, 0, 5, 2); P(g, '#111', 17, 11, 5, 2); P(g, '#e5b422', 0, 1, 25, 11); P(g, '#f1c84a', 6, 2, 12, 9); P(g, '#3d5f78', 5, 3, 3, 7); P(g, '#5d8fb0', 16, 3, 4, 7); P(g, '#fff', 9, 5, 6, 3); P(g, '#111', 10, 6, 4, 1); P(g, '#ffe27a', 24, 2, 1, 2); P(g, '#ffe27a', 24, 9, 1, 2); P(g, '#c0392b', 0, 2, 1, 2); P(g, '#c0392b', 0, 9, 1, 2); }
    else { c = mk(34, 16); g = c.getContext('2d'); for (const x of [3, 14, 25]) { P(g, '#111', x, 0, 6, 2); P(g, '#111', x, 14, 6, 2); } P(g, '#566b3a', 0, 1, 34, 14); P(g, '#44562d', 1, 2, 22, 12); P(g, '#6b8148', 2, 3, 20, 2); P(g, '#6b8148', 2, 11, 20, 2); P(g, '#3a4a26', 11, 5, 4, 6); P(g, '#62783f', 24, 2, 9, 12); P(g, '#27333f', 29, 4, 3, 8); P(g, '#333', 33, 3, 1, 10); P(g, '#ffe27a', 33, 2, 1, 2); P(g, '#ffe27a', 33, 12, 1, 2); }
    if (armor) { const w = c.width, h = c.height; P(g, '#6f7480', w - 3, 1, 3, h - 2); P(g, '#9aa0ab', w - 2, 2, 1, h - 4); P(g, '#6f7480', 2, 0, w - 6, 1); P(g, '#6f7480', 2, h - 1, w - 6, 1); for (let y = 2; y < h - 2; y += 3) P(g, '#3f434c', w - 3, y, 1, 1); }
    if (wreck) { const r = R(wreck * 31 + type.length), w = c.width, h = c.height, id = g.getImageData(0, 0, w, h), d = id.data; for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const m = r(); if (m < .28) { d[i] = 110 + m * 100; d[i + 1] = 62; d[i + 2] = 30; } else { d[i] = d[i] * .62 + 30; d[i + 1] = d[i + 1] * .58 + 22; d[i + 2] = d[i + 2] * .52 + 14; } } g.putImageData(id, 0, 0); P(g, '#151515', (w * .55) | 0, 3, 4, h - 6); }
    return cache[k] = c;
  }

  // ---- props: returns {c, ax, ay} (anchor = base point)
  function prop(kind, v) {
    const k = 'p' + kind + '_' + (v || 0); if (cache[k]) return cache[k];
    let c, g, ax, ay; const S = (w, h, x, y) => { c = mk(w, h); g = c.getContext('2d'); ax = x; ay = y; };
    const r = R((v || 0) * 7 + kind.length * 3);
    switch (kind) {
      case 'palm': S(30, 34, 15, 32); P(g, 'rgba(0,0,0,.22)', 9, 30, 13, 3); for (let y = 14; y < 32; y += 3) { P(g, '#7a5a36', 14, y, 3, 3); P(g, '#5f4326', 14, y + 2, 3, 1); }
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (v % 3) * .2; for (let s = 1; s < 13; s++) { const x = 15 + Math.cos(a) * s, y = 12 + Math.sin(a) * s * .75 + s * s * .035; P(g, s % 3 ? '#3f7a34' : '#56963f', x | 0, y | 0, 2, 2); } } P(g, '#c98a2b', 14, 12, 3, 3); break;
      case 'tree': S(24, 28, 12, 26); P(g, 'rgba(0,0,0,.22)', 5, 24, 14, 3); P(g, '#5f4326', 11, 16, 2, 10); P(g, '#4f7f3a', 4, 3, 16, 14); P(g, '#4f7f3a', 2, 6, 20, 8); P(g, '#6a9a4c', 6, 4, 8, 5); P(g, '#3c6a2c', 12, 11, 7, 5); break;
      case 'gen': S(16, 13, 8, 12); P(g, 'rgba(0,0,0,.25)', 1, 11, 15, 2); P(g, '#c9302c', 1, 3, 14, 8); P(g, '#e3b62f', 1, 3, 14, 2); P(g, '#7a1d1a', 1, 9, 14, 2); P(g, '#333', 3, 6, 4, 3); P(g, '#555', 11, 0, 2, 4); P(g, '#111', 9, 6, 4, 1); P(g, '#111', 9, 8, 4, 1); break;
      case 'bigen': S(26, 18, 13, 17); P(g, 'rgba(0,0,0,.25)', 1, 16, 25, 2); P(g, '#d9a51f', 1, 3, 24, 13); P(g, '#a77a12', 1, 13, 24, 3); P(g, '#333', 3, 6, 8, 6); P(g, '#111', 13, 6, 9, 1); P(g, '#111', 13, 8, 9, 1); P(g, '#111', 13, 10, 9, 1); P(g, '#555', 20, 0, 3, 4); break;
      case 'trash': S(14, 12, 7, 11); P(g, 'rgba(0,0,0,.22)', 1, 10, 13, 2); P(g, '#2f6b45', 1, 2, 11, 8); P(g, '#245236', 1, 2, 11, 2); P(g, '#111', 2, 9, 2, 2); P(g, '#111', 9, 9, 2, 2); P(g, '#ddd', 12, 8, 2, 2); P(g, '#b55', 11, 10, 2, 1); P(g, '#dc6', 9, 0, 2, 2); break;
      case 'pole': S(9, 26, 4, 25); P(g, '#5a4630', 4, 2, 2, 24); P(g, '#5a4630', 0, 3, 9, 1); P(g, '#222', 0, 2, 1, 1); P(g, '#222', 8, 2, 1, 1); P(g, '#8a8a8a', 3, 8, 4, 3); break;
      case 'stall': S(20, 20, 10, 19); P(g, 'rgba(0,0,0,.22)', 1, 17, 18, 3); P(g, '#7a5a36', 2, 10, 16, 6); P(g, '#111', 3, 16, 3, 3); P(g, '#111', 14, 16, 3, 3); for (let i = 0; i < 5; i++) P(g, i % 2 ? '#fff' : ['#c0392b', '#1f6fb2', '#1e8e5a'][v % 3], i * 4, 0, 4, 6); P(g, '#5a4630', 9, 6, 1, 4); P(g, ['#e67e22', '#c0392b', '#7fb23a'][v % 3], 4, 8, 4, 3); P(g, '#f1c40f', 10, 8, 5, 3); break;
      case 'barrel': S(10, 12, 5, 11); P(g, '#2c5f8a', 1, 1, 8, 10); P(g, '#1f4666', 1, 4, 8, 1); P(g, '#1f4666', 1, 8, 8, 1); P(g, '#6fa3cc', 2, 1, 6, 1); break;
      case 'tires': S(12, 10, 6, 9); P(g, '#151515', 1, 3, 10, 6); P(g, '#444', 4, 5, 4, 2); P(g, '#151515', 2, 0, 8, 4); P(g, '#444', 5, 1, 2, 2); break;
      case 'tent': S(34, 26, 17, 25); P(g, 'rgba(0,0,0,.22)', 1, 23, 33, 3); P(g, '#5f6e3c', 1, 4, 32, 20); P(g, '#74854a', 1, 4, 32, 9); P(g, '#48552c', 15, 4, 3, 20); P(g, '#2e371c', 13, 15, 7, 9); break;
      case 'fridge': S(11, 16, 5, 13); P(g, '#e8ecee', 0, 0, 11, 15); P(g, '#b9c0c4', 0, 5, 11, 1); P(g, '#8f979c', 8, 2, 1, 2); P(g, '#8f979c', 8, 8, 1, 4); P(g, '#aab1b5', 0, 14, 11, 1); break;
      case 'cupboard': S(14, 15, 7, 12); P(g, '#7a5230', 0, 0, 14, 14); P(g, '#93673e', 1, 1, 5, 12); P(g, '#93673e', 8, 1, 5, 12); P(g, '#d9b25a', 5, 6, 1, 2); P(g, '#d9b25a', 8, 6, 1, 2); break;
      case 'shelf': S(16, 13, 8, 10); P(g, '#6d7379', 0, 0, 16, 12); P(g, '#3f4449', 1, 1, 14, 4); P(g, '#3f4449', 1, 7, 14, 4); const cs = ['#c0392b', '#f1c40f', '#1e8e5a', '#1f6fb2', '#eee']; for (let i = 0; i < 6; i++) { P(g, cs[(r() * 5) | 0], 2 + i * 2, 2, 2, 3); P(g, cs[(r() * 5) | 0], 2 + i * 2, 8, 2, 3); } break;
      case 'med': S(14, 14, 7, 11); P(g, '#f3f3f3', 0, 0, 14, 13); P(g, '#c9c9c9', 1, 6, 12, 1); P(g, '#d0312d', 6, 1, 2, 4); P(g, '#d0312d', 5, 2, 4, 2); P(g, '#7fc', 2, 8, 2, 3); P(g, '#fc7', 5, 8, 2, 3); P(g, '#c7f', 9, 8, 2, 3); break;
      case 'locker': S(12, 16, 6, 13); P(g, '#5a6470', 0, 0, 12, 15); P(g, '#737e8c', 1, 1, 4, 13); P(g, '#737e8c', 7, 1, 4, 13); P(g, '#222', 2, 3, 2, 1); P(g, '#222', 8, 3, 2, 1); P(g, '#e3b62f', 4, 8, 1, 1); P(g, '#e3b62f', 10, 8, 1, 1); break;
      case 'desk': S(16, 12, 8, 9); P(g, '#6b4a2a', 0, 2, 16, 8); P(g, '#8a6238', 0, 2, 16, 3); P(g, '#eee', 3, 0, 4, 3); P(g, '#111', 10, 0, 4, 3); P(g, '#4a3219', 1, 10, 2, 2); P(g, '#4a3219', 13, 10, 2, 2); break;
      case 'crate': S(12, 12, 6, 10); P(g, '#9a7442', 0, 0, 12, 11); P(g, '#6f5230', 0, 0, 12, 1); P(g, '#6f5230', 0, 10, 12, 1); P(g, '#6f5230', 0, 0, 1, 11); P(g, '#6f5230', 11, 0, 1, 11); P(g, '#6f5230', 1, 5, 10, 1); break;
      case 'bed': S(14, 22, 7, 18); P(g, '#6b4a2a', 0, 0, 14, 22); P(g, '#e9e4d6', 1, 1, 12, 20); P(g, '#fff', 3, 2, 8, 5); P(g, '#a8423a', 1, 9, 12, 12); P(g, '#c45a50', 1, 9, 12, 2); break;
      case 'bench': S(18, 13, 9, 10); P(g, '#5a4630', 0, 3, 18, 7); P(g, '#7a6040', 0, 3, 18, 2); P(g, '#888', 2, 0, 5, 3); P(g, '#c33', 9, 1, 2, 2); P(g, '#aaa', 12, 0, 1, 3); P(g, '#aaa', 11, 0, 3, 1); P(g, '#3a2c1c', 1, 10, 2, 3); P(g, '#3a2c1c', 15, 10, 2, 3); break;
      case 'radio': S(12, 12, 6, 10); P(g, '#5a4630', 0, 7, 12, 4); P(g, '#2a2a2a', 2, 2, 8, 5); P(g, '#7fc24b', 3, 3, 3, 2); P(g, '#999', 7, 3, 2, 3); P(g, '#aaa', 9, 0, 1, 2); break;
      case 'pepsi': S(20, 18, 10, 16); P(g, '#9a7442', 0, 6, 20, 11); P(g, '#6f5230', 0, 6, 20, 1); P(g, '#6f5230', 0, 16, 20, 1); for (let i = 0; i < 6; i++) { P(g, '#1b4fa3', 1 + i * 3, 1, 2, 6); P(g, '#d0312d', 1 + i * 3, 4, 2, 2); P(g, '#ddd', 1 + i * 3, 0, 2, 1); } P(g, '#7fc24b', 3, 9, 2, 2); P(g, '#7fc24b', 12, 12, 3, 2); P(g, '#7fc24b', 8, 10, 1, 4); break;
      case 'page': S(8, 9, 4, 8); P(g, '#f3ecd2', 0, 0, 8, 9); P(g, '#8fa0d0', 1, 2, 6, 1); P(g, '#8fa0d0', 1, 4, 6, 1); P(g, '#8fa0d0', 1, 6, 4, 1); P(g, '#e59a9a', 1, 0, 1, 9); break;
      case 'item': S(10, 10, 5, 9); P(g, '#e3b62f', 2, 2, 6, 6); P(g, '#fff3b0', 3, 3, 2, 2); P(g, '#a8841a', 2, 7, 6, 1); break;
      case 'wpipe': S(12, 5, 6, 4); P(g, '#9aa0a6', 0, 1, 12, 2); P(g, '#c9cfd4', 0, 1, 12, 1); P(g, '#6b7177', 10, 0, 2, 4); break;
      case 'wcleaver': S(10, 7, 5, 6); P(g, '#5a4630', 0, 3, 4, 2); P(g, '#c9cfd4', 4, 0, 6, 6); P(g, '#eef2f5', 4, 5, 6, 1); break;
      case 'wshovel': S(14, 6, 7, 5); P(g, '#7a5a36', 0, 2, 9, 2); P(g, '#8a9096', 9, 0, 5, 6); P(g, '#b9bfc5', 10, 1, 3, 2); break;
      default: S(8, 8, 4, 7); P(g, '#f0f', 0, 0, 8, 8);
    }
    return cache[k] = { c, ax, ay };
  }

  function roof(b) {
    const w = b.w * 16, h = b.h * 16, c = mk(w, h), g = c.getContext('2d'), r = R(b.seed + 7), t = b.type;
    const ph = [['#d8c9a3', '#bfae86'], ['#cfc4ad', '#b3a78d'], ['#c7b08a', '#a8926c'], ['#d6bfa0', '#b89f7e'], ['#d9cdb8', '#bcae96']], ps = [['#b9b4aa', '#9a958b'], ['#c2b9a5', '#a39a86'], ['#b3aa98', '#948b79']];
    let base, edge; const isShop = t === 'shop' || t === 'butcher' || t === 'bookshop' || t === 'pharmacy';
    if (t === 'mall') { base = '#9fb7c4'; edge = '#5f7b8b'; } else if (t === 'warehouse') { base = '#8b9097'; edge = '#5d6269'; } else if (t === 'armory') { base = '#6b7a4a'; edge = '#4a5632'; }
    else if (t === 'police') { base = '#8fa0b8'; edge = '#5d6f8a'; } else if (t === 'pharmacy') { base = '#e3e3de'; edge = '#b0b0a9'; } else if (b.st === 3) { base = '#b89a6e'; edge = '#7a5433'; }
    else if (t === 'home') { base = '#d8c9a3'; edge = '#a8843f'; } else [base, edge] = (isShop ? ps : ph)[(r() * (isShop ? ps : ph).length) | 0];
    P(g, base, 0, 0, w, h);
    for (let i = 0; i < w * h / 36; i++) P(g, 'rgba(0,0,0,.06)', (r() * w) | 0, (r() * h) | 0, 2, 1);
    P(g, edge, 0, 0, w, 2); P(g, edge, 0, h - 2, w, 2); P(g, edge, 0, 0, 2, h); P(g, edge, w - 2, 0, 2, h); P(g, 'rgba(255,255,255,.2)', 2, 2, w - 4, 1); P(g, 'rgba(0,0,0,.15)', 2, h - 3, w - 4, 1);
    const tank = (x, y) => { P(g, 'rgba(0,0,0,.2)', x + 2, y + 2, 8, 8); P(g, '#1d1d1f', x + 1, y, 6, 8); P(g, '#1d1d1f', x, y + 1, 8, 6); P(g, '#3a3a3e', x + 2, y + 1, 3, 2); P(g, '#0d0d0e', x + 3, y + 3, 2, 2); };
    const dish = (x, y) => { P(g, 'rgba(0,0,0,.2)', x + 2, y + 2, 7, 7); P(g, '#c9c9c9', x + 1, y, 5, 7); P(g, '#c9c9c9', x, y + 1, 7, 5); P(g, '#9a9a9a', x + 2, y + 2, 3, 3); P(g, '#555', x + 3, y + 3, 1, 1); };
    const ac = (x, y) => { P(g, 'rgba(0,0,0,.2)', x + 1, y + 1, 9, 7); P(g, '#d6d6d0', x, y, 8, 6); P(g, '#8c8c86', x + 1, y + 1, 6, 4); P(g, '#b5b5ae', x + 3, y + 2, 2, 2); };
    const stair = (x, y) => { P(g, edge, x, y, 14, 13); P(g, 'rgba(255,255,255,.18)', x + 1, y + 1, 12, 2); P(g, '#3a2a1a', x + 5, y + 9, 4, 4); };
    if (t === 'mall') {
      for (let y = 22; y < h - 40; y += 26) for (let x = 14; x < w - 34; x += 34) { P(g, '#6f93a8', x, y, 26, 18); P(g, '#b7d6e4', x + 1, y + 1, 24, 16); P(g, '#6f93a8', x + 12, y, 2, 18); P(g, '#6f93a8', x, y + 8, 26, 2); }
      ac(8, 6); ac(22, 6); ac(w - 20, 6); tank(w - 36, 6); dish(w - 50, 7);
    } else if (t === 'warehouse') { for (let x = 4; x < w - 4; x += 4) P(g, 'rgba(0,0,0,.13)', x, 3, 1, h - 6); P(g, '#1b4fa3', 20, h - 30, w - 40, 18); P(g, '#d0312d', 20, h - 21, w - 40, 9); P(g, '#fff', 24, h - 23, w - 48, 3); }
    else if (t === 'armory') { for (let x = 6; x < w - 6; x += 10) P(g, '#4a5632', x, 4, 5, h - 8); }
    else if (w >= 64) {
      stair(4 + ((r() * (w - 26)) | 0), b.door === 'S' ? 4 : h - 18);
      const items = [tank, dish, ac, tank, dish], n = 2 + (r() * 3 | 0);
      for (let i = 0; i < n; i++) items[(r() * items.length) | 0](6 + ((r() * (w - 22)) | 0), 22 + ((r() * Math.max(4, h - 50)) | 0));
      if (r() < .55 && !isShop) { const y = b.door === 'S' ? h - 14 : 10; P(g, '#444', 6, y, w - 12, 1); const cols = ['#c33', '#36c', '#eee', '#2a7', '#e9c']; for (let x = 8; x < w - 12; x += 5 + (r() * 4 | 0)) P(g, cols[(r() * 5) | 0], x, y + 1, 3, 3 + (r() * 2 | 0)); }
    } else { tank(6, 8); ac(w - 16, h - 16); }
    if (isShop || t === 'mall' || t === 'police') {
      const cols = ['#c0392b', '#1f6fb2', '#1e8e5a', '#d4a017', '#8e44ad', '#16818f'], col = t === 'pharmacy' ? '#1e8e5a' : t === 'butcher' ? '#b02a1e' : t === 'police' ? '#1c2f55' : t === 'mall' ? '#c9a84c' : cols[(r() * cols.length) | 0];
      const sh = t === 'mall' ? 12 : 8, y = b.door === 'S' ? h - sh : 0; P(g, col, 2, y, w - 4, sh); P(g, 'rgba(0,0,0,.25)', 2, y + sh - 1, w - 4, 1);
      if (t === 'mall') { g.fillStyle = '#16120a'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText('KARRADA MALL', w / 2, y + 10); }
      else { P(g, 'rgba(255,255,255,.9)', 6, y + 2, w - 12, 1); for (let x = 7; x < w - 9; x += 3 + (r() * 3 | 0)) P(g, '#fff', x, y + 4, 2, 2); }
      if (t === 'pharmacy') { P(g, '#fff', w / 2 - 1, y + 1, 2, 6); P(g, '#fff', w / 2 - 3, y + 3, 6, 2); }
    }
    if (b.st === 3 && t !== 'warehouse') { const y = b.door === 'S' ? h - 7 : 0; P(g, '#6b4526', 0, y, w, 7); for (let x = 1; x < w; x += 3) P(g, '#96683c', x, y + 1, 1, 5); P(g, '#3d2614', 0, y + (b.door === 'S' ? 0 : 6), w, 1); P(g, '#96683c', 0, y + 3, w, 1); }
    return c;
  }
  return { mk, R, P, tile, wall, char, cat, veh, prop, roof };
})();
