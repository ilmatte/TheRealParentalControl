const { exec } = require('child_process');

class BackgroundScreenTimeTracker {
  constructor(deviceManager) {
    this.deviceManager = deviceManager;
    this.screenTimeToday = 0;
    this.dailyLimit = 120;
    this.lastActiveTime = Date.now();
    this.isActive = true;
    this.trackingInterval = null;
    this.idleInterval = null;
    this.locked = false;

    this.deviceManager.on('screen-lock', (data) => {
      this.lockScreen(data?.reason || 'Remote lock');
    });

    this.deviceManager.on('screen-unlock', () => {
      this.unlockScreen();
    });
  }

  start() {
    if (this.trackingInterval) {
      return;
    }

    this.trackingInterval = setInterval(() => {
      this.trackScreenTime();
    }, 5000);

    this.idleInterval = setInterval(() => {
      this.checkUserActivity();
    }, 30000);
  }

  stop() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }

  trackScreenTime() {
    if (this.isActive && !this.locked) {
      this.screenTimeToday += 5 / 60;
      if (this.deviceManager.isConnectedToServer()) {
        this.deviceManager.emitActivity({
          activity_type: 'screen_time',
          details: {
            duration: 5,
            daily_total: this.screenTimeToday,
          },
        });
      }

      if (this.screenTimeToday >= this.dailyLimit) {
        this.lockScreen('Daily screen time limit reached');
      }
    }
  }

  checkUserActivity() {
    exec(
      `powershell -Command "& {
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public struct LASTINPUTINFO {
    public uint cbSize;
    public uint dwTime;
}

public class LastInput {
    [DllImport(\"user32.dll\")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
}
'@
        $info = New-Object LASTINPUTINFO
        $info.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($info)
        [LastInput]::GetLastInputInfo([ref]$info) | Out-Null
        $idleTime = [Environment]::TickCount - $info.dwTime
        Write-Output $idleTime
      }"`,
      { shell: 'powershell.exe' },
      (error, stdout) => {
        if (!error && stdout) {
          const idleMs = parseInt(stdout.trim(), 10);
          this.isActive = idleMs < 60000;
        }
      }
    );
  }

  lockScreen(reason) {
    if (this.locked) {
      return;
    }

    this.locked = true;
    console.log('Locking screen:', reason);
    exec('rundll32.exe user32.dll,LockWorkStation', (error) => {
      if (error) {
        console.error('Failed to lock workstation:', error);
      }
    });
  }

  unlockScreen() {
    if (!this.locked) {
      return;
    }

    this.locked = false;
    console.log('Unlock command received; user can unlock manually.');
  }

  setDailyLimit(minutes) {
    this.dailyLimit = Number(minutes) || this.dailyLimit;
  }

  resetDailyCount() {
    this.screenTimeToday = 0;
  }
}

module.exports = BackgroundScreenTimeTracker;
