// Automated story playthrough: drives every script path and reports errors.
const A = "const Z=__iz,G=Z.G,S=Z.S,R=Z.R,W=Z.World;const w=ms=>new Promise(r=>setTimeout(r,ms));const log=[];const ok=(c,m)=>{if(!c)log.push('FAIL '+m)};";
module.exports = [
  { js: "window.__auto=setInterval(()=>{const R=__iz.R;if(R.nbAny)R.nbAny();else if(R.dlgNum)R.dlgNum(window.__pick||0);else if(R.dlgAny)R.dlgAny();},60); window.__noRender=1;window.__flat=1;window.__izFast();window.onerror=(m,s,l)=>console.error('ONERROR',m,l); const pr=__iz.startNew('تجربة', false); await new Promise(r=>setTimeout(r,1500)); if(__iz.R.lapse)__iz.R.lapse.finish(); await pr; __iz.G.camFollow=0; return 'started'", wait: 1500 },
  { name: 't1', js: A + `
    const pipe=W.pickups.find(p=>p.id==='pipe'); G.x=pipe.x;G.y=pipe.y; await w(300); ok(R.near,'near pipe'); R.near.act(); await w(200); ok(G.weps.pipe>0,'pipe');
    const h=R.zombies.find(z=>z.type==='hassan'); ok(h,'hassan exists'); G.x=h.x+14;G.y=h.y; R.mouse.t=0; await w(200);
    for(let i=0;i<40&&!G.flags.hassan;i++){const hz=R.zombies.find(z=>z.type==='hassan');if(!hz)break;G.x=hz.x+12;G.y=hz.y;R.keys.Space=true;G.dir=1;R.aim=Math.PI;await w(120)} R.keys.Space=false; ok(G.flags.hassan,'hassan dead'); G.hp=100;
    const cs=W.containers.filter(c=>c.zone===0&&c.b).slice(0,4); for(const c of cs){G.x=c.x;G.y=c.y+14;await w(150); ok(R.near,'near cont '+c.kind); if(R.near)R.near.act(); await w(100)} ok(G.lootN>=3,'looted '+G.lootN);
    return log.join(' | ')||'t1 ok '+JSON.stringify(G.inv)` , wait: 300 },
  { name: 't2', js: A + `
    G.x=S.aj.x+10;G.y=S.aj.y+12; await w(300); ok(R.near,'near aj'); await Z.SC.aj(); ok(G.flags.ajMet,'ajMet');
    const fc=W.containers.find(c=>c.fixed==='fuel'); G.x=fc.x;G.y=fc.y+20; await w(300); ok(R.near,'near fuel wreck'); R.near&&R.near.act(); await w(200); ok(G.inv.fuel>=1,'fuel');
    await Z.SC.aj(); ok(G.flags.g1,'g1 open'); ok(G.comps.aj.st==='with','aj with'); ok(W.tiles[W.I(56,55)]===1,'g1 tile');
    // drive kia through the market
    Z.enterVeh(2); ok(G.inVeh===2,'in kia'); R.keys.KeyD=true; await w(2500); R.keys.KeyD=false; ok(G.x>S.kia.x+80,'kia moved '+(G.x-S.kia.x)); const fuelUsed=G.veh[2].fuel<45; ok(fuelUsed,'fuel used');
    R.keys.KeyE=false; // exit
    const b=S.booth; G.veh[2].x=b.x;G.veh[2].y=57*16-8;G.x=b.x;G.y=57*16-8; await w(200); 
    return log.join(' | ')||'t2 ok x='+Math.round(G.x)`, wait: 300 },
  { name: 't3', js: A + `
    // exit the vehicle via interact, loot booth, open g2
    document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE',bubbles:true})); await w(200); ok(G.inVeh===-1,'exited');
    const b=S.booth; G.x=b.x+16;G.y=b.y+4; await w(300); ok(R.near,'near booth'); R.near&&R.near.act(); await w(200); ok(G.inv.key_gate,'gate key');
    G.x=S.g2.x-24;G.y=S.g2.y; await w(300); ok(R.near,'near g2'); R.near&&R.near.act(); await w(300); ok(G.flags.g2,'g2');
    G.x=S.mall.x;G.y=S.mall.y; await w(600); ok(G.flags.mall,'mall flag'); ok(R.pSafe,'safe');
    await Z.SC.noor(); ok(G.flags.noorMet,'noorMet');
    const ph=S.pharm; G.x=ph.x;G.y=ph.y-14; await w(300); ok(R.near,'near pharm'); R.near&&R.near.act(); await w(200); ok(G.inv.medicine,'medicine');
    G.x=S.mall.x;G.y=S.mall.y; await w(300); await Z.SC.noor(); ok(G.flags.murHealed,'murHealed'); ok(G.comps.noor.st==='with','noor with');
    await Z.SC.mur(); ok(G.flags.murAsk,'murAsk'); Z.add('parts',3); await Z.SC.mur(); ok(G.flags.gen,'gen'); ok(G.inv.cutter,'cutter'); ok(G.comps.mur.st==='with','mur with');
    Z.add('can',2); await Z.SC.cat(); ok(G.comps.cat.st==='with','cat');
    G.x=S.radio.x;G.y=S.radio.y+16; await w(300); ok(R.near,'near radio'); R.near&&R.near.act(); await w(1500); ok(G.flags.radio,'radio');
    return log.join(' | ')||'t3 ok npcs='+R.npcs.map(n=>n.id+(n.follow?'*':'')).join(',')`, wait: 300 },
  { name: 't4', js: A + `
    const c=R.zombies.find(z=>z.type==='colonel'); ok(c,'colonel'); c.hp=1; G.x=c.x+12;G.y=c.y;G.dir=1;R.aim=Math.PI;R.mouse.t=0;R.keys.Space=true; await w(1500); R.keys.Space=false; ok(G.flags.colonel,'colonel dead'); ok(G.inv.key_police,'police key'); G.hp=100;
    G.x=S.policeDoor.x;G.y=S.policeDoor.y; await w(300); ok(R.near,'near police door'); R.near&&R.near.act(); await w(200); ok(G.flags.lk_police,'police open');
    const lk=W.containers.find(c=>c.fixed==='pistol'); G.x=lk.x;G.y=lk.y-14; await w(300); R.near&&R.near.act(); await w(200); ok(G.weps.pistol,'pistol'); 
    // fire pistol
    const a0=G.inv.ammo9; R.mouse.l=true; await w(500); R.mouse.l=false; ok(G.inv.ammo9<a0,'ammo used');
    G.x=S.g3.x-24;G.y=S.g3.y; await w(300); R.near&&R.near.act(); await w(300); ok(G.flags.g3,'g3');
    G.x=S.book.x;G.y=S.book.y+14; await w(300); ok(R.near,'near book'); await Z.SC.book(); ok(G.flags.book,'book');
    // workshop: armor the kia
    Z.add('scrap',30); Z.add('parts',10); G.lastVeh=2; G.x=S.mall.x;G.y=S.mall.y; G.veh[2].x=S.mallDoor.x; G.veh[2].y=S.mallDoor.y+40; await w(300);
    window.__pick=0; const lab=[]; // pick option containing armor
    clearInterval(window.__auto); window.__auto=setInterval(()=>{const R=__iz.R;if(R.nbAny)R.nbAny();else if(R.dlgNum){const bs=[...document.querySelectorAll('#dlg .opts button')];let i=bs.findIndex(b=>/تدريع|Armor/.test(b.textContent));if(i<0||__iz.G.veh[2].up.armor>=1)i=bs.length-1;R.dlgNum(i)}else if(R.dlgAny)R.dlgAny();},60);
    await Z.SC.mur(); await w(200);
    clearInterval(window.__auto); window.__auto=setInterval(()=>{const R=__iz.R;if(R.nbAny)R.nbAny();else if(R.dlgNum){const bs=[...document.querySelectorAll('#dlg .opts button')];let i=bs.findIndex(b=>/الورشة|workshop/.test(b.textContent));if(i<0){i=bs.findIndex(b=>/تدريع|Armor/.test(b.textContent));if(i<0||__iz.G.veh[2].up.armor>=1)i=bs.length-1}R.dlgNum(i)}else if(R.dlgAny)R.dlgAny();},60);
    await Z.SC.mur(); await w(300); ok(G.veh[2].up.armor>=1,'armor '+G.veh[2].up.armor);
    clearInterval(window.__auto); window.__auto=setInterval(()=>{const R=__iz.R;if(R.nbAny)R.nbAny();else if(R.dlgNum)R.dlgNum(window.__pick||0);else if(R.dlgAny)R.dlgAny();},60);
    // ram g4
    G.veh[2].x=S.g4.x-150; G.veh[2].y=S.g4.y; G.veh[2].a=0; G.veh[2].fuel=80; G.x=G.veh[2].x;G.y=G.veh[2].y; Z.enterVeh(2); R.keys.KeyD=true; await w(2500); R.keys.KeyD=false; ok(G.flags.g4,'g4 rammed x='+Math.round(G.x));
    return log.join(' | ')||'t4 ok'`, wait: 300 },
  { name: 't5', js: A + `
    R.keys.KeyD=true; await w(1800); R.keys.KeyD=false; ok(G.x>188*16,'crossed bridge x='+Math.round(G.x/16));
    document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE',bubbles:true})); await w(200);
    for(const z of R.zombies.slice()) if(z.type==='soldier') z.hp=1;
    G.x=S.sol.x;G.y=S.sol.y+14; await w(300); ok(R.near,'near sol'); Z.add('medkit',2); await Z.SC.sol(); ok(G.inv.key_armory,'armory key'); ok(G.comps.sol.st==='with','sol with');
    G.x=S.armoryDoor.x;G.y=S.armoryDoor.y; await w(300); R.near&&R.near.act(); await w(200); ok(G.flags.lk_armory,'armory open');
    for(const f of ['rifle','truckkey','armoryammo']){const c=W.containers.find(c=>c.fixed===f); G.x=c.x;G.y=c.y+14; await w(250); ok(R.near,'near '+f); R.near&&R.near.act(); await w(150)} ok(G.weps.rifle,'rifle'); ok(G.inv.key_truck,'truck key');
    G.x=G.veh[4].x+12;G.y=G.veh[4].y+14; await w(200); Z.enterVeh(4); ok(G.inVeh===4,'in truck'); document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE',bubbles:true})); await w(200);
    const boss=R.zombies.find(z=>z.type==='boss'); ok(boss,'boss'); G.x=boss.x-60;G.y=boss.y; R.mouse.t=0; G.dir=2;R.aim=0; G.cur='rifle'; R.keys.Space=true; for(let i=0;i<120&&!G.flags.boss;i++){G.hp=100; const b=R.zombies.find(z=>z.type==='boss'); if(b){G.x=b.x-50;G.y=b.y;G.dir=2;R.aim=0;} await w(100)} R.keys.Space=false; ok(G.flags.boss,'boss dead');
    G.x=S.wareDoor.x+8;G.y=S.wareDoor.y; await w(300); ok(R.near,'near ware door'); R.near&&R.near.act(); await w(200); ok(G.flags.lk_warehouse,'ware open');
    return log.join(' | ')||'t5 ok kills='+G.kills`, wait: 300 },
  { name: 't6', js: A + `
    // days: sleep cycle + requests + save/load + death
    const d0=G.day; await Z.nextDay(true); await w(300); ok(G.day===d0+1,'day+1'); await Z.nextDay(false); await Z.nextDay(true); await w(300); ok(G.day===d0+3,'day+3 '+G.day);
    const trust=JSON.stringify(Object.fromEntries(Object.entries(G.comps).map(([k,v])=>[k,v.st+':'+Math.round(v.trust)])));
    await Z.die(); await w(300); ok(G.hp>=50,'respawned hp='+G.hp); ok(Math.abs(G.x-G.safe.x)<2,'at safe');
    document.dispatchEvent(new KeyboardEvent('keydown',{code:'F5',bubbles:true})); await w(200);
    const name=G.name, day=G.day; Z.toTitle(); await w(300); ok(Z.loadGame(name),'load'); await w(300); ok(__iz.G.day===day,'day persisted'); ok(__iz.G.flags.g4&&W.tiles[W.I(177,55)]===6,'g4 persisted'); ok(W.tiles[W.I(144,59)]===12,'lock persisted');
    return (log.join(' | ')||'t6 ok ')+trust`, wait: 300 },
  { name: 't7', js: "const Z=__iz,G=Z.G,S=Z.S,R=Z.R;const w=ms=>new Promise(r=>setTimeout(r,ms)); G.x=S.pepsi.x;G.y=S.pepsi.y+18; await w(400); const n=!!R.near; if(R.near)R.near.act(); await w(6000); const pe=!document.querySelector('#panel').hidden; Z.closePanel(); return 'near='+n+' ended='+G.flags.ended+' panel='+pe+' zombies='+R.zombies.length", wait: 500 },
  { name: 't8', js: "const Z=__iz;const w=ms=>new Promise(r=>setTimeout(r,ms)); Z.setLang('en'); Z.invPanel(); await w(200); Z.closePanel(); Z.mapPanel(); await w(200); Z.closePanel(); Z.pauseMenu(); await w(200); Z.closePanel(); window.__pick=5; await Z.SC.haji(); window.__pick=0; Z.add('water',2); await Z.SC.umali(); const um=Z.G.flags.umali; await Z.SC.saif(); Z.setLang('ar'); return 'panels ok umali='+um+' saif='+Z.G.comps.saif.st", wait: 300 },
];
