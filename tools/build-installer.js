// Packs the Windows app with electron-builder, then compiles the NSIS installer.
// Works on Linux without wine (uses the makensis binary electron-builder downloads) and on Windows (makensis on PATH or the same cache).
const { execFileSync, execSync } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const root = path.join(__dirname, '..'), ver = require('../package.json').version;
fs.writeFileSync(path.join(root, 'src', 'version.js'), "window.IZ_VERSION = '" + ver + "';\n");
execSync('npx electron-builder --win --x64 --dir', { cwd: root, stdio: 'inherit' });
const cache = process.env.ELECTRON_BUILDER_CACHE || (process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || os.homedir(), 'electron-builder', 'Cache') : process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Caches', 'electron-builder') : path.join(os.homedir(), '.cache', 'electron-builder'));
let nsisDir = null; try { const d = path.join(cache, 'nsis'); nsisDir = path.join(d, fs.readdirSync(d).filter(n => /^nsis-\d/.test(n)).sort().pop()); } catch (e) { /* not cached */ }
let bin = 'makensis'; const env = Object.assign({}, process.env);
if (nsisDir) { bin = process.platform === 'win32' ? path.join(nsisDir, 'Bin', 'makensis.exe') : path.join(nsisDir, process.platform === 'darwin' ? 'mac' : 'linux', 'makensis'); env.NSISDIR = nsisDir; }
execFileSync(bin, ['-V2', '-DVER=' + ver, path.join(__dirname, 'installer.nsi')], { cwd: __dirname, stdio: 'inherit', env });
console.log('installer ready: dist/IBRA-ZOMBIE-Setup-' + ver + '.exe');
