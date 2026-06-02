const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { setupChromeMonitoring } = require('./chrome-monitor');
const { setupScreenTimeTracking } = require('./screen-time-tracker');
const DeviceManager = require('./device-manager');

const serviceConfigDir = path.join(os.homedir(), '.therealparentalcontrol');
const serviceConfigPath = path.join(serviceConfigDir, 'agent-config.json');

const ensureServiceConfigDir = () => {
  if (!fs.existsSync(serviceConfigDir)) {
    fs.mkdirSync(serviceConfigDir, { recursive: true });
  }
};

const loadServiceConfig = () => {
  try {
    ensureServiceConfigDir();
    if (!fs.existsSync(serviceConfigPath)) {
      return null;
    }
    const raw = fs.readFileSync(serviceConfigPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load service config:', error);
    return null;
  }
};

const saveServiceConfig = (config) => {
  try {
    ensureServiceConfigDir();
    const payload = {
      serverUrl: config.serverUrl,
      authToken: config.authToken,
      authEmail: config.authEmail,
      authPassword: config.authPassword,
      userId: config.userId,
      deviceId: config.deviceId,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(serviceConfigPath, JSON.stringify(payload, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save service config:', error);
    return { success: false, error: error.message };
  }
};

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

ipcMain.handle('load-service-config', () => {
  return loadServiceConfig();
});

ipcMain.handle('save-service-config', (event, config) => {
  return saveServiceConfig(config);
});
