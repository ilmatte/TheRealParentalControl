const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { setupChromeMonitoring } = require('./chrome-monitor');
const { setupScreenTimeTracking } = require('./screen-time-tracker');
const DeviceManager = require('./device-manager');

let mainWindow;
let deviceManager;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  createWindow();
  deviceManager = new DeviceManager();
  setupChromeMonitoring(mainWindow, deviceManager);
  setupScreenTimeTracking(mainWindow, deviceManager);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-device-info', () => {
  return deviceManager.getDeviceInfo();
});

ipcMain.handle('get-chrome-info', async () => {
  return await deviceManager.getChromeInfo();
});

ipcMain.on('logout', () => {
  deviceManager.logout();
  mainWindow.webContents.send('user-logged-out');
});
