// IBRA ZOMBIE - world generation: Baghdad in tiles
// zones (by x): 0 Baghdad Jadida | 1 Market | 2 Karrada | 3 Mutanabbi | (river) | 4 East bank
const World = (() => {
  const W = 224, H = 112, N = W * H;
  const tiles = new Uint8Array(N), wst = new Uint8Array(N), block = new Uint8Array(N), bidx = new Int16Array(N), safe = new Uint8Array(N), keep = new Uint8Array(N);
  const I = (x, y) => y * W + x, World_I = I;
  // 0 dirt 1 road 2 walk 3 floor 4 wall 5 water 6 bridge 7 barrier 8 grass 9 shopfloor 10 fence 11 gate 12 door 13 locked
  const SOL = [0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1];
  const buildings = [], containers = [], props = [], inner = [], wires = [], pickups = [], spots = {}, locks = {}, gates = {};
  let ground, gg, rnd;
  const sp = (tx, ty) => ({ x: tx * 16 + 8, y: ty * 16 + 8 });
  const ZX = [[1, 55], [57, 103], [105, 149], [151, 176], [188, 222]];
  const zoneOf = tx => tx < 56 ? 0 : tx < 104 ? 1 : tx < 150 ? 2 : tx < 178 ? 3 : 4;
  const solid = (tx, ty) => tx < 0 || ty < 0 || tx >= W || ty >= H || SOL[tiles[ty * W + tx]] === 1 || block[ty * W + tx] === 1;
  const bAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= W || ty >= H) ? 0 : bidx[ty * W + tx];
  const VROADS = [12, 34, 70, 88, 116, 136, 162, 204];
  const XINT = [[1, 11], [14, 33], [36, 55], [57, 69], [72, 87], [90, 103], [105, 115], [118, 135], [138, 149], [151, 161], [164, 176]];
  const GX = { g1: 56, g2: 104, g3: 150, g4: 177 };
  const kp = (tx, ty, r = 1) => { for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) if (x >= 0 && y >= 0 && x < W && y < H) keep[I(x, y)] = 1; };

  function addB(x, y, w, h, door, type, st, dx) {
    const b = { i: buildings.length, x, y, w, h, door, type, st, seed: x * 131 + y * 17 };
    const shopf = type === 'shop' || type === 'mall' || type === 'pharmacy' || type === 'warehouse' || type === 'butcher';
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      const edge = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1;
      tiles[I(xx, yy)] = edge ? 4 : (shopf ? 9 : 3); wst[I(xx, yy)] = st; bidx[I(xx, yy)] = b.i + 1; block[I(xx, yy)] = 0;
    }
    b.dx = dx != null ? dx : x + (w >> 1); b.dy = door === 'S' ? y + h - 1 : y;
    b.dw = (type === 'mall' || type === 'warehouse') ? 2 : 1;
    for (let i = 0; i < b.dw; i++) { tiles[I(b.dx + i, b.dy)] = 12; kp(b.dx + i, b.dy + (door === 'S' ? 1 : -1), 1); }
    buildings.push(b); return b;
  }
  function cont(b, kind, tx, ty, fixed) {
    const c = { id: containers.length, x: tx * 16 + 8, y: ty * 16 + 8, kind, zone: zoneOf(tx), b: b ? b.i + 1 : 0, fixed: fixed || null };
    containers.push(c); block[I(tx, ty)] = 1; return c;
  }
  function inn(b, k, tx, ty, oy = 0, solidT = true) { inner.push({ k, x: tx * 16 + 8, y: ty * 16 + 8 + oy, b: b.i + 1 }); if (solidT) block[I(tx, ty)] = 1; }
  function safeB(b) { for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) safe[I(x, y)] = 1; }
  function overlaps(x, y, w, h) { for (const b of buildings) if (x < b.x + b.w + 1 && x + w + 1 > b.x && y < b.y + b.h + 1 && y + h + 1 > b.y) return true; return false; }
  function furnish(b) {
    const y = b.door === 'S' ? b.y + 1 : b.y + b.h - 2, xs = [];
    for (let x = b.x + 1; x <= b.x + b.w - 2; x++) xs.push(x);
    const shop = b.type === 'shop', n = shop ? 2 + (rnd() < .5 ? 1 : 0) : 1 + (rnd() < .75 ? 1 : 0) + (rnd() < .25 ? 1 : 0);
    for (let i = 0; i < n && xs.length; i++) {
      const x = xs.splice((rnd() * xs.length) | 0, 1)[0];
      cont(b, shop ? (rnd() < .8 ? 'shelf' : 'crate') : (i === 0 ? 'fridge' : ['cupboard', 'cupboard', 'crate'][(rnd() * 3) | 0]), x, y);
    }
    if (!shop && rnd() < .65) { const bx = b.x + 1 + ((rnd() * (b.w - 2)) | 0), by = b.door === 'S' ? b.y + b.h - 3 : b.y + 2; if (!block[I(bx, by)] && bx !== b.dx) inner.push({ k: 'bed', x: bx * 16 + 8, y: by * 16 + 14, b: b.i + 1 }); }
  }
  function fillRow(x0, x1, yEdge, door, zone, mainF) {
    let x = x0;
    for (;;) {
      let w = 7 + (rnd() * 3 | 0); const h = 6 + (rnd() * 3 | 0);
      if (x + w - 1 > x1) w = x1 - x + 1;
      if (w < 6) break;
      const y = door === 'S' ? yEdge - h + 1 : yEdge;
      if (overlaps(x, y, w, h)) { x++; continue; }
      const type = ((zone === 1 || zone === 2) && mainF) ? 'shop' : (zone === 3 && mainF && rnd() < .6 ? 'shop' : (zone === 1 && rnd() < .3 ? 'shop' : 'house'));
      const st = zone === 0 ? [0, 1, 7, 0][(rnd() * 4) | 0] : zone === 1 ? [2, 1, 0][(rnd() * 3) | 0] : zone === 2 ? [1, 2, 1][(rnd() * 3) | 0] : 3;
      furnish(addB(x, y, w, h, door, type, st));
      x += w + (rnd() < .5 ? 1 : 2);
    }
  }

  function gen() {
    rnd = Art.R(20261112);
    tiles.fill(0); wst.fill(0); block.fill(0); bidx.fill(0); safe.fill(0); keep.fill(0);
    buildings.length = containers.length = props.length = inner.length = wires.length = pickups.length = 0;
    for (let i = 0; i < 300; i++) { const x = 2 + (rnd() * (W - 4) | 0), y = 2 + (rnd() * (H - 4) | 0); for (let j = 0; j < 6; j++) { const xx = x + (rnd() * 3 | 0) - 1, yy = y + (rnd() * 3 | 0) - 1; tiles[I(xx, yy)] = 8; } }
    const road = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[I(x, y)] = 1; };
    road(1, 54, W - 2, 57); road(1, 20, 176, 21); road(1, 90, 176, 91); road(188, 20, W - 2, 21); road(188, 90, W - 2, 91);
    for (const vx of VROADS) road(vx, 1, vx + 1, H - 2);
    const tmp = tiles.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (tmp[I(x, y)] === 1) continue; let adj = false;
      for (let dy = -1; dy <= 1 && !adj; dy++) for (let dx = -1; dx <= 1; dx++) if (tmp[I(x + dx, y + dy)] === 1) { adj = true; break; }
      if (adj) tiles[I(x, y)] = 2;
    }
    for (let y = 0; y < H; y++) for (let x = 178; x <= 187; x++) tiles[I(x, y)] = (y >= 54 && y <= 57) ? 6 : 5;
    for (let x = 0; x < W; x++) { tiles[I(x, 0)] = 7; tiles[I(x, H - 1)] = 7; }
    for (let y = 0; y < H; y++) {
      tiles[I(0, y)] = 7; tiles[I(W - 1, y)] = 7;
      for (const k in GX) tiles[I(GX[k], y)] = (y >= 54 && y <= 57) ? 11 : 7;
    }
    for (const k in GX) { gates[k] = { x: GX[k], open: false }; spots[k] = { x: GX[k] * 16 + 8, y: 56 * 16 }; kp(GX[k], 55, 4); kp(GX[k], 56, 4); }

    // ---- special buildings
    let b = addB(16, 45, 9, 8, 'S', 'home', 0); safeB(b); spots.home = sp(20, 49); spots.homeDoor = sp(20, 53);
    inn(b, 'bed', 17, 46, 6); spots.homeBed = { x: 17 * 16 + 8, y: 46 * 16 + 14 }; spots.start = sp(18, 47);
    cont(b, 'fridge', 22, 46, 'homefridge'); cont(b, 'cupboard', 23, 49, 'homecup');
    inn(b, 'bench', 20, 46); spots.homeBench = sp(20, 46);
    b = addB(74, 46, 8, 7, 'S', 'butcher', 2); cont(b, 'shelf', 80, 47); pickups.push({ id: 'cleaver', w: 'cleaver', x: 76 * 16 + 8, y: 48 * 16 + 8, b: b.i + 1 });
    b = addB(97, 48, 5, 5, 'S', 'booth', 2); spots.booth = cont(b, 'desk', 98, 49, 'gatekey');
    b = addB(119, 36, 16, 17, 'S', 'mall', 4, 126); safeB(b); spots.mall = sp(126, 45); spots.mallDoor = sp(126, 53);
    inn(b, 'bed', 121, 37, 6); inn(b, 'bed', 123, 37, 6); spots.mallBed = { x: 122 * 16 + 8, y: 37 * 16 + 14 };
    inn(b, 'radio', 127, 37); spots.radio = sp(127, 37);
    inn(b, 'stairs', 133, 43); inner[inner.length - 1].all = 1; spots.stairs = sp(133, 43);
    { const F1 = [], F2 = []; for (const x of [121, 123, 125, 127, 129]) { F1.push({ k: 'bed', tx: x, ty: 38 }, { k: 'bed', tx: x, ty: 47 }); } F1.push({ k: 'locker', tx: 131, ty: 37 }, { k: 'locker', tx: 132, ty: 37 }, { k: 'cupboard', tx: 131, ty: 50 });
      for (const y of [39, 42]) for (const x of [121, 122, 123, 124]) F2.push({ k: 'shelf', tx: x, ty: y }); F2.push({ k: 'crate', tx: 121, ty: 46 }, { k: 'crate', tx: 122, ty: 46 }, { k: 'crate', tx: 121, ty: 48 }, { k: 'locker', tx: 124, ty: 47, stash: 1 }, { k: 'bed', tx: 130, ty: 38, clinic: 1 }, { k: 'med', tx: 132, ty: 38 }, { k: 'desk', tx: 131, ty: 41 });
      spots._mall = { b: b.i + 1, x0: 120, y0: 37, x1: 133, y1: 51, floors: [F1, F2] }; }
    inn(b, 'desk', 124, 41); spots.board = sp(124, 41); spots.tunMall = sp(121, 50); spots.brMall = sp(123, 50); spots.tunMall2 = sp(125, 50); spots.tunHome = sp(23, 51); spots.brPharm = sp(125, 61); spots.tunArm = sp(194, 41);
    cont(b, 'shelf', 130, 37, 'mallfood'); cont(b, 'shelf', 132, 37); cont(b, 'crate', 133, 41);
    inn(b, 'bigen', 132, 50); block[I(131, 50)] = 1; spots.mallGen = sp(132, 50);
    inn(b, 'bench', 132, 46); spots.mallBench = sp(132, 46);
    spots.noor = sp(128, 43); spots.mur = sp(130, 48); spots.cat = sp(122, 46);
    b = addB(138, 35, 12, 18, 'S', 'hospital', 1, 143); b.dw = 2; tiles[World_I(144, 52)] = 12; spots.hospDoor = sp(143, 53); kp(143, 53, 2); kp(144, 53, 2);
    b = addB(120, 59, 8, 7, 'N', 'pharmacy', 1); spots.pharm = cont(b, 'med', 122, 64, 'medicine'); cont(b, 'med', 125, 64);
    b = addB(139, 59, 10, 8, 'N', 'police', 2); locks.police = { tx: 144, ty: 59, n: 1 }; spots.policeDoor = sp(144, 58);
    cont(b, 'locker', 141, 65, 'pistol'); cont(b, 'locker', 146, 65, 'policeammo'); cont(b, 'desk', 143, 65);
    pickups.push({ id: 'page2', page: 2, x: 147 * 16 + 8, y: 61 * 16 + 8, b: b.i + 1 });
    b = addB(153, 46, 8, 7, 'S', 'bookshop', 3); cont(b, 'shelf', 154, 47); cont(b, 'shelf', 159, 47); spots.book = sp(156, 49);
    // base (fenced) + armory
    for (let y = 30; y <= 52; y++) for (let x = 189; x <= 202; x++) { tiles[I(x, y)] = (x === 189 || x === 202 || y === 30 || y === 52) ? 10 : 0; keep[I(x, y)] = 1; }
    tiles[I(195, 52)] = 0; tiles[I(196, 52)] = 0; kp(195, 53, 1);
    b = addB(191, 33, 7, 6, 'S', 'armory', 5); locks.armory = { tx: 194, ty: 38, n: 1 }; spots.armoryDoor = sp(194, 39);
    cont(b, 'locker', 192, 34, 'rifle'); cont(b, 'locker', 196, 34, 'truckkey'); cont(b, 'crate', 194, 34, 'armoryammo');
    spots.sol = sp(192, 45); spots.truck = sp(198, 47);
    for (const [tx, ty] of [[199, 35], [199, 41]]) { props.push({ k: 'tent', x: tx * 16, y: ty * 16 + 14, v: 0 }); block[I(tx - 1, ty)] = 1; block[I(tx, ty)] = 1; }
    props.push({ k: 'barrel', x: 191 * 16 + 8, y: 50 * 16, v: 0 }, { k: 'tires', x: 200 * 16, y: 50 * 16, v: 0 }, { k: 'barrel', x: 200 * 16 + 8, y: 45 * 16, v: 0 });
    pickups.push({ id: 'page4', page: 4, x: 200 * 16 + 8, y: 32 * 16 + 8, b: 0 });
    b = addB(207, 59, 15, 14, 'N', 'warehouse', 6, 214); locks.warehouse = { tx: 214, ty: 59, n: 2 }; spots.wareDoor = sp(214, 58); spots.boss = { x: 214 * 16 + 16, y: 56 * 16 };
    inn(b, 'pepsi', 214, 67); spots.pepsi = sp(214, 67);
    for (const [tx, ty] of [[209, 70], [219, 70], [209, 61], [219, 61]]) cont(b, 'crate', tx, ty);
    for (const k in locks) { const l = locks[k]; for (let i = 0; i < l.n; i++) tiles[I(l.tx + i, l.ty)] = 13; l.open = false; }

    // ---- generic blocks
    for (const [xa, xb] of XINT) {
      const zone = zoneOf(xa), x0 = xa + 1, x1 = xb - 1;
      fillRow(x0, x1, 18, 'S', zone, false);
      fillRow(x0, x1, 23, 'N', zone, false); fillRow(x0, x1, 52, 'S', zone, true);
      fillRow(x0, x1, 59, 'N', zone, true); fillRow(x0, x1, 88, 'S', zone, false);
      fillRow(x0, x1, 93, 'N', zone, false);
    }

    // ---- spots on streets
    Object.assign(spots, {
      pipe: sp(23, 53), hassan: sp(18, 53), bike: { x: 28 * 16, y: 55 * 16 + 8 }, aj: sp(52, 53), kia: { x: 50 * 16, y: 55 * 16 },
      fuelWreck: { x: 43 * 16, y: 54 * 16 + 8 }, stuta: { x: 64 * 16, y: 56 * 16 + 8 }, haji: sp(84, 53), saif: sp(110, 58), umali: sp(30, 53),
      saipa: { x: 131 * 16, y: 54 * 16 + 10 }, jeep: { x: 113 * 16, y: 55 * 16 + 8 }, saipa2: { x: 66 * 16, y: 54 * 16 + 10 }, sedan: { x: 146 * 16, y: 54 * 16 + 10 }, colonel: sp(144, 56), cops: sp(101, 55), shovel: sp(108, 53)
    });
    for (const k of ['jeep', 'saipa2', 'sedan', 'pipe', 'hassan', 'bike', 'aj', 'kia', 'fuelWreck', 'stuta', 'haji', 'saif', 'umali', 'saipa', 'colonel', 'cops', 'shovel', 'boss', 'truck', 'sol']) kp(spots[k].x >> 4, spots[k].y >> 4, 2);
    pickups.push({ id: 'pipe', w: 'pipe', x: spots.pipe.x, y: spots.pipe.y, b: 0 }, { id: 'shovel', w: 'bat', x: spots.shovel.x, y: spots.shovel.y, b: 0 });
    pickups.push({ id: 'page0', page: 0, x: 3 * 16 + 8, y: 19 * 16 + 8, b: 0 }, { id: 'page1', page: 1, x: 100 * 16 + 8, y: 92 * 16 + 8, b: 0 }, { id: 'page3', page: 3, x: 174 * 16 + 8, y: 19 * 16 + 8, b: 0 });
    props.push({ k: 'gen', x: 25 * 16 + 8, y: 53 * 16 + 12, v: 0 }); block[I(25, 53)] = 1;

    // ---- wrecks on roads
    const wreck = (tx, ty, vert, fixed) => {
      const t = ['kia', 'saipa', 'saipa', 'kia', 'stuta'][(rnd() * 5) | 0], v = 1 + ((rnd() * 5) | 0);
      const x = vert ? tx * 16 + 8 : tx * 16 + 16, y = vert ? ty * 16 + 16 : ty * 16 + 8;
      props.push({ k: 'wreck', t, v, x, y: y + 6, cx: x, cy: y, a: vert ? Math.PI / 2 : (rnd() < .5 ? 0 : Math.PI) });
      block[I(tx, ty)] = 1; block[I(vert ? tx : tx + 1, vert ? ty + 1 : ty)] = 1;
      containers.push({ id: containers.length, x, y, kind: 'trunk', zone: zoneOf(tx), b: 0, fixed: fixed || null });
    };
    wreck(42, 54, false, 'fuel');
    for (let x = 6; x < W - 6; x++) {
      if (rnd() > .05) continue; const ty = rnd() < .5 ? 54 : 57;
      if (tiles[I(x, ty)] !== 1 || tiles[I(x + 1, ty)] !== 1 || keep[I(x, ty)] || keep[I(x + 1, ty)] || block[I(x, ty)] || block[I(x - 1, ty)]) continue;
      wreck(x, ty, false); x += 4;
    }
    for (const vx of VROADS) for (let y = 4; y < H - 6; y++) {
      if (rnd() > .022 || (y > 50 && y < 61) || (y > 17 && y < 24) || (y > 87 && y < 94)) continue;
      const tx = vx + (rnd() < .5 ? 0 : 1); if (keep[I(tx, y)] || block[I(tx, y)]) continue; wreck(tx, y, true); y += 6;
    }

    // ---- poles, wires, stalls
    const poles = [];
    for (const [py, dir] of [[53, -1], [58, 1], [19, -1], [92, 1]]) for (let x = 5 + (py % 5); x < W - 3; x += 10) {
      if (tiles[I(x, py)] !== 2 || keep[I(x, py)]) continue;
      const p = { x: x * 16 + 8, y: py * 16 + 12, tx: x, row: py, dir }; poles.push(p); props.push({ k: 'pole', x: p.x, y: p.y, v: 0 });
    }
    for (let i = 0; i < poles.length; i++) {
      const p = poles[i], q = poles[i + 1];
      if (q && q.row === p.row && q.tx - p.tx === 10) wires.push([p.x, p.y - 22, q.x, q.y - 22, 6]);
      for (let j = 0; j < 3; j++) wires.push([p.x, p.y - 20, p.x + (rnd() * 150 - 75), p.y + p.dir * (40 + rnd() * 110), 4 + rnd() * 6]);
      if (p.row === 53 && rnd() < .7) wires.push([p.x, p.y - 22, p.x + (rnd() * 40 - 20), 58 * 16 + 20 + rnd() * 30, 9]);
    }
    for (const py of [53, 58]) for (let x = 58; x < 176; x++) {
      const z = zoneOf(x); if ((z !== 1 && z !== 3) || tiles[I(x, py)] !== 2 || keep[I(x, py)] || rnd() > .14) continue;
      props.push({ k: 'stall', x: x * 16 + 8, y: py * 16 + 12, v: (rnd() * 3) | 0 }); x += 2;
    }

    // ---- scatter
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      const i = I(x, y), t = tiles[i]; if ((t !== 0 && t !== 8) || bidx[i] || keep[i] || block[i]) continue;
      const r = rnd(), z = zoneOf(x), px = x * 16 + 8, py = y * 16 + 14, v = (rnd() * 6) | 0;
      if (z === 4) {
        if (r < .008 && !block[I(x - 1, y)]) { props.push({ k: 'tent', x: x * 16, y: py, v }); block[i] = 1; block[I(x - 1, y)] = 1; }
        else if (r < .03) props.push({ k: 'barrel', x: px, y: py, v }); else if (r < .045) props.push({ k: 'tires', x: px, y: py, v });
        else if (r < .06) { props.push({ k: 'palm', x: px, y: py, v }); block[i] = 1; }
      } else if (r < .024) { props.push({ k: 'palm', x: px, y: py, v }); block[i] = 1; }
      else if (r < .03) { props.push({ k: 'tree', x: px, y: py, v }); block[i] = 1; }
      else if (r < .037) { props.push({ k: 'gen', x: px, y: py, v }); block[i] = 1; for (let j = 0; j < 3; j++) wires.push([px, py - 8, px + rnd() * 160 - 80, py + rnd() * 160 - 80, 5]); }
      else if (r < .047) props.push({ k: 'trash', x: px, y: py, v });
      else if (r < .051) props.push({ k: 'tires', x: px, y: py, v });
      else if (r < .055) props.push({ k: 'barrel', x: px, y: py, v });
    }
    for (const b2 of buildings) b2.roof = null;
    renderGround();
  }

  // ---- other districts of Baghdad (each one its own map)
  function genDistrict(id, d) {
    let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; rnd = Art.R(h);
    tiles.fill(0); wst.fill(0); block.fill(0); bidx.fill(0); safe.fill(0); keep.fill(0);
    buildings.length = containers.length = props.length = inner.length = wires.length = pickups.length = 0;
    for (const k in spots) delete spots[k]; for (const k in locks) delete locks[k]; for (const k in gates) delete gates[k];
    for (let i = 0; i < 300; i++) { const x = 2 + (rnd() * (W - 4) | 0), y = 2 + (rnd() * (H - 4) | 0); for (let j = 0; j < 6; j++) tiles[I(x + (rnd() * 3 | 0) - 1, y + (rnd() * 3 | 0) - 1)] = 8; }
    const road = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[I(x, y)] = 1; };
    const rv = d.river === 'w' ? [16, 25] : d.river === 'e' ? [198, 207] : null, inRiver = x => rv && x >= rv[0] - 1 && x <= rv[1] + 1;
    const VR = [12, 36, 60, 84, 108, 132, 156, 180, 210].filter(x => !inRiver(x) && !inRiver(x + 1));
    road(1, 54, W - 2, 57); road(1, 20, W - 2, 21); road(1, 90, W - 2, 91); for (const vx of VR) road(vx, 1, vx + 1, H - 2);
    const tmp = tiles.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { if (tmp[I(x, y)] === 1) continue; let adj = false; for (let dy = -1; dy <= 1 && !adj; dy++) for (let dx = -1; dx <= 1; dx++) if (tmp[I(x + dx, y + dy)] === 1) { adj = true; break; } if (adj) tiles[I(x, y)] = 2; }
    if (rv) for (let y = 0; y < H; y++) for (let x = rv[0]; x <= rv[1]; x++) tiles[I(x, y)] = (y >= 54 && y <= 57) ? 6 : 5;
    for (let x = 0; x < W; x++) { tiles[I(x, 0)] = 7; tiles[I(x, H - 1)] = 7; } for (let y = 0; y < H; y++) { tiles[I(0, y)] = 7; tiles[I(W - 1, y)] = 7; }
    const west = d.river !== 'w', ax = west ? 4 : W - 6;
    spots.start = sp(ax, 56); spots.arrive = { x: (west ? 8 : W - 10) * 16, y: 55 * 16 + 8 }; kp(ax, 55, 4); kp(ax + (west ? 4 : -4), 55, 3);
    // colony building close to the arrival road, landmark in the middle
    const cxB = west ? 38 : W - 52; let b = addB(cxB, 40, 12, 12, 'S', 'colony', 1, cxB + 6); spots.colDoor = sp(cxB + 6, 53); spots.colony = sp(cxB + 6, 46);
    inn(b, 'bed', cxB + 2, 41, 6); inn(b, 'bed', cxB + 4, 41, 6); inn(b, 'bed', cxB + 8, 41, 6); cont(b, 'crate', cxB + 10, 42); cont(b, 'cupboard', cxB + 1, 47); spots.colBed = { x: (cxB + 2) * 16 + 8, y: 41 * 16 + 14 };
    const lx = 112 - 8; b = addB(lx, 34, 16, 18, 'S', 'landmark', d.st != null ? d.st : 1, lx + 8); b.lm = d.lm; spots.landmark = sp(lx + 8, 43); for (let y = b.y + 1; y < b.y + b.h - 1; y++) for (let x = b.x + 1; x < b.x + b.w - 1; x++) block[I(x, y)] = 1; tiles[I(b.dx, b.dy)] = 4;
    cont(null, 'crate', lx + 3, 53); cont(null, 'crate', lx + 12, 53);
    // blocks between vertical roads
    const xs = [1].concat(VR.map(v => v + 2)), xe = VR.map(v => v - 1).concat([W - 2]);
    for (let i = 0; i < xs.length; i++) { let x0 = xs[i] + 1, x1 = xe[i] - 1; if (rv) { if (x0 <= rv[1] + 1 && x1 >= rv[0] - 1) { if (x0 < rv[0] - 1) x1 = rv[0] - 2; else x0 = rv[1] + 2; } } if (x1 - x0 < 6) continue;
      const z = d.shop || 0, mainT = (yE, door, main) => { let x = x0; for (;;) { let w = 7 + (rnd() * 3 | 0); const hh = 6 + (rnd() * 3 | 0); if (x + w - 1 > x1) w = x1 - x + 1; if (w < 6) break; const y = door === 'S' ? yE - hh + 1 : yE; if (overlaps(x, y, w, hh)) { x++; continue; } const type = main && rnd() < z ? 'shop' : (rnd() < z * .3 ? 'shop' : 'house'); const st = d.styles[(rnd() * d.styles.length) | 0]; furnish(addB(x, y, w, hh, door, type, st)); x += w + (rnd() < .5 ? 1 : 2); } };
      mainT(18, 'S', false); mainT(23, 'N', false); mainT(52, 'S', true); mainT(59, 'N', true); mainT(88, 'S', false); mainT(93, 'N', false); }
    // wrecks, poles, stalls, scatter
    const wreck = (tx, ty, vert) => { const t = ['kia', 'saipa', 'saipa', 'kia', 'stuta'][(rnd() * 5) | 0], v = 1 + ((rnd() * 5) | 0), x = vert ? tx * 16 + 8 : tx * 16 + 16, y = vert ? ty * 16 + 16 : ty * 16 + 8; props.push({ k: 'wreck', t, v, x, y: y + 6, cx: x, cy: y, a: vert ? Math.PI / 2 : (rnd() < .5 ? 0 : Math.PI) }); block[I(tx, ty)] = 1; block[I(vert ? tx : tx + 1, vert ? ty + 1 : ty)] = 1; containers.push({ id: containers.length, x, y, kind: 'trunk', zone: zoneOf(tx), b: 0, fixed: null }); };
    for (let x = 10; x < W - 10; x++) { if (rnd() > .05) continue; const ty = rnd() < .5 ? 54 : 57; if (tiles[I(x, ty)] !== 1 || tiles[I(x + 1, ty)] !== 1 || keep[I(x, ty)] || keep[I(x + 1, ty)] || block[I(x, ty)] || block[I(x - 1, ty)]) continue; wreck(x, ty, false); x += 4; }
    for (const vx of VR) for (let y = 4; y < H - 6; y++) { if (rnd() > .022 || (y > 50 && y < 61) || (y > 17 && y < 24) || (y > 87 && y < 94)) continue; const tx = vx + (rnd() < .5 ? 0 : 1); if (keep[I(tx, y)] || block[I(tx, y)]) continue; wreck(tx, y, true); y += 6; }
    const poles = []; for (const [py, dir] of [[53, -1], [58, 1]]) for (let x = 5 + (py % 5); x < W - 3; x += 10) { if (tiles[I(x, py)] !== 2 || keep[I(x, py)]) continue; const pp = { x: x * 16 + 8, y: py * 16 + 12, tx: x, row: py, dir }; poles.push(pp); props.push({ k: 'pole', x: pp.x, y: pp.y, v: 0 }); }
    for (let i = 0; i < poles.length; i++) { const pp = poles[i], q = poles[i + 1]; if (q && q.row === pp.row && q.tx - pp.tx === 10) wires.push([pp.x, pp.y - 22, q.x, q.y - 22, 6]); for (let j = 0; j < 2; j++) wires.push([pp.x, pp.y - 20, pp.x + (rnd() * 150 - 75), pp.y + pp.dir * (40 + rnd() * 110), 4 + rnd() * 6]); }
    if (d.shop) for (const py of [53, 58]) for (let x = 8; x < W - 8; x++) { if (tiles[I(x, py)] !== 2 || keep[I(x, py)] || rnd() > d.shop * .2) continue; props.push({ k: 'stall', x: x * 16 + 8, y: py * 16 + 12, v: (rnd() * 3) | 0 }); x += 2; }
    const pal = d.palms || .024;
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const i = I(x, y), t = tiles[i]; if ((t !== 0 && t !== 8) || bidx[i] || keep[i] || block[i]) continue; const r = rnd(), px = x * 16 + 8, py = y * 16 + 14, v = (rnd() * 6) | 0;
      if (r < pal) { props.push({ k: 'palm', x: px, y: py, v }); block[i] = 1; } else if (r < pal + .006) { props.push({ k: 'tree', x: px, y: py, v }); block[i] = 1; } else if (r < pal + .013) { props.push({ k: 'gen', x: px, y: py, v }); block[i] = 1; } else if (r < pal + .023) props.push({ k: 'trash', x: px, y: py, v }); else if (r < pal + .027) props.push({ k: 'tires', x: px, y: py, v }); else if (r < pal + .031) props.push({ k: 'barrel', x: px, y: py, v }); }
    for (const b2 of buildings) b2.roof = null;
    renderGround();
  }
  function drawTile(x, y) {
    const t = tiles[I(x, y)], v = (x * 7 + y * 13 + ((x * y) % 5)) % 8;
    gg.drawImage(t === 4 ? Art.wall(wst[I(x, y)], v) : Art.tile(t, v), x * 16, y * 16);
    if (t === 1 && y === 56 && x % 2 === 0) Art.P(gg, '#d8d2b0', x * 16 + 3, y * 16 - 1, 9, 2);
    if (t === 1 && (y === 21 || y === 91) && x % 3 === 0) Art.P(gg, '#8d8a78', x * 16 + 4, y * 16 - 1, 6, 1);
  }
  function renderGround() {
    if (!ground) { ground = Art.mk(W * 16, H * 16); gg = ground.getContext('2d'); }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawTile(x, y);
  }
  function setGate(k, open) { const g = gates[k]; g.open = open; for (let y = 54; y <= 57; y++) { tiles[I(g.x, y)] = open ? (k === 'g4' ? 6 : 1) : 11; drawTile(g.x, y); } }
  function setLock(k, open) { const l = locks[k]; l.open = open; for (let i = 0; i < l.n; i++) { tiles[I(l.tx + i, l.ty)] = open ? 12 : 13; drawTile(l.tx + i, l.ty); } }
  function freeNear(px, py) {
    const tx = px >> 4, ty = py >> 4;
    for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = tx + dx, y = ty + dy;
      if (!solid(x, y) && !(bidx[I(x, y)] && !bidx[I(tx, ty)])) return { x: x * 16 + 8, y: y * 16 + 8 };
    }
    return { x: px, y: py };
  }
  function randOutdoor(zone) {
    const [xa, xb] = ZX[zone];
    for (let i = 0; i < 40; i++) {
      const x = xa + ((Math.random() * (xb - xa + 1)) | 0), y = 1 + ((Math.random() * (H - 2)) | 0), t = tiles[I(x, y)];
      if ((t === 0 || t === 1 || t === 2 || t === 8) && !block[I(x, y)] && !safe[I(x, y)]) return { x: x * 16 + 8, y: y * 16 + 8 };
    }
    return null;
  }
  return { W, H, I, tiles, block, bidx, safe, buildings, containers, props, inner, wires, pickups, spots, locks, gates, gen, genDistrict, solid, bAt, zoneOf, setGate, setLock, freeNear, randOutdoor, get ground() { return ground; } };
})();
