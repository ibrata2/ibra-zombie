const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ibra', {
  version: ipcRenderer.sendSync('ver'),
  quit: () => ipcRenderer.send('quit'),
  fullscreen: () => ipcRenderer.send('fs'),
  open: url => ipcRenderer.send('open', url),
  model: name => ipcRenderer.invoke('model', name)
});
