const { exec } = require('child_process');
const { ipcMain } = require('electron');
const axios = require('axios');

class ChromeMonitor {
  constructor(mainWindow, deviceManager) {
    this.mainWindow = mainWindow;
    this.deviceManager = deviceManager;
    this.currentTabs = new Map();
    this.blockedWebsites = [];
    this.isMonitoring = false;
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Monitor Chrome every 2 seconds
    this.monitorInterval = setInterval(() => {
      this.checkChromeActivity();
    }, 2000);
  }

  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.isMonitoring = false;
    }
  }

  checkChromeActivity() {
    // Windows Chrome window title pattern: "Page Title — Google Chrome"
    exec(
      'Get-Process chrome -ErrorAction SilentlyContinue | Select ProcessName',
      { shell: 'powershell' },
      (error, stdout) => {
        if (!error && stdout) {
          this.fetchChromeDebugInfo();
        }
      }
    );
  }

  fetchChromeDebugInfo() {
    // Chrome has a devtools protocol we can connect to
    // This is simplified - in production use puppeteer or chromium debugger
    exec(
      'netstat -ano | findstr :9222',
      { shell: 'cmd' },
      (error, stdout) => {
        if (!error && stdout) {
          this.analyzeTabs();
        }
      }
    );
  }

  analyzeTabs() {
    axios
      .get('http://localhost:9222/json')
      .then((response) => {
        const tabs = response.data;
        this.processTabs(tabs);
      })
      .catch((error) => {
        // Chrome not running in debug mode, use alternative method
        this.monitorChromeViaWindows();
      });
  }

  monitorChromeViaWindows() {
    // Alternative method using Windows accessibility
    exec(
      `powershell -Command "& {
        $chrome = Get-Process chrome -ErrorAction SilentlyContinue
        if ($chrome) {
          $wshell = New-Object -ComObject wscript.shell
          $activeWindow = $wshell.ActiveWindow
          Write-Output $activeWindow.Document.Title
        }
      }"`,
      (error, stdout) => {
        if (!error && stdout) {
          this.sendActivityToServer({
            url: 'chrome://active',
            title: stdout.trim(),
          });
        }
      }
    );
  }

  processTabs(tabs) {
    tabs.forEach((tab) => {
      if (tab.url && !tab.url.startsWith('chrome://')) {
        this.checkIfBlockedAndNotify(tab.url, tab.title);
        this.sendActivityToServer({
          url: tab.url,
          title: tab.title,
        });
      }
    });
  }

  checkIfBlockedAndNotify(url, title) {
    const isBlocked = this.blockedWebsites.some(
      (site) => url.includes(site) || new URL(url).hostname.includes(site)
    );

    if (isBlocked) {
      this.mainWindow.webContents.send('website-blocked-alert', {
        url,
        title,
      });

      // Close the tab (via keyboard shortcuts)
      exec('powershell -Command "& { [System.Windows.Forms.SendKeys]::SendWait(\"^w\") }"');
    }
  }

  sendActivityToServer(activity) {
    if (this.deviceManager.isConnected()) {
      this.deviceManager.emitActivity({
        activity_type: 'website_visit',
        details: {
          url: activity.url,
          title: activity.title,
          duration: 0,
        },
      });
    }
  }

  setBlockedWebsites(websites) {
    this.blockedWebsites = websites;
  }
}

const setupChromeMonitoring = (mainWindow, deviceManager) => {
  const monitor = new ChromeMonitor(mainWindow, deviceManager);
  monitor.start();

  ipcMain.on('set-blocked-websites', (event, websites) => {
    monitor.setBlockedWebsites(websites);
  });

  ipcMain.handle('get-chrome-tabs', async () => {
    return monitor.currentTabs;
  });
};

module.exports = { setupChromeMonitoring, ChromeMonitor };
