const { ipcMain, powerSaveBlocker } = require('electron');
const { exec } = require('child_process');

class ScreenTimeTracker {
  constructor(mainWindow, deviceManager) {
    this.mainWindow = mainWindow;
    this.deviceManager = deviceManager;
    this.screenTimeToday = 0;
    this.dailyLimit = 120; // minutes
    this.lastActiveTime = Date.now();
    this.isActive = true;
    this.trackingInterval = null;
  }

  start() {
    this.trackingInterval = setInterval(() => {
      this.trackScreenTime();
    }, 5000); // Check every 5 seconds

    // Listen for user activity
    this.setupActivityDetection();
  }

  stop() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
  }

  trackScreenTime() {
    // Check if user is idle
    this.checkUserActivity();

    if (this.isActive) {
      this.screenTimeToday += 5 / 60; // 5 seconds to minutes

      // Send to server
      if (this.deviceManager.isConnected()) {
        this.deviceManager.emitActivity({
          activity_type: 'screen_time',
          details: {
            duration: 5,
            daily_total: this.screenTimeToday,
          },
        });
      }

      // Check if limit exceeded
      if (this.screenTimeToday >= this.dailyLimit) {
        this.lockScreen('Daily screen time limit reached');
      }

      this.mainWindow.webContents.send('screen-time-update', {
        total: this.screenTimeToday,
        limit: this.dailyLimit,
        remaining: Math.max(0, this.dailyLimit - this.screenTimeToday),
      });
    }
  }

  setupActivityDetection() {
    // Listen for user input via keyboard/mouse
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      this.lastActiveTime = Date.now();
      this.isActive = true;
    });

    // Detect idle time
    setInterval(() => {
      const idleTime = (Date.now() - this.lastActiveTime) / 1000 / 60; // in minutes
      if (idleTime > 2) {
        // 2 minutes idle
        this.isActive = false;
      }
    }, 30000); // Check every 30 seconds
  }

  checkUserActivity() {
    // On Windows, use GetLastInputInfo
    exec(
      `powershell -Command "& {
        Add-Type -TypeDefinition @'
[DllImport(\"user32.dll\")]
public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

public struct LASTINPUTINFO {
    public uint cbSize;
    public uint dwTime;
}
'@

        $info = New-Object LASTINPUTINFO
        $info.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($info)
        [return].GetMethod('GetLastInputInfo').Invoke($null, @([ref]$info))
        $idleTime = ([System.Environment]::TickCount - $info.dwTime)
        Write-Output $idleTime
      }"`,
      (error, stdout) => {
        if (!error && stdout) {
          const idleMs = parseInt(stdout.trim());
          this.isActive = idleMs < 60000; // Less than 1 minute idle
        }
      }
    );
  }

  lockScreen(reason) {
    this.mainWindow.webContents.send('screen-locked', { reason });

    // Create a full-screen lock window
    const { BrowserWindow } = require('electron');
    const lockWindow = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    lockWindow.loadURL(`data:text/html;charset=utf-8,
      <html>
        <body style="margin:0; padding:0; background:#000; display:flex; align-items:center; justify-content:center; font-family:Arial;">
          <div style="text-align:center; color:white;">
            <h1>Screen Locked</h1>
            <p>${reason}</p>
            <p>Contact your parent to unlock.</p>
          </div>
        </body>
      </html>
    `);

    // Disable close button and other escape methods
    lockWindow.setMenu(null);
    lockWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'escape') {
        event.preventDefault();
      }
      if (input.key === 'Escape') {
        event.preventDefault();
      }
    });

    this.currentLockWindow = lockWindow;
  }

  unlockScreen() {
    if (this.currentLockWindow) {
      this.currentLockWindow.close();
      this.currentLockWindow = null;
    }
    this.mainWindow.webContents.send('screen-unlocked');
  }

  setDailyLimit(minutes) {
    this.dailyLimit = minutes;
  }

  resetDailyCount() {
    this.screenTimeToday = 0;
  }
}

const setupScreenTimeTracking = (mainWindow, deviceManager) => {
  const tracker = new ScreenTimeTracker(mainWindow, deviceManager);
  tracker.start();

  ipcMain.on('set-daily-limit', (event, minutes) => {
    tracker.setDailyLimit(minutes);
  });

  ipcMain.handle('get-screen-time', () => {
    return {
      total: tracker.screenTimeToday,
      limit: tracker.dailyLimit,
    };
  });

  ipcMain.on('unlock-screen', () => {
    tracker.unlockScreen();
  });

  // Reset at midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      tracker.resetDailyCount();
    }
  }, 60000);
};

module.exports = { setupScreenTimeTracking, ScreenTimeTracker };
