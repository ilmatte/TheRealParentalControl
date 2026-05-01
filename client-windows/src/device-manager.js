const os = require('os');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io-client');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

class DeviceManager {
  constructor(useLocalServer = false) {
    this.deviceId = this.getOrCreateDeviceId();
    this.userId = null;
    this.token = null;
    this.socket = null;
    this.useLocalServer = useLocalServer;
    this.serverUrl = useLocalServer 
      ? 'http://localhost:3001'
      : (process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    this.isConnected = false;
    this.windowsUsers = [];
  }

  getOrCreateDeviceId() {
    // In production, store this securely
    const storedId = localStorage?.getItem('device_id');
    if (storedId) return storedId;

    const id = uuidv4();
    localStorage?.setItem('device_id', id);
    return id;
  }

  /**
   * Get all Windows users on this machine
   */
  async getWindowsUsers() {
    if (process.platform !== 'win32') {
      return [];
    }

    try {
      const { stdout } = await execPromise('Get-LocalUser | ConvertTo-Json', {
        shell: 'powershell.exe',
      });
      
      const users = JSON.parse(stdout);
      const userList = Array.isArray(users) ? users : [users];
      
      this.windowsUsers = userList.map(user => ({
        username: user.Name,
        display_name: user.FullName || user.Name,
        sid: user.SID,
        enabled: user.Enabled,
      }));

      return this.windowsUsers;
    } catch (error) {
      console.error('Failed to get Windows users:', error);
      return [];
    }
  }

  /**
   * Get current Windows user
   */
  getCurrentWindowsUser() {
    if (process.platform !== 'win32') {
      return os.userInfo().username;
    }

    try {
      const { stdout } = require('child_process').execSync(
        'whoami /upn',
        { encoding: 'utf-8' }
      ).trim();
      
      return stdout.split('\\').pop() || os.userInfo().username;
    } catch (error) {
      return os.userInfo().username;
    }
  }

  getDeviceInfo() {
    return {
      device_id: this.deviceId,
      device_name: os.hostname(),
      os: 'windows',
      os_version: os.release(),
      platform: os.platform(),
      windows_users: this.windowsUsers.filter(u => u.enabled),
    };
  }

  async getChromeInfo() {
    // Get Chrome version from Windows registry or installed apps
    return {
      chrome_version: '120.0.0', // Placeholder
      installed: true,
    };
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${this.serverUrl}/api/auth/login`, {
        email,
        password,
      });

      this.token = response.data.token;
      this.userId = response.data.user.id;

      // Save token locally
      localStorage?.setItem('auth_token', this.token);
      localStorage?.setItem('user_id', this.userId);
      localStorage?.setItem('server_url', this.serverUrl);

      // Get Windows users before registering device
      await this.getWindowsUsers();

      // Register device
      await this.registerDevice();

      // Connect socket
      this.connectSocket();

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async registerDevice() {
    try {
      const deviceInfo = this.getDeviceInfo();
      const chromeInfo = await this.getChromeInfo();

      await axios.post(
        `${this.serverUrl}/api/devices/register`,
        {
          ...deviceInfo,
          ...chromeInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
    } catch (error) {
      console.error('Device registration failed:', error);
    }
  }

  connectSocket() {
    this.socket = io(this.serverUrl, {
      auth: {
        token: this.token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server via socket');
      this.isConnected = true;

      // Register device
      this.socket.emit('register-device', {
        device_id: this.deviceId,
        user_id: this.userId,
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    // Listen for restrictions updates
    this.socket.on('restrictions-updated', (restrictions) => {
      console.log('Restrictions updated:', restrictions);
      // Emit event to main window
    });

    // Listen for screen lock commands
    this.socket.on('screen-lock', (data) => {
      console.log('Screen lock command received:', data);
    });

    // Listen for screen unlock commands
    this.socket.on('screen-unlock', (data) => {
      console.log('Screen unlock command received');
    });

    // Listen for website blocks
    this.socket.on('website-blocked', (data) => {
      console.log('Website blocked:', data.website);
    });
  }

  emitActivity(activity) {
    if (this.socket && this.isConnected) {
      this.socket.emit('activity-update', {
        device_id: this.deviceId,
        child_id: this.userId,
        ...activity,
      });
    }
  }

  async getRestrictions() {
    try {
      const response = await axios.get(
        `${this.serverUrl}/api/restrictions/child/${this.userId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get restrictions:', error);
      return null;
    }
  }

  logout() {
    if (this.socket) {
      this.socket.disconnect();
    }
    localStorage?.removeItem('auth_token');
    localStorage?.removeItem('user_id');
    this.token = null;
    this.userId = null;
    this.isConnected = false;
  }
}

module.exports = DeviceManager;
