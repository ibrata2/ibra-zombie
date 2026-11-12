const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');

const shotsArg = process.argv.find(a => a.startsWith('--shots='));
if (shotsArg) app.disableHardwareAcceleration();

let win;
function create() {
  win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 960, minHeight: 540,
    useContentSize: true,
    backgroundColor: '#0b0b0f', title: 'IBRA ZOMBIE',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https:\/\//.test(url)) shell.openExternal(url); } });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  if (shotsArg) require('./tools/shots.js')(win, shotsArg.split('=')[1], app);
}

ipcMain.on('ver', e => { e.returnValue = app.getVersion(); });
ipcMain.on('quit', () => app.quit());
ipcMain.on('fs', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.on('open', (e, url) => { if (/^https:\/\//.test(String(url))) shell.openExternal(url); });

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
