const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const io = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

class ServiceDeviceManager extends EventEmitter {
  constructor(config = {}, persistence = {}) {
    super();
    const { getConfigPath } = require('../config-path');
    this.configPath = persistence.configPath || getConfigPath();
    this.saveConfig = persistence.saveConfig || (() => {});

    this.serverUrl = config.serverUrl || process.env.SERVER_URL || 'http://localhost:5000';
    this.token = config.authToken || process.env.AUTH_TOKEN || null;
    this.email = config.authEmail || process.env.AUTH_EMAIL || null;
    this.password = config.authPassword || process.env.AUTH_PASSWORD || null;
    this.userId = config.userId || process.env.USER_ID || null;
    this.deviceId = config.deviceId || process.env.DEVICE_ID || null;

    this.socket = null;
    this.isConnected = false;
    this.windowsUsers = [];
    this.restrictions = null;
  }

  getDeviceId() {
    if (this.deviceId) {
      return this.deviceId;
    }

    const idFile = path.join(path.dirname(this.configPath), 'device-id.txt');
    if (fs.existsSync(idFile)) {
      this.deviceId = fs.readFileSync(idFile, 'utf8').trim();
      return this.deviceId;
    }

    this.deviceId = uuidv4();
    fs.writeFileSync(idFile, this.deviceId, 'utf8');
    return this.deviceId;
  }

  getDeviceInfo() {
    return {
      device_id: this.getDeviceId(),
      device_name: os.hostname(),
      os: 'windows',
      os_version: os.release(),
      platform: os.platform(),
      windows_users: this.windowsUsers,
    };
  }

  async init() {
    if (!this.token) {
      if (this.email && this.password) {
        await this.login(this.email, this.password);
      } else {
        throw new Error(
          'Service configuration missing auth token or credentials. Set AUTH_TOKEN or AUTH_EMAIL/AUTH_PASSWORD.'
        );
      }
    }

    this.getDeviceId();
    await this.loadWindowsUsers();
    await this.registerDevice();
    this.connectSocket();
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${this.serverUrl}/api/auth/login`, {
        email,
        password,
      });

      this.token = response.data.token;
      this.userId = response.data.user.id;
      this.persistState();
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  persistState() {
    const config = {
      serverUrl: this.serverUrl,
      authToken: this.token,
      authEmail: this.email,
      authPassword: this.password ? '***redacted***' : undefined,
      userId: this.userId,
      deviceId: this.deviceId,
    };
    this.saveConfig(config);
  }

  async loadWindowsUsers() {
    if (process.platform !== 'win32') {
      this.windowsUsers = [];
      return [];
    }

    try {
      const { stdout } = await execPromise('Get-LocalUser | ConvertTo-Json', {
        shell: 'powershell.exe',
      });
      const users = JSON.parse(stdout);
      const userList = Array.isArray(users) ? users : [users];
      this.windowsUsers = userList.map((user) => ({
        username: user.Name,
        display_name: user.FullName || user.Name,
        sid: user.SID,
        enabled: user.Enabled,
      }));
      return this.windowsUsers;
    } catch (error) {
      console.error('Failed to get Windows users:', error);
      this.windowsUsers = [];
      return [];
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
      console.error('Device registration failed:', error.response?.data || error.message);
    }
  }

  async getChromeInfo() {
    return {
      chrome_version: 'unknown',
      installed: true,
    };
  }

  connectSocket() {
    if (!this.token) {
      throw new Error('Cannot connect socket without auth token');
    }

    this.socket = io(this.serverUrl, {
      auth: {
        token: this.token,
      },
      transports: ['websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server via socket');
      this.isConnected = true;
      this.socket.emit('register-device', {
        device_id: this.getDeviceId(),
        user_id: this.userId,
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('restrictions-updated', (restrictions) => {
      console.log('Received restrictions update:', restrictions);
      this.restrictions = restrictions;
      this.emit('restrictions-updated', restrictions);
    });

    this.socket.on('screen-lock', (data) => {
      console.log('Received screen-lock command:', data);
      this.emit('screen-lock', data);
    });

    this.socket.on('screen-unlock', () => {
      console.log('Received screen-unlock command');
      this.emit('screen-unlock');
    });

    this.socket.on('website-blocked', (data) => {
      console.log('Received website-blocked command:', data);
      this.emit('website-blocked', data);
    });
  }

  emitActivity(activity) {
    if (this.socket && this.isConnected) {
      this.socket.emit('activity-update', {
        device_id: this.getDeviceId(),
        child_id: this.userId,
        ...activity,
      });
    }
  }

  isConnectedToServer() {
    return this.socket && this.isConnected;
  }
}

module.exports = ServiceDeviceManager;
