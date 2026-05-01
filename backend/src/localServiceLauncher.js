/**
 * Local Service Launcher for Windows
 * Launch The Real Parental Control backend as local service
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getLocalConfig } = require('./config/localServer');

class LocalServiceLauncher {
  constructor() {
    this.config = getLocalConfig();
    this.isRunning = false;
    this.dataDir = this.config.dataDir;
    this.setupDataDirectories();
  }

  setupDataDirectories() {
    const dirs = [
      this.config.dataDir,
      this.config.logsDir,
      this.config.backupDir,
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Start the local backend service
   */
  async start() {
    if (this.isRunning) {
      console.log('Service already running');
      return;
    }

    try {
      console.log('Starting The Real Parental Control local service...');
      console.log('Data directory:', this.config.dataDir);
      
      // For local installation, we would use a local database
      // For now, show configuration
      console.log('Configuration:');
      console.log(`- Port: ${this.config.server.port}`);
      console.log(`- Host: ${this.config.server.host}`);
      console.log(`- Database: ${this.config.database.type}`);
      
      if (this.config.database.type === 'local') {
        console.log(`- Database file: ${this.config.database.local.path}`);
      }

      // Create a simple health endpoint
      const app = express();
      
      app.get('/health', (req, res) => {
        res.json({
          status: 'running',
          service: 'TheRealParentalControl Local Server',
          timestamp: new Date().toISOString(),
          dataDirectory: this.config.dataDir,
        });
      });

      app.get('/config', (req, res) => {
        res.json({
          localIP: require('./config/localServer').getLocalIP(),
          port: this.config.server.port,
          dataDir: this.config.dataDir,
          windows: this.config.windows,
        });
      });

      const server = app.listen(this.config.server.port, this.config.server.host, () => {
        this.isRunning = true;
        console.log(`✓ Service running at http://${this.config.server.host}:${this.config.server.port}`);
        console.log(`✓ Local network available at http://${require('./config/localServer').getLocalIP()}:${this.config.server.port}`);
      });

      return server;
    } catch (error) {
      console.error('Failed to start service:', error);
      throw error;
    }
  }

  /**
   * Check if service should run at startup
   */
  static async configureAutoStart() {
    if (process.platform !== 'win32') {
      console.log('Auto-start only supported on Windows');
      return false;
    }

    try {
      const { execSync } = require('child_process');
      const userName = os.userInfo().username;
      const autoStartPath = path.join(
        process.env.APPDATA,
        'Microsoft\\Windows\\Start Menu\\Programs\\Startup'
      );

      console.log('Service would be configured to auto-start at:', autoStartPath);
      return true;
    } catch (error) {
      console.error('Failed to configure auto-start:', error);
      return false;
    }
  }

  /**
   * Create config file for service persistence
   */
  saveConfig() {
    const configFile = path.join(this.config.dataDir, 'service-config.json');
    const config = {
      port: this.config.server.port,
      host: this.config.server.host,
      databaseType: this.config.database.type,
      autoStart: true,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log('Configuration saved to:', configFile);
  }
}

module.exports = LocalServiceLauncher;
