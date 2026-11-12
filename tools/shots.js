// Dev tool: drives the real game and saves screenshots.  electron . --shots=<dir> [--steps=<file.js>]
const fs = require('fs'), path = require('path');
module.exports = (win, dir, app) => {
  const stepsArg = process.argv.find(a => a.startsWith('--steps='));
  const steps = require(path.resolve(stepsArg ? stepsArg.split('=')[1] : path.join(__dirname, 'shot-steps.js')));
  fs.mkdirSync(dir, { recursive: true });
  const wc = win.webContents, wait = ms => new Promise(r => setTimeout(r, ms));
  wc.on('console-message', (e, level, msg) => { if (level >= 2) console.log('[page]', msg); });
  wc.once('did-finish-load', async () => {
    await wait(1800);
    for (const s of steps) {
      try { if (s.js) { const r = await wc.executeJavaScript('(async()=>{' + s.js + '})().then(v=>v===undefined?null:v,e=>"ERR "+(e&&e.stack||e))'); if (r) console.log('[' + (s.name || 'step') + ']', r); } }
      catch (e) { console.log('[step error]', s.name, e.message); }
      await wait(s.wait || 500);
      if (s.name && !s.noshot) { const img = await wc.capturePage(); fs.writeFileSync(path.join(dir, s.name + '.png'), img.toPNG()); console.log('shot', s.name); }
    }
    app.quit();
  });
};
