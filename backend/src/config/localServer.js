/**
 * Local server configuration for Windows PC installation
 * Allows running parental control backend directly on child's Windows PC
 */

const os = require('os');
const path = require('path');

const getLocalConfig = () => {
  const platform = process.platform;
  
  if (platform !== 'win32') {
    console.warn('Local server configuration is optimized for Windows');
  }

  const dataDir = process.env.APPDATA 
    ? path.join(process.env.APPDATA, 'TheRealParentalControl')
    : path.join(os.homedir(), '.therealparentalcontrol');

  return {
    // Database: Use local SQLite/LiteDB instead of MongoDB when running locally
    database: {
      type: process.env.DB_TYPE || 'local', // 'local' or 'mongodb'
      local: {
        path: path.join(dataDir, 'control.db'),
      },
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/parental_control',
      },
    },
    
    // Server settings
    server: {
      port: process.env.PORT || 3001,
      host: process.env.HOST || 'localhost',
      // Allow local network connections for parent device
      allowedOrigins: [
        'http://localhost:*',
        'http://127.0.0.1:*',
        `http://${getLocalIP()}:*`,
      ],
    },

    // Local authentication (simplified for local PC)
    auth: {
      tokenExpiry: process.env.TOKEN_EXPIRY || '7d',
      useLocalAuth: true, // Simple auth when running locally
    },

    // Data storage
    dataDir,
    logsDir: path.join(dataDir, 'logs'),
    backupDir: path.join(dataDir, 'backups'),

    // Windows-specific
    windows: {
      serviceName: 'TheRealParentalControl',
      displayName: 'The Real Parental Control',
      description: 'Parental control service for Windows',
    },
  };
};

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

module.exports = { getLocalConfig, getLocalIP };
