const { contextBridge, ipcRenderer } = require('electron');
const remote = require('@electron/remote');

// 添加登录状态管理
contextBridge.exposeInMainWorld('auth', {
  setLoggedIn: (token) => {
    sessionStorage.setItem('authToken', token);
    document.cookie = `auth_token=${token}; max-age=${7*24*60*60}; path=/`;
  },
  isLoggedIn: () => {
    return !!sessionStorage.getItem('authToken') || document.cookie.includes('auth_token=');
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  onNetworkRestored: (callback) => ipcRenderer.on('network-restored', callback),
  closeWindow: () => ipcRenderer.send('close-about-window'),
  getPlatform: () => process.platform,
  copyToClipboard: (text) => ipcRenderer.send('clipboard:copy', text),
  pasteFromClipboard: () => ipcRenderer.invoke('clipboard:paste'),
  onContextMenu: (callback) => ipcRenderer.on('show-context-menu', callback)
});