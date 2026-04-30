const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onWebsiteBlocked: (callback) =>
    ipcRenderer.on('website-blocked-alert', callback),
  onScreenLocked: (callback) =>
    ipcRenderer.on('screen-locked', callback),
  onScreenUnlocked: (callback) =>
    ipcRenderer.on('screen-unlocked', callback),
  onScreenTimeUpdate: (callback) =>
    ipcRenderer.on('screen-time-update', callback),
  getDeviceInfo: () => ipcRenderer.invoke('get-device-info'),
  getChromeInfo: () => ipcRenderer.invoke('get-chrome-info'),
  getScreenTime: () => ipcRenderer.invoke('get-screen-time'),
  setBlockedWebsites: (websites) =>
    ipcRenderer.send('set-blocked-websites', websites),
  setDailyLimit: (minutes) =>
    ipcRenderer.send('set-daily-limit', minutes),
  unlockScreen: () => ipcRenderer.send('unlock-screen'),
  logout: () => ipcRenderer.send('logout'),
  onUserLoggedOut: (callback) =>
    ipcRenderer.on('user-logged-out', callback),
});
