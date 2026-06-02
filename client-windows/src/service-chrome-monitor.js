const { exec } = require('child_process');
const axios = require('axios');

class BackgroundChromeMonitor {
  constructor(deviceManager) {
    this.deviceManager = deviceManager;
    this.currentTabs = new Map();
    this.blockedWebsites = [];
    this.isMonitoring = false;
    this.monitorInterval = null;
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.checkChromeActivity();
    }, 2000);
  }

  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
  }

  checkChromeActivity() {
    exec(
      'Get-Process chrome -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessName',
      { shell: 'powershell.exe' },
      (error, stdout) => {
        if (!error && stdout && stdout.trim()) {
          this.fetchChromeDebugInfo();
        }
      }
    );
  }

  fetchChromeDebugInfo() {
    exec('netstat -ano | findstr :9222', { shell: 'cmd' }, (error, stdout) => {
      if (!error && stdout && stdout.trim()) {
        this.analyzeTabs();
      } else {
        this.monitorChromeViaWindows();
      }
    });
  }

  analyzeTabs() {
    axios
      .get('http://localhost:9222/json')
      .then((response) => {
        const tabs = response.data || [];
        this.processTabs(tabs);
      })
      .catch(() => {
        this.monitorChromeViaWindows();
      });
  }

  monitorChromeViaWindows() {
    exec(
      `powershell -Command "& {
        $chrome = Get-Process chrome -ErrorAction SilentlyContinue
        if ($chrome) {
          $wshell = New-Object -ComObject wscript.shell
          $activeWindow = $wshell.ActiveWindow
          if ($activeWindow -and $activeWindow.Document) {
            Write-Output $activeWindow.Document.Title
          }
        }
      }"`,
      { shell: 'powershell.exe' },
      (error, stdout) => {
        if (!error && stdout && stdout.trim()) {
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
    const isBlocked = this.blockedWebsites.some((site) => {
      try {
        return url.includes(site) || new URL(url).hostname.includes(site);
      } catch (e) {
        return false;
      }
    });

    if (isBlocked) {
      console.log('Blocked website detected:', url);
      this.deviceManager.emitActivity({
        activity_type: 'website_blocked',
        details: {
          url,
          title,
        },
      });
    }
  }

  sendActivityToServer(activity) {
    if (this.deviceManager.isConnectedToServer()) {
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
    this.blockedWebsites = Array.isArray(websites) ? websites : [];
  }
}

module.exports = BackgroundChromeMonitor;
