// IBRA ZOMBIE - isometric 3D view (Three.js): sun shadows by time of day, street lamps at night.
// World units: 1 unit = 1 tile (16 game px). X = east, Z = south, Y = up.
const View3D = (() => {
  let YAW = 0.62; const PITCH = 0.9, W = World.W, H = World.H, I = World.I, T = World.tiles;
  let renderer, scene, cam, sun, hemi, flash, mallL, homeL, wreckG, beam, bridgeG, pads = [], view = 11, rnd, t = 0; const xcars = new Map();
  const tgt = new THREE.Vector3(), lampLights = [], lamps = [], bld = [], gates = {}, picks = [], figs = new Map(), vehs = [];
  const rr = (a, b) => a + rnd() * (b - a);
  const mats = {}; const M = (color, o) => { const k = color + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .92, metalness: 0 }, o))); };
  function box(w, h, d, mat, x, y, z, parent, noCast) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = !noCast; m.receiveShadow = true; (parent || scene).add(m); return m; }
  function cyl(r1, r2, h, seg, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; }

  // ------------------------------------------------------------ textures
  let NZ;
  function noiseCanvas(n, a) { const c = Art.mk(n, n), g = c.getContext('2d'), id = g.createImageData(n, n); for (let i = 0; i < n * n; i++) { const v = 128 + (rnd() - .5) * a * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); return c; }
  function blotches(g, w, h, n, cols, rmin, rmax, alpha) { for (let i = 0; i < n; i++) { const x = rnd() * w, y = rnd() * h, r = rr(rmin, rmax), gr = g.createRadialGradient(x, y, 0, x, y, r), c = cols[(rnd() * cols.length) | 0]; gr.addColorStop(0, c.replace('A', alpha * rr(.4, 1))); gr.addColorStop(1, c.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } }
  function asTex(c, rep) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
  function groundTex() {
    const S = 24, c = Art.mk(W * S, H * S), g = c.getContext('2d');
    const col = { 0: '#a8946c', 8: '#7d8455', 1: '#3d3e42', 2: '#8f8a80', 3: '#b8aa90', 12: '#8a7a60', 13: '#8a7a60', 9: '#9aa1a6', 5: '#3f6f73', 6: '#5d5e62', 7: '#77766f', 10: '#a8946c', 11: '#3d3e42', 4: '#8a7b60' };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { g.fillStyle = col[T[I(x, y)]] || '#a8946c'; g.fillRect(x * S, y * S, S, S); }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const tt = T[I(x, y)];
      if (tt === 2) { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x * S, y * S, S, 1); g.fillRect(x * S, y * S, 1, S); g.fillRect(x * S + S / 2, y * S, 1, S); g.fillRect(x * S, y * S + S / 2, S, 1);
        g.fillStyle = 'rgba(235,230,215,.5)'; if (T[I(x, y + 1)] === 1) g.fillRect(x * S, y * S + S - 3, S, 3); if (T[I(x, y - 1)] === 1) g.fillRect(x * S, y * S, S, 3); if (T[I(x + 1, y)] === 1) g.fillRect(x * S + S - 3, y * S, 3, S); if (T[I(x - 1, y)] === 1) g.fillRect(x * S, y * S, 3, S); }
      if (tt === 3 || tt === 9) { g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x * S, y * S, S, 1); g.fillRect(x * S, y * S, 1, S); g.fillRect(x * S + S / 2, y * S, 1, S); g.fillRect(x * S, y * S + S / 2, S, 1); }
      if ((tt === 1 || tt === 6 || tt === 11) && y === 56 && x % 2 === 0) { g.fillStyle = 'rgba(225,220,200,.8)'; g.fillRect(x * S + 4, y * S - 2, S + 6, 3); }
      if (tt === 1 && (y === 54 || y === 57)) { g.fillStyle = 'rgba(225,220,200,.45)'; g.fillRect(x * S, y * S + (y === 54 ? 5 : S - 7), S, 2); }
      if (tt === 1 && (y === 21 || y === 91) && x % 3 === 0) { g.fillStyle = 'rgba(210,205,190,.5)'; g.fillRect(x * S + 4, y * S - 1, S, 2); } }
    blotches(g, c.width, c.height, 5200, ['rgba(40,34,26,A)', 'rgba(70,60,44,A)', 'rgba(200,185,150,A)', 'rgba(25,25,28,A)'], 14, 80, .22);
    blotches(g, c.width, c.height, 900, ['rgba(160,140,100,A)'], 60, 200, .16);
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .5; g.fillStyle = g.createPattern(NZ, 'repeat'); g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    for (let i = 0; i < 2600; i++) { const x = (rnd() * W) | 0, y = (rnd() * H) | 0; if (T[I(x, y)] !== 1) continue; g.strokeStyle = 'rgba(15,15,18,' + rr(.25, .6) + ')'; g.lineWidth = 1; g.beginPath(); let px = x * S + rnd() * S, py = y * S + rnd() * S; g.moveTo(px, py); for (let k = 0; k < 5; k++) { px += rr(-9, 9); py += rr(-9, 9); g.lineTo(px, py); } g.stroke(); }
    return asTex(c);
  }
  const WALLC = [['#c2a56c', '#a8884f'], ['#cfc3a6', '#b3a585'], ['#a9a69c', '#8c897f'], ['#9a7450', '#7b5a3c'], ['#7f99a6', '#5f7c8c'], ['#75805a', '#5a6644'], ['#8d9197', '#6c7076'], ['#c49c84', '#a47c66']];
  function wallTex(st, kind) {
    const c = Art.mk(256, 256), g = c.getContext('2d'), [b, d] = WALLC[st] || WALLC[0]; g.fillStyle = b; g.fillRect(0, 0, 256, 256);
    if (st === 0 || st === 3) { g.fillStyle = 'rgba(0,0,0,.11)'; for (let y = 0; y < 256; y += 10) { g.fillRect(0, y, 256, 1); for (let x = (y / 10 % 2) * 12; x < 256; x += 24) g.fillRect(x, y, 1, 10); } }
    blotches(g, 256, 256, 26, ['rgba(40,30,20,A)', 'rgba(255,245,220,A)'], 20, 90, .2);
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(30,24,18,.28)'); gr.addColorStop(.18, 'rgba(0,0,0,0)'); gr.addColorStop(.8, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(50,40,28,.4)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9; i++) { const x = rnd() * 256, s = g.createLinearGradient(0, 0, 0, rr(80, 200)); s.addColorStop(0, 'rgba(30,25,20,.3)'); s.addColorStop(1, 'rgba(30,25,20,0)'); g.fillStyle = s; g.fillRect(x, 0, rr(3, 9), 220); }
    if (kind === 'win') { g.fillStyle = d; g.fillRect(74, 62, 108, 124); g.fillStyle = '#1c232b'; g.fillRect(82, 70, 92, 108); g.fillStyle = 'rgba(140,170,190,.35)'; g.fillRect(82, 70, 92, 40); g.fillStyle = d; g.fillRect(126, 70, 4, 108); g.fillRect(82, 122, 92, 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(70, 186, 116, 6);
      if (rnd() < .6) { g.fillStyle = '#d5d5cf'; g.fillRect(190, 150, 46, 30); g.fillStyle = '#8b8b85'; g.fillRect(195, 155, 36, 20); }
      g.strokeStyle = 'rgba(20,20,22,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(80, 58, 170, 30, 256, 46); g.stroke(); }
    else if (kind === 'shop') { g.fillStyle = '#5c6268'; g.fillRect(24, 50, 208, 206); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 56; y < 256; y += 9) g.fillRect(24, y, 208, 2); g.fillStyle = ['#a8362a', '#1f5f96', '#1d7a50', '#b88b14'][(rnd() * 4) | 0]; g.fillRect(8, 6, 240, 40); g.fillStyle = 'rgba(255,255,255,.85)'; for (let x = 26; x < 226; x += rr(10, 22)) g.fillRect(x, 20, rr(5, 12), 10); }
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .45; g.drawImage(NZ, 0, 0); return asTex(c, true);
  }
  function roofTex(base) { const c = Art.mk(256, 256), g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 256, 256); blotches(g, 256, 256, 40, ['rgba(40,34,26,A)', 'rgba(230,220,195,A)', 'rgba(90,70,45,A)'], 14, 70, .26); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .5; g.drawImage(NZ, 0, 0); return asTex(c, true); }

  // ------------------------------------------------------------ init
  function init(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(innerWidth, innerHeight, false);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 420);
  }
  function resize() { if (renderer) renderer.setSize(innerWidth, innerHeight, false); }

  // ------------------------------------------------------------ static world
  function build() {
    rnd = Art.R(77); scene = new THREE.Scene(); lamps.length = bld.length = picks.length = vehs.length = lampLights.length = 0; figs.clear(); for (const k in gates) delete gates[k];
    renderer.renderLists.dispose(); NZ = NZ || noiseCanvas(256, .5);
    const TEX = {}, tex = (st, k) => TEX[st + k] || (TEX[st + k] = wallTex(st, k)), ROOFS = ['#b9ab8c', '#a89d85', '#b3a184', '#9c9482'].map(roofTex);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: groundTex(), roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true; scene.add(ground);
    // buildings: outer shell (walls + roof) and cut-away inside view
    for (const b of World.buildings) {
      const big = b.type === 'mall' || b.type === 'warehouse', shop = ['shop', 'butcher', 'pharmacy', 'bookshop'].includes(b.type);
      const floors = b.type === 'mall' || b.type === 'hospital' ? 3 : b.type === 'camp' ? 1 : b.type === 'warehouse' ? 2 : (b.type === 'booth' || b.type === 'armory' || b.type === 'home') ? 1 : (rnd() < .45 ? 2 : 1) + (World.zoneOf(b.x) === 2 && rnd() < .5 ? 1 : 0), fh = 1.7, h = floors * fh;
      const cx = b.x + b.w / 2, cz = b.y + b.h / 2, shell = new THREE.Group(), inside = new THREE.Group(); scene.add(shell, inside); inside.visible = false; bld.push({ shell, inside });
      const mk = (len, kind) => { const tx = tex(b.st, kind).clone(); tx.needsUpdate = true; tx.repeat.set(Math.max(1, Math.round(len / 2.4)), kind === 'shop' ? 1 : floors); return new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }); };
      const front = b.door === 'S' ? 4 : 5, ms = []; for (let i = 0; i < 6; i++) ms.push(i === 2 || i === 3 ? new THREE.MeshStandardMaterial({ map: ROOFS[(rnd() * ROOFS.length) | 0], roughness: 1 }) : mk(i < 2 ? b.h : b.w, 'win'));
      if (shop && floors === 1) ms[front] = mk(b.w, 'shop');
      const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, h, b.h), ms); body.position.set(cx, h / 2, cz); body.castShadow = body.receiveShadow = true; shell.add(body);
      const dz = b.door === 'S' ? b.y + b.h + .03 : b.y - .03;
      if (shop && floors > 1) { const tx = tex(b.st, 'shop').clone(); tx.needsUpdate = true; tx.repeat.set(Math.max(1, Math.round(b.w / 2.6)), 1); box(b.w + .02, fh, .06, new THREE.MeshStandardMaterial({ map: tx }), cx, fh / 2, dz, shell, true); }
      box(b.dw * .8, 1.25, .08, M(b.type === 'home' ? '#3f6b3a' : '#4a3a28'), b.dx + b.dw / 2, .62, dz, shell, true);                                          // door
      if (b.type === 'home' || b.type === 'mall') box(.5, .12, .12, new THREE.MeshStandardMaterial({ color: '#7fc24b', emissive: '#7fc24b', emissiveIntensity: 1.5 }), b.dx + b.dw / 2, 1.45, dz, shell, true);
      const pm = M(WALLC[b.st][1]), ph = .45, pt = .22;
      box(b.w, ph, pt, pm, cx, h + ph / 2, b.y + pt / 2, shell); box(b.w, ph, pt, pm, cx, h + ph / 2, b.y + b.h - pt / 2, shell); box(pt, ph, b.h, pm, b.x + pt / 2, h + ph / 2, cz, shell); box(pt, ph, b.h, pm, b.x + b.w - pt / 2, h + ph / 2, cz, shell);
      if (b.type === 'hospital') { const cm = new THREE.MeshStandardMaterial({ color: '#d0312d', emissive: '#d0312d', emissiveIntensity: .5 }); box(2.6, .08, .75, cm, cx, h + .5, cz, shell, true); box(.75, .08, 2.6, cm, cx, h + .5, cz, shell, true); }
      if (b.type === 'camp') { box(.07, 3.2, .07, M('#3a3a3a'), b.x + 1.2, h + 1.6, b.y + 1.2, shell); box(1, .55, .03, M('#5a6b3a'), b.x + 1.72, h + 2.9, b.y + 1.2, shell); for (const sx of [-1, 1]) box(1.6, .5, .5, M('#9a8a62'), b.dx + .5 + sx * 1.6, .25, b.door === 'S' ? b.y + b.h + .6 : b.y - .6, shell); }
      if (shop || big) box(b.w + .5, .1, 1.3, M(['#8a3a2e', '#35587a', '#3d6b4c', '#8f7a3a'][(rnd() * 4) | 0]), cx, fh + .05, b.door === 'S' ? b.y + b.h + .6 : b.y - .6, shell);
      const n = big ? 8 : 2 + ((rnd() * 3) | 0);
      for (let i = 0; i < n; i++) { const x = rr(b.x + 1, b.x + b.w - 1), z = rr(b.y + 1, b.y + b.h - 1), k = rnd();
        if (k < .4) { cyl(.42, .42, .8, 12, M('#1b1b1d', { roughness: .6 }), x, h + .55, z, shell); box(.9, .15, .9, M('#6b6558'), x, h + .08, z, shell); }
        else if (k < .65) { const d = new THREE.Mesh(new THREE.SphereGeometry(.4, 12, 6, 0, 6.3, 0, 1.1), M('#c9c9c4', { side: THREE.DoubleSide })); d.position.set(x, h + .5, z); d.rotation.set(2.2, rr(0, 6), 0); d.castShadow = true; shell.add(d); box(.05, .5, .05, M('#555'), x, h + .25, z, shell); }
        else if (k < .85) box(.8, .5, .5, M('#cfcfc8'), x, h + .25, z, shell); else box(1.6, 1.3, 1.4, M(WALLC[b.st][0]), x, h + .65, z, shell); }
      if (!shop && !big && rnd() < .6) { const z = rr(b.y + .8, b.y + b.h - .8); box(.04, 1, .04, M('#444'), b.x + .7, h + .5, z, shell); box(.04, 1, .04, M('#444'), b.x + b.w - .7, h + .5, z, shell); for (let x = b.x + 1; x < b.x + b.w - 1; x += rr(.5, .9)) box(.4, rr(.4, .7), .03, M(['#b33333', '#3355aa', '#dddddd', '#22aa77', '#dd99bb'][(rnd() * 5) | 0]), x, h + .65, z, shell); }
      // inside: low cut-away walls
      const wm = M(WALLC[b.st][0]);
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { const tt = T[I(x, y)]; if (tt === 4) box(1, .7, 1, wm, x + .5, .35, y + .5, inside); else if (tt === 13) box(1, .9, .3, M('#5a626e'), x + .5, .45, y + .5, inside); }
    }
    const P = { stairs: [[.9, .25, .9, '#7a7468', 0, .12, .3], [.9, .5, .6, '#6f695e', 0, .25, .1], [.9, .8, .3, '#645e54', 0, .4, -.2]], fridge: [[.5, 1.15, .5, '#e3e7e9', 0, .58, 0]], cupboard: [[.75, 1, .45, '#7a5230', 0, .5, 0]], shelf: [[.9, .9, .35, '#6d7379', 0, .45, 0], [.8, .12, .3, '#c0392b', 0, .62, 0], [.8, .12, .3, '#e3b62f', 0, .32, 0]], med: [[.8, .95, .35, '#f0f0f0', 0, .48, 0], [.3, .1, .37, '#d0312d', 0, .7, 0]], locker: [[.6, 1.2, .45, '#5a6470', 0, .6, 0]], desk: [[.95, .5, .55, '#6b4a2a', 0, .25, 0], [.3, .2, .25, '#222222', .15, .6, 0]], crate: [[.65, .55, .65, '#9a7442', 0, .28, 0]],
      bed: [[.8, .3, 1.5, '#6b4a2a', 0, .15, 0], [.72, .12, .9, '#a8423a', 0, .36, .25], [.6, .1, .35, '#f4f4f4', 0, .36, -.5]], bench: [[1.1, .55, .6, '#5a4630', 0, .28, 0], [.3, .15, .2, '#888888', -.2, .62, 0]], radio: [[.8, .45, .5, '#5a4630', 0, .22, 0], [.4, .25, .2, '#2a2a2a', 0, .58, 0]], bigen: [[1.6, .9, .8, '#d9a51f', -.3, .45, 0], [.5, .5, .5, '#333333', -.6, 1.1, 0]], pepsi: [[1.1, .5, .8, '#9a7442', 0, .25, 0], [.9, .3, .6, '#1b4fa3', 0, .65, 0], [.9, .08, .6, '#d0312d', 0, .7, 0]] };
    const putProp = (kind, x, z, parent) => { for (const p of P[kind] || P.crate) box(p[0], p[1], p[2], M(p[3]), x + p[4], p[5], z + p[6], parent); };
    const MI = World.spots._mall, me = bld[MI.b - 1]; me.fl = [0, 1, 2].map(() => { const g = new THREE.Group(); me.inside.add(g); return g; }); MI.floors.forEach((F, i) => F.forEach(o => putProp(o.k, o.tx + .5, o.ty + .5 - (o.k === 'bed' ? .2 : 0), me.fl[i + 1])));
    const par = (b, all) => { const e = bld[b - 1]; return e.fl && !all ? e.fl[0] : e.inside; };
    for (const c of World.containers) if (c.b) putProp(c.kind, c.x / 16, c.y / 16, par(c.b));
    for (const o of World.inner) putProp(o.k, o.x / 16, o.y / 16 - (o.k === 'bed' ? .2 : 0), par(o.b, o.all));
    // barriers (instanced), gates, fences
    { let n = 0, nf = 0; for (let i = 0; i < W * H; i++) { if (T[i] === 7) n++; if (T[i] === 10) nf++; }
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.96, 1.9, .55), M('#8d8c84'), n), fm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1.5, .06), M('#6f757b', { transparent: true, opacity: .75 }), nf), o = new THREE.Object3D(); let k = 0, kf = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const tt = T[I(x, y)]; if (tt !== 7 && tt !== 10) continue; const vert = (T[I(x, y - 1)] === tt || T[I(x, y + 1)] === tt) && T[I(x - 1, y)] !== tt; o.position.set(x + .5, tt === 7 ? .95 : .75, y + .5); o.rotation.y = vert ? Math.PI / 2 : 0; o.updateMatrix(); if (tt === 7) im.setMatrixAt(k++, o.matrix); else fm.setMatrixAt(kf++, o.matrix); }
      im.castShadow = im.receiveShadow = true; fm.castShadow = true; scene.add(im, fm); }
    for (const k in World.gates) { const g = new THREE.Group(), gx = World.gates[k].x; for (let y = 54; y <= 57; y++) { const m = box(.6, 1.6, .96, M('#8d8c84'), gx + .5, .8, y + .5, g); box(.62, .3, .98, M(y % 2 ? '#e3b62f' : '#222222'), gx + .5, 1.1, y + .5, g, true); } scene.add(g); gates[k] = g; }
    // props
    let pc = 0; wreckG = new THREE.Group(); scene.add(wreckG); xcars.clear();
    for (const p of World.props) { const x = p.x / 16, z = p.y / 16;
      if (p.k === 'palm') palm(x, z - .1); else if (p.k === 'tree') tree(x, z - .1); else if (p.k === 'wreck') { const c = car(p.t, 0, true); c.position.set(p.cx / 16, 0, p.cy / 16); c.rotation.y = -p.a; wreckG.add(c); }
      else if (p.k === 'pole') pole(x, z - .7, (pc++ % 2) === 0);
      else if (p.k === 'gen') { box(.85, .6, .5, M('#a8322a', { roughness: .6 }), x, .35, z - .4); box(.85, .1, .5, M('#c9a32a'), x, .7, z - .4); }
      else if (p.k === 'trash') box(.7, .55, .5, M('#2f5f41'), x, .28, z - .3).rotation.z = rr(-.3, .3);
      else if (p.k === 'barrel') cyl(.22, .22, .6, 10, M('#2c5a82', { roughness: .5 }), x, .3, z - .3);
      else if (p.k === 'tires') { cyl(.3, .3, .18, 12, M('#151515'), x, .09, z - .3); cyl(.3, .3, .18, 12, M('#151515'), x + .05, .27, z - .32); }
      else if (p.k === 'stall') { box(1.1, .5, .7, M('#7a5a36'), x, .4, z - .5); box(1.5, .06, 1.1, M(['#b3392b', '#2a66a3', '#2c8a57'][p.v % 3]), x, 1.5, z - .5); box(.05, 1.5, .05, M('#444'), x - .6, .75, z - .9); box(.05, 1.5, .05, M('#444'), x + .6, .75, z - .1); box(.4, .15, .3, M('#c0392b'), x - .2, .72, z - .5); box(.4, .15, .3, M('#7fb23a'), x + .25, .72, z - .5); }
      else if (p.k === 'tent') { const m = cyl(1, 1, 2.1, 3, M('#5f6b3c'), x - .5, .5, z - .5); m.rotation.z = Math.PI / 2; } }
    { const pts = []; for (const w of World.wires) { const a = new THREE.Vector3(w[0] / 16, 3.9, w[1] / 16 + .6), b = new THREE.Vector3(w[2] / 16, 3.4, w[3] / 16), m = a.clone().lerp(b, .5); m.y -= w[4] / 14; let prev = a; for (let i = 1; i <= 8; i++) { const tt = i / 8, p = a.clone().multiplyScalar((1 - tt) * (1 - tt)).add(m.clone().multiplyScalar(2 * (1 - tt) * tt)).add(b.clone().multiplyScalar(tt * tt)); pts.push(prev, p); prev = p; } } scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: .8 }))); }
    for (const p of World.pickups) { const g = new THREE.Group(); if (p.page != null) box(.3, .02, .4, new THREE.MeshStandardMaterial({ color: '#f3ecd2', emissive: '#f3ecd2', emissiveIntensity: .4 }), 0, 0, 0, g); else box(.75, .08, .1, new THREE.MeshStandardMaterial({ color: p.w === 'pipe' ? '#aab0b6' : p.w === 'cleaver' ? '#d0d5da' : '#8a6a40', metalness: .6, roughness: .4, emissive: '#554400', emissiveIntensity: .5 }), 0, 0, 0, g); g.position.set(p.x / 16, .4, p.y / 16); scene.add(g); picks.push({ p, g }); }
    // lights
    sun = new THREE.DirectionalLight(0xffffff, 1); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; hemi = new THREE.HemisphereLight(0xbcd0e6, 0x8a7a5a, .5); scene.add(sun, sun.target, hemi);
    for (let i = 0; i < 5; i++) { const l = new THREE.SpotLight(0xffe2b0, 0, 16, .95, .7, 1.2); l.castShadow = i < 2; l.shadow.mapSize.set(1024, 1024); scene.add(l, l.target); lampLights.push(l); }
    // skybridge mall <-> pharmacy, and glowing pads at passage entrances
    bridgeG = new THREE.Group(); { const m = M('#6f7480', { metalness: .4, roughness: .6 }), x = 123.5; box(1.1, .12, 6.6, m, x, 1.95, 56, bridgeG); for (const sx of [-.55, .55]) { box(.06, .55, 6.6, m, x + sx, 2.25, 56, bridgeG); } for (const z of [53.4, 58.6]) for (const sx of [-.45, .45]) box(.12, 1.9, .12, m, x + sx, .95, z, bridgeG); for (let z = 53.2; z < 59; z += .8) box(1.1, .02, .06, M('#e3b62f'), x, 2.02, z, bridgeG, true); } bridgeG.visible = false; scene.add(bridgeG);
    pads = []; for (const [k, sp, col] of [['hm', 'tunHome', '#7fc24b'], ['hm', 'tunMall', '#7fc24b'], ['mp', 'brMall', '#6cc4ff'], ['mp', 'brPharm', '#6cc4ff'], ['ma', 'tunMall2', '#e3b62f'], ['ma', 'tunArm', '#e3b62f']]) { const e = World.spots[sp], g = new THREE.Group(); box(.86, .05, .86, M('#1c1c20'), 0, .03, 0, g, true); box(.6, .04, .6, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4 }), 0, .07, 0, g, true); g.position.set(e.x / 16, 0, e.y / 16); g.visible = false; scene.add(g); pads.push({ k, g, b: World.bAt(e.x >> 4, e.y >> 4) }); }
    beam = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, 16, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd966, transparent: true, opacity: .3, depthWrite: false, side: THREE.DoubleSide })); beam.visible = false; scene.add(beam);
    flash = new THREE.PointLight(0xfff0d0, 0, 11, 1.4); mallL = new THREE.PointLight(0xfff2d8, 0, 18, 1.2); homeL = new THREE.PointLight(0xffe2b0, 0, 12, 1.2); scene.add(flash, mallL, homeL);
    mallL.position.set(World.spots.mall.x / 16, 3, World.spots.mall.y / 16); homeL.position.set(World.spots.home.x / 16, 2.4, World.spots.home.y / 16);
  }
  function palm(x, z) { const g = new THREE.Group(), th = rr(3.2, 4.6); cyl(.13, .2, th, 7, M('#6e5334'), 0, th / 2, 0, g);
    const fm = M('#4c6b34', { side: THREE.DoubleSide }); for (let i = 0; i < 11; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.42, 2.1, 1, 4), fm), pos = f.geometry.attributes.position; for (let v = 0; v < pos.count; v++) { const yy = pos.getY(v) + 1.05; pos.setZ(v, -yy * yy * .22); pos.setX(v, pos.getX(v) * (1 - yy / 2.6)); } f.geometry.computeVertexNormals(); const p = new THREE.Group(); f.position.y = 1.05; f.rotation.x = rr(.9, 1.35); p.add(f); p.rotation.y = i * 6.283 / 11 + rr(-.2, .2); p.position.y = th; f.castShadow = true; g.add(p); }
    g.position.set(x, 0, z); g.rotation.z = rr(-.06, .06); scene.add(g); }
  function tree(x, z) { const g = new THREE.Group(); cyl(.1, .16, 1.8, 6, M('#5a4630'), 0, .9, 0, g); for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(.6, 1), 1), M(['#5b7340', '#6c8249', '#4d6436'][i % 3])); s.position.set(rr(-.6, .6), rr(1.9, 2.8), rr(-.6, .6)); s.castShadow = true; g.add(s); } g.position.set(x, 0, z); scene.add(g); }
  function pole(x, z, lamp) { const g = new THREE.Group(), m = M('#4f4f4c'); box(.1, 4.2, .1, m, 0, 2.1, 0, g); if (lamp) { box(.9, .06, .08, m, .45, 4.2, 0, g); const l = box(.34, .07, .16, new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffe9c0', emissiveIntensity: 0 }), .85, 4.15, 0, g, true); lamps.push({ mesh: l, x: x + .85, z }); } else box(1, .08, .08, M('#5a4630'), 0, 3.9, 0, g); g.position.set(x, 0, z); scene.add(g); }
  function wheel(g, x, z, r = .2) { const w = cyl(r, r, .14, 10, M('#151515'), x, r, z, g); w.rotation.x = Math.PI / 2; }
  function car(type, armor, wreck) {
    const g = new THREE.Group(), cols = { kia: '#d9d8d2', saipa: '#c9a02a', stuta: '#2d5f8f', truck: '#55683a', bike: '#a8322a' }, c = new THREE.Color(cols[type] || '#999999'); if (wreck) c.lerp(new THREE.Color('#6b4a30'), .55);
    const bm = new THREE.MeshStandardMaterial({ color: c, roughness: wreck ? 1 : .5, metalness: wreck ? 0 : .3 }), glass = wreck ? bm : M('#27333b', { roughness: .25 });
    if (type === 'bike') { wheel(g, -.42, 0, .24); wheel(g, .42, 0, .24); box(.8, .05, .05, bm, 0, .42, 0, g); box(.05, .4, .05, bm, .38, .55, 0, g); box(.05, .05, .4, M('#333333'), .38, .75, 0, g); box(.22, .05, .12, M('#222222'), -.2, .6, 0, g); return g; }
    if (type === 'stuta') { wheel(g, .75, 0, .22); wheel(g, -.55, -.42, .2); wheel(g, -.55, .42, .2); box(1.1, .1, .85, bm, -.45, .42, 0, g); for (const s of [-.42, .42]) box(1.1, .3, .05, bm, -.45, .6, s, g); box(.05, .3, .85, bm, -1, .6, 0, g); box(.05, .5, .85, bm, .1, .7, 0, g); box(.5, .25, .25, M('#2a4a8a'), .45, .55, 0, g); box(.3, .08, .2, M('#222222'), .25, .68, 0, g); box(.05, .4, .5, M('#444444'), .7, .7, 0, g); return g; }
    const L = type === 'truck' ? 2.9 : type === 'kia' ? 2.3 : 1.95, Wd = type === 'truck' ? 1.1 : .95, hh = type === 'truck' ? .75 : .38;
    box(L, hh, Wd, bm, 0, .22 + hh / 2, 0, g);
    if (type === 'kia') { box(.75, .5, Wd * .96, bm, L / 2 - .5, .85, 0, g); box(.5, .3, Wd * .9, glass, L / 2 - .3, .9, 0, g); box(L - .95, .22, Wd * .9, M('#6d7175'), -.42, .68, 0, g); }
    else if (type === 'truck') { box(.7, .3, Wd * .9, glass, L / 2 - .5, 1.05, 0, g); box(.6, .3, .6, bm, -.2, 1.25, 0, g); box(.6, .06, .06, M('#222222'), .2, 1.3, 0, g); wheel(g, 0, -Wd / 2, .26); wheel(g, 0, Wd / 2, .26); }
    else { box(L * .5, .34, Wd * .9, glass, -.05, .76, 0, g); if (type === 'saipa' && !wreck) box(.3, .1, .14, M('#e3b62f', { emissive: '#e3b62f', emissiveIntensity: .3 }), -.05, .98, 0, g); }
    const r = type === 'truck' ? .26 : .2; for (const sx of [-L / 2 + .4, L / 2 - .4]) for (const sz of [-Wd / 2, Wd / 2]) wheel(g, sx, sz, r);
    if (armor) { box(.12, hh + .2, Wd + .1, M('#6f7480', { metalness: .5, roughness: .5 }), L / 2 + .04, .3 + hh / 2, 0, g); for (const s of [-1, 1]) box(L * .7, .2, .05, M('#6f7480', { metalness: .5, roughness: .5 }), 0, .55, s * (Wd / 2 + .03), g); }
    return g;
  }

  // ------------------------------------------------------------ characters (procedural; replaced by GLB models when supplied)
  // ------------------------------------------------------------ GLB characters (auto-rigged in code)
  const MODELS = {}, MODEL_H = 1.15;
  async function loadModel(key) {
    if (MODELS[key] !== undefined || !THREE.GLTFLoader) return; MODELS[key] = null;
    try {
      let buf = null;
      if (window.ibra && window.ibra.model) { const b = await window.ibra.model(key); if (b) buf = b.buffer ? b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) : b; }
      else { const r = await fetch('models/' + key + '.glb'); if (r.ok) buf = await r.arrayBuffer(); }
      if (!buf) return;
      const gltf = await new Promise((res, rej) => new THREE.GLTFLoader().parse(buf, '', res, rej));
      let mesh = null; gltf.scene.updateMatrixWorld(true); gltf.scene.traverse(o => { if (o.isMesh && !mesh) mesh = o; }); if (!mesh) return;
      const geo = mesh.geometry.clone(); geo.applyMatrix4(mesh.matrixWorld); geo.computeBoundingBox();
      const bb = geo.boundingBox, h = bb.max.y - bb.min.y, k = MODEL_H / h; geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); geo.scale(k, k, k);
      if (MODEL_FLIP[key]) geo.rotateY(Math.PI);
      const H = MODEL_H, hipY = .52 * H, shY = .80 * H, shX = .115 * H, armTop = .86 * H, armBot = .40 * H, pos = geo.attributes.position, n = pos.count;
      const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      // bones: 0 root, 1 hips, 2 legL(+x), 3 legR(-x), 4 spine, 5 armL(+x), 6 armR(-x)
      for (let i = 0; i < n; i++) {
        const x = pos.getX(i), y = pos.getY(i), w = new Float32Array(7);
        const arm = ss(shX * .82, shX * 1.12, Math.abs(x)) * (y > armBot && y < armTop ? 1 : 0), leg = 1 - ss(hipY - .08 * H, hipY + .02 * H, y), side = x >= 0;
        if (arm > 0) { w[side ? 5 : 6] = arm; w[4] = 1 - arm; }
        else if (leg > 0) { const c = ss(0, .035 * H, Math.abs(x)); w[side ? 2 : 3] = leg * (.5 + .5 * c); w[side ? 3 : 2] = leg * (.5 - .5 * c); w[1] = 1 - leg; }
        else { const sp = ss(hipY, hipY + .1 * H, y); w[4] = sp; w[1] = 1 - sp; }
        const idx = [...w.keys()].sort((a, b) => w[b] - w[a]).slice(0, 4); let tot = 0; for (const j of idx) tot += w[j];
        idx.forEach((j, q) => { si[i * 4 + q] = j; sw[i * 4 + q] = tot ? w[j] / tot : (q ? 0 : 1); });
      }
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
      const mat = mesh.material; mat.side = THREE.FrontSide;
      MODELS[key] = { geo, mat, joints: [[0, 0, 0, -1], [0, hipY, 0, 0], [shX * .55, hipY - .02 * H, 0, 1], [-shX * .55, hipY - .02 * H, 0, 1], [0, hipY + .12 * H, 0, 1], [shX, shY, 0, 4], [-shX, shY, 0, 4]], hand: [.2 * H, .44 * H] };
      for (const [k2, f] of figs) if (f.o && f.o.model === key) { scene.remove(f.g); figs.delete(k2); }
    } catch (e) { console.error('model ' + key, e); }
  }
  const MODEL_FLIP = {};
  function mkModelFig(o) {
    const T = MODELS[o.model], g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const bones = T.joints.map(() => new THREE.Bone());
    T.joints.forEach((j, i) => { const p = j[3]; if (p < 0) bones[i].position.set(j[0], j[1], j[2]); else { const q = T.joints[p]; bones[i].position.set(j[0] - q[0], j[1] - q[1], j[2] - q[2]); bones[p].add(bones[i]); } });
    const sm = new THREE.SkinnedMesh(T.geo, T.mat); sm.add(bones[0]); bones[0].updateMatrixWorld(true); sm.bind(new THREE.Skeleton(bones)); bones[5].rotation.z = -.24; bones[6].rotation.z = .24; sm.castShadow = true; sm.receiveShadow = true; sm.frustumCulled = false; body.add(sm);
    const wep = new THREE.Group(); wep.position.set(T.hand[0] - T.joints[5][0], T.hand[1] - T.joints[5][1], .05); bones[5].add(wep);
    return { g, body, legs: [bones[2], bones[3]], arms: [bones[6], bones[5]], wep, ph: rnd() * 6, ang: 0, lx: null, lz: null, o, model: true };
  }
  function mkFig(o) {
    if (o.model && MODELS[o.model]) return mkModelFig(o);
    if (o.model) loadModel(o.model);
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const s = o.fat ? 1.3 : 1, sm = M(o.skin || '#c99870'), cm = M(o.robe || o.shirt || '#3b6ea5'), pm = M(o.pants || '#2c2f36'), hm = M(o.hair || '#1b1410');
    const legs = [], arms = []; for (const sx of [-.085, .085]) { const p = new THREE.Group(); p.position.set(sx * s, .44, 0); box(.14 * s, .44, .16, o.robe ? cm : pm, 0, -.22, 0, p); box(.15 * s, .07, .22, M('#1c1c1c'), 0, -.42, .03, p); legs.push(p); body.add(p); }
    if (o.robe) box(.4 * s, .72, .26 * s, cm, 0, .5, 0, body); else box(.38 * s, .44, .22 * s, cm, 0, .65, 0, body);
    if (o.vest) box(.4 * s, .3, .24 * s, M(o.vest), 0, .68, 0, body);
    for (const sx of [-1, 1]) { const p = new THREE.Group(); p.position.set(sx * .25 * s, .85, 0); box(.1, .3, .12, cm, 0, -.15, 0, p); box(.09, .14, .1, sm, 0, -.36, 0, p); arms.push(p); body.add(p); }
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.135, 12, 9), sm); hd.position.y = 1.0; hd.castShadow = true; body.add(hd);
    if (o.hat === 'hijab' || o.hat === 'shemagh') { const c = new THREE.Mesh(new THREE.SphereGeometry(.165, 12, 9), M(o.hatc)); c.position.set(0, 1.01, -.035); c.castShadow = true; body.add(c); box(.3, .2, .12, M(o.hatc), 0, .84, -.1, body); if (o.hat === 'shemagh') { const a = cyl(.15, .15, .03, 12, M('#111111'), 0, 1.1, -.01, body); a.castShadow = false; } }
    else if (o.hat === 'cap') { cyl(.14, .14, .08, 12, M(o.hatc), 0, 1.11, 0, body); box(.2, .02, .14, M(o.hatc), 0, 1.08, .15, body); }
    else if (o.hat === 'helmet') { const c = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 6, 0, 6.3, 0, 1.6), M(o.hatc)); c.position.y = 1.03; c.castShadow = true; body.add(c); }
    else if (!o.bald) { const c = new THREE.Mesh(new THREE.SphereGeometry(.142, 12, 6, 0, 6.3, 0, 1.5), hm); c.position.set(0, 1.01, -.012); body.add(c); }
    if (o.beard) box(.16, .09, .06, hm, 0, .92, .1, body, true); if (o.stache) box(.12, .03, .04, hm, 0, .96, .125, body, true);
    if (o.bag) box(.16, .22, .1, M('#f1f1f1'), .3 * s, .45, .25, body);
    const wep = new THREE.Group(); wep.position.set(.26, .62, .12); body.add(wep);
    if (o.z) for (const a of arms) a.rotation.x = -1.35;
    return { g, body, legs, arms, wep, ph: rnd() * 6, ang: 0, lx: null, lz: null, o };
  }
  function mkCat() { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const m = M('#e39a3b'); box(.14, .13, .34, m, 0, .17, 0, body); box(.13, .12, .12, m, 0, .27, .2, body); box(.03, .05, .03, m, -.04, .35, .2, body); box(.03, .05, .03, m, .04, .35, .2, body); const tl = box(.03, .22, .03, m, 0, .3, -.2, body); const legs = []; for (const [x, z] of [[-.05, .12], [.05, .12], [-.05, -.12], [.05, -.12]]) { const p = new THREE.Group(); p.position.set(x, .12, z); box(.04, .12, .04, m, 0, -.06, 0, p); body.add(p); legs.push(p); } return { g, body, legs, arms: [], wep: new THREE.Group(), ph: 0, ang: 0, lx: null, lz: null, o: {}, tail: tl }; }
  const WEP = { pipe: [.6, '#aab0b6'], wrench: [.6, '#7c2d2d'], cleaver: [.35, '#d0d5da'], bat: [.7, '#7a5a36'], pistol: [.22, '#222222'], rifle: [.7, '#3a2c1c'] };
  function setWep(f, id) { if (f.wepId === id) return; f.wepId = id; while (f.wep.children.length) f.wep.remove(f.wep.children[0]); const w = WEP[id]; if (!w) return; box(.06, .06, w[0], new THREE.MeshStandardMaterial({ color: w[1], metalness: .5, roughness: .5 }), 0, 0, w[0] / 2, f.wep); if (id === 'cleaver') box(.02, .16, .2, M('#d0d5da', { metalness: .6 }), 0, .05, .3, f.wep); if (id === 'bat') box(.2, .03, .24, M('#8a9096', { metalness: .5 }), 0, 0, .75, f.wep); }
  function upd(key, mk, x, y, dt, st) {
    let f = figs.get(key); if (!f) { f = mk(); figs.set(key, f); scene.add(f.g); }
    f.used = true; const X = x / 16, Z = y / 16; let moving = false;
    if (f.lx != null) { const dx = X - f.lx, dz = Z - f.lz, d = Math.hypot(dx, dz); if (d > .0015 && d < 2) { moving = true; if (st.face == null) f.tAng = Math.atan2(dx, dz); f.spd = d / Math.max(dt, .001); } }
    if (st.face != null) f.tAng = st.face; f.lx = X; f.lz = Z;
    if (f.tAng != null) { let da = f.tAng - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += da * Math.min(1, dt * 12); }
    f.g.position.set(X, 0, Z); f.g.rotation.y = f.ang; if (st.scale) f.g.scale.setScalar(st.scale);
    f.ph += dt * (moving ? (st.z ? 5 : 10) : 0); const sw = moving ? Math.sin(f.ph) * (st.z ? .45 : .7) : 0;
    if (f.legs.length === 4) { f.legs[0].rotation.x = sw; f.legs[3].rotation.x = sw; f.legs[1].rotation.x = -sw; f.legs[2].rotation.x = -sw; if (f.tail) f.tail.rotation.z = Math.sin(t * 3) * .3; }
    else { f.legs[0].rotation.x = sw; f.legs[1].rotation.x = -sw;
      if (st.z) { f.arms[0].rotation.x = -1.35 + Math.sin(f.ph * .7) * .12; f.arms[1].rotation.x = -1.35 - Math.sin(f.ph * .7) * .12; f.body.rotation.z = Math.sin(f.ph * .5) * .16; }
      else { f.arms[0].rotation.x = -sw * .7; f.arms[1].rotation.x = st.swing ? -1.6 + st.swing * 9 : sw * .7; } }
    if (st.fall) { f.body.rotation.x = -1.5; f.body.position.set(0, .16, .5); } else { f.body.rotation.x = 0; f.body.position.set(0, 0, 0); }
    f.g.visible = !st.hide; return f;
  }

  // ------------------------------------------------------------ lighting by time of day
  const cA = new THREE.Color(), cB = new THREE.Color(), lerpC = (a, b, k) => cA.set(a).lerp(cB.set(b), k).clone();
  function setTime(h, st) {
    const day = h >= 5.5 && h <= 18.5, ph = day ? (h - 5.5) / 13 : ((h < 5.5 ? h + 24 : h) - 18.5) / 11, el = Math.sin(ph * Math.PI) * (day ? 1.15 : .7) + .06, az = -1.9 + ph * 2.6, low = Math.max(0, 1 - el / .55);
    const edge = Math.min(1, Math.min(Math.abs(h - 5.5), Math.abs(h - 18.5)) / 1.1);
    sun.color.copy(day ? lerpC('#fff4e0', '#ff9a4a', low * low) : new THREE.Color('#7d93c8')); sun.intensity = (day ? 2.6 - low * .9 : .22) * (day ? Math.max(.12, edge) : 1);
    const d = 90; sun.position.set(tgt.x + Math.cos(az) * Math.cos(el) * d, Math.sin(el) * d, tgt.z + Math.sin(az) * Math.cos(el) * d - 20 * Math.cos(el)); sun.target.position.copy(tgt);
    const s = view * 2.6 + 12, c = sun.shadow.camera; c.left = -s; c.right = s; c.top = s; c.bottom = -s; c.near = 1; c.far = 260; c.updateProjectionMatrix();
    hemi.intensity = day ? .32 + .3 * edge : .17; hemi.color.copy(day ? lerpC('#c4d6ea', '#e6a67a', low * low) : new THREE.Color('#33427a')); hemi.groundColor.set(day ? '#8a7a5a' : '#0c0e1a');
    scene.background = day ? lerpC('#2a2620', '#1c1410', low) : new THREE.Color('#04050a'); renderer.toneMappingExposure = day ? 1.02 : 1;
    const on = !day || edge < .35, near = on ? lamps.slice().sort((a, b) => Math.hypot(a.x - tgt.x, a.z - tgt.z) - Math.hypot(b.x - tgt.x, b.z - tgt.z)) : [];
    if (st.lampsOn !== on) { st.lampsOn = on; lamps.forEach(l => l.mesh.material.emissiveIntensity = on ? 3 : 0); }
    lampLights.forEach((l, i) => { const p = near[i]; if (!p) { l.intensity = 0; return; } l.intensity = 34; l.position.set(p.x, 4.1, p.z); l.target.position.set(p.x + .2, 0, p.z + .3); });
    return on;
  }
  const lst = {};

  // ------------------------------------------------------------ per-frame
  function frame(G, R, play, LOOK, zlookOf, dt) {
    t += dt; view = 33 / R.cam.z; tgt.set(R.cam.x / 16 + (R.shake > 0 ? (Math.random() - .5) * .15 : 0), 0, R.cam.y / 16);
    const a = innerWidth / innerHeight; cam.left = -view * a; cam.right = view * a; cam.top = view; cam.bottom = -view; cam.updateProjectionMatrix();
    cam.position.set(tgt.x + Math.sin(YAW) * Math.cos(PITCH) * 160, Math.sin(PITCH) * 160, tgt.z + Math.cos(YAW) * Math.cos(PITCH) * 160); cam.lookAt(tgt); cam.updateMatrixWorld();
    const pb = play ? (R.pb || 0) : 0, see = e => { const b = World.bAt(e.x >> 4, e.y >> 4); return b === 0 || b === pb; };
    const fl = play ? (G.floor || 0) : 0;
    for (let i = 0; i < bld.length; i++) { const ins = i + 1 === pb, e = bld[i]; e.shell.visible = !ins; e.inside.visible = ins; if (e.fl) for (let f = 0; f < 3; f++) e.fl[f].visible = f === fl; }
    bridgeG.visible = play && !!G.links.mp; for (const p of pads) p.g.visible = play && !!G.links[p.k] && fl === 0 && (p.b === 0 || p.b === pb);
    for (const k in gates) gates[k].visible = !World.gates[k].open;
    for (const f of figs.values()) f.used = false;
    for (const z of R.act) upd(z, () => mkFig(z.look), z.x, z.y, dt, { z: 1, fall: z.fall > 0, hide: !see(z), scale: z.type === 'boss' ? 2 : 0 });
    if (play) {
      for (const b of (R.bodies || [])) upd(b, () => mkFig(b.look), b.x, b.y, dt, { z: 1, fall: true, hide: !see(b) || fl > 0 });
      for (const d of (R.defs || [])) { const f = upd(d, () => mkFig(d.look), d.x, d.y, dt, { hide: !see(d) || fl > 0, face: d.face }); setWep(f, d.kind === 'soldier' ? 'rifle' : 'pipe'); }
      for (const n of R.npcs) upd(n, () => n.id === 'cat' ? mkCat() : mkFig(LOOK[n.id]), n.x, n.y, dt, { hide: n.hidden || !see(n) || fl > 0 });
      const pf = upd(G, () => mkFig(LOOK.player), G.x, G.y, dt, { hide: G.inVeh >= 0 || (R.inv > 0 && Math.floor(t * 20) % 2 === 1), face: (R.atk > 0 || R.mouse.t > 0) ? Math.PI / 2 - R.aim : null, swing: R.swing > 0 ? R.swing : 0 }); setWep(pf, G.cur);
      G.veh.forEach((v, i) => { const key = v.t + (v.up.armor ? 1 : 0); let o = vehs[i]; if (!o || o.key !== key) { if (o) scene.remove(o.g); o = vehs[i] = { key, g: car(v.t, v.up.armor) }; scene.add(o.g); } o.g.visible = !v.gone; o.g.position.set(v.x / 16, 0, v.y / 16); o.g.rotation.y = -v.a; });
      for (const p of picks) { p.g.visible = !G.taken[p.p.id] && (!p.p.b || p.p.b === pb); p.g.position.y = .45 + Math.sin(t * 3 + p.p.x) * .08; p.g.rotation.y = t * 1.5; }
    } else { for (const v of vehs) if (v) v.g.visible = false; for (const p of picks) p.g.visible = false; }
    // cinematic extras (intro time-lapse): civilians and moving cars
    wreckG.visible = !R.lapse;
    for (const o of xcars.values()) o.used = false;
    if (R.lapse) { for (const e of R.lapse.civ) upd(e, () => mkFig(e.look), e.x, e.y, dt, { z: e.z, fall: e.fall > 0, hide: e.hide });
      for (const c of R.lapse.cars) { let o = xcars.get(c); if (!o) { o = { g: car(c.t, 0, false) }; if (c.col) o.g.children[0].material = new THREE.MeshStandardMaterial({ color: c.col, roughness: .5, metalness: .3 }); xcars.set(c, o); scene.add(o.g); } o.used = true; o.g.visible = !c.hide; o.g.position.set(c.x / 16, 0, c.y / 16); o.g.rotation.y = -c.a; } }
    for (const [k, o] of xcars) if (!o.used) { scene.remove(o.g); xcars.delete(k); }
    for (const [k, f] of figs) if (!f.used) { scene.remove(f.g); figs.delete(k); }
    beam.visible = play && !!R.objT && Math.hypot(R.objT.x - G.x, R.objT.y - G.y) > 40; if (beam.visible) { beam.position.set(R.objT.x / 16, 8, R.objT.y / 16); beam.material.opacity = .22 + Math.sin(t * 4) * .1; }
    const night = setTime(G.time % 24, lst);
    flash.intensity = play && night ? (G.inVeh >= 0 ? 2.2 : 1.5) : 0; flash.distance = G.inVeh >= 0 ? 15 : 10; flash.position.set(G.x / 16, 1.6, G.y / 16);
    mallL.intensity = play && night && G.flags.gen ? 1.6 : 0; homeL.intensity = play && night && G.shel.gen ? 1.3 : 0;
    if (!window.__noRender) renderer.render(scene, cam);
  }
  const v3 = new THREE.Vector3();
  function project(x, y, h) { v3.set(x / 16, h || 0, y / 16).project(cam); return { x: (v3.x + 1) / 2 * innerWidth, y: (1 - v3.y) / 2 * innerHeight }; }
  function pick(mx, my) { // screen px -> point on the ground plane, in game px
    v3.set(mx / innerWidth * 2 - 1, 1 - my / innerHeight * 2, -1).unproject(cam); const d = cam.getWorldDirection(new THREE.Vector3()), k = -v3.y / d.y; return { x: (v3.x + d.x * k) * 16, y: (v3.z + d.z * k) * 16 };
  }
  // screen-space input (right, down) -> world direction
  // camera turns to stay behind the heading (h = atan2(dx, dz)); walking toward the camera does not flip it
  function follow(h, dt, rate) { let d = h + Math.PI - YAW; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > 2.2) return; const m = rate * dt; YAW += Math.max(-m, Math.min(m, d * Math.min(1, dt * 3) * 1.4)); }
  const resetYaw = () => { YAW = 0.62; };
  const toWorld = (ix, iy) => window.__flat ? [ix, iy] : [ix * Math.cos(YAW) + iy * Math.sin(YAW), -ix * Math.sin(YAW) + iy * Math.cos(YAW)];
  return { init, build, resize, frame, project, pick, toWorld, follow, resetYaw };
})();
