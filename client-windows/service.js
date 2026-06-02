const path = require('path');
const os = require('os');
const fs = require('fs');
const DeviceManager = require('./src/service-device-manager');
const ChromeMonitor = require('./src/service-chrome-monitor');
const ScreenTimeTracker = require('./src/service-screen-time-tracker');

const dataDir = path.join(os.homedir(), '.therealparentalcontrol');
const configPath = path.join(dataDir, 'agent-config.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const loadConfig = () => {
  if (!fs.existsSync(configPath)) {
    return {
      serverUrl: process.env.SERVER_URL,
      authToken: process.env.AUTH_TOKEN,
      authEmail: process.env.AUTH_EMAIL,
      authPassword: process.env.AUTH_PASSWORD,
      userId: process.env.USER_ID,
      deviceId: process.env.DEVICE_ID,
    };
  }

  try {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      ...fileConfig,
      serverUrl: process.env.SERVER_URL || fileConfig.serverUrl,
      authToken: process.env.AUTH_TOKEN || fileConfig.authToken,
      authEmail: process.env.AUTH_EMAIL || fileConfig.authEmail,
      authPassword: process.env.AUTH_PASSWORD || fileConfig.authPassword,
      userId: process.env.USER_ID || fileConfig.userId,
      deviceId: process.env.DEVICE_ID || fileConfig.deviceId,
    };
  } catch (error) {
    console.error('Failed to read agent config:', error);
    return {
      serverUrl: process.env.SERVER_URL,
      authToken: process.env.AUTH_TOKEN,
      authEmail: process.env.AUTH_EMAIL,
      authPassword: process.env.AUTH_PASSWORD,
      userId: process.env.USER_ID,
      deviceId: process.env.DEVICE_ID,
    };
  }
};

const saveConfig = (config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save agent config:', error);
  }
};

const main = async () => {
  const config = loadConfig();
  const deviceManager = new DeviceManager(config, { configPath, saveConfig });
  const screenTimeTracker = new ScreenTimeTracker(deviceManager);
  const chromeMonitor = new ChromeMonitor(deviceManager);

  deviceManager.on('restrictions-updated', (restrictions) => {
    if (restrictions) {
      chromeMonitor.setBlockedWebsites(restrictions.blocked_websites || []);
      if (restrictions.daily_time_limit) {
        screenTimeTracker.setDailyLimit(restrictions.daily_time_limit);
      }
    }
  });

  deviceManager.on('screen-lock', (data) => {
    screenTimeTracker.lockScreen(data?.reason || 'Remote lock command');
  });

  deviceManager.on('screen-unlock', () => {
    screenTimeTracker.unlockScreen();
  });

  try {
    await deviceManager.init();
    chromeMonitor.start();
    screenTimeTracker.start();
    console.log('Parental control service started successfully.');
  } catch (error) {
    console.error('Failed to start parental control service:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in service:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in service:', error);
});

main();
