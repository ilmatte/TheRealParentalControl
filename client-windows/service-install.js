const path = require('path');
const { Service } = require('node-windows');

const svc = new Service({
  name: 'The Real Parental Control Service',
  description:
    'Background Windows service for parental control monitoring and screen-time tracking.',
  script: path.join(__dirname, 'service.js'),
  wait: 2,
  grow: 0.5,
  nodeOptions: ['--harmony', '--max_old_space_size=4096'],
});

// Parse CLI args: `node service-install.js <install|uninstall> [--system|-s|--all-users]`
const args = process.argv.slice(2);
const action = args[0];
const systemInstall =
  args.includes('--system') || args.includes('--all-users') || args.includes('-s');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const { getProgramDataDir } = (() => {
  const pd =
    process.env.PROGRAMDATA ||
    (process.env.SystemDrive ? path.join(process.env.SystemDrive, 'ProgramData') : null);
  return {
    getProgramDataDir: () => pd || null,
  };
})();

// allow overriding config directory via --config-path <dir>
let explicitConfigPath = null;
const cIndex = args.findIndex((a) => a === '--config-path' || a === '--config-dir' || a === '-c');
if (cIndex >= 0 && args[cIndex + 1]) {
  explicitConfigPath = args[cIndex + 1];
}

if (!action || !['install', 'uninstall'].includes(action)) {
  console.error('Usage: node service-install.js <install|uninstall> [--system|-s|--all-users]');
  process.exit(1);
}

if (systemInstall) {
  // Configure the service to run as LocalSystem so it is available to all users on the machine.
  svc.logOnAs.domain = 'NT AUTHORITY';
  svc.logOnAs.account = 'LocalSystem';
  svc.logOnAs.password = '';
  console.log('Selected installation mode: system (LocalSystem)');
} else {
  console.log('Selected installation mode: current user');
}

// Prepare configuration directory according to selected install mode.
let chosenConfigDir;
if (explicitConfigPath) {
  chosenConfigDir = explicitConfigPath;
} else if (systemInstall && process.platform === 'win32') {
  const pd = getProgramDataDir();
  chosenConfigDir = path.join(pd, 'TheRealParentalControl');
} else {
  chosenConfigDir = path.join(os.homedir(), '.therealparentalcontrol');
}

try {
  if (!fs.existsSync(chosenConfigDir)) {
    fs.mkdirSync(chosenConfigDir, { recursive: true });
    console.log('Created config directory:', chosenConfigDir);
  }

  // If system install on Windows, make sure regular users can write the config.
  if (systemInstall && process.platform === 'win32') {
    try {
      // Grant Modify permission to the Users group (recursively)
      execSync(`icacls "${chosenConfigDir}" /grant "Users:(OI)(CI)M" /T`, { stdio: 'inherit' });
      console.log('Set permissions on config directory for Users group');
    } catch (err) {
      console.warn('Failed to set ACLs on config directory:', err.message);
    }

    // Write install-config.json in ProgramData so the GUI and service will use this path
    try {
      const installCfg = path.join(chosenConfigDir, 'install-config.json');
      fs.writeFileSync(installCfg, JSON.stringify({ configDir: chosenConfigDir }, null, 2), 'utf8');
      console.log('Wrote install-config.json to', installCfg);
    } catch (err) {
      console.warn('Failed to write install-config.json:', err.message);
    }
  }

  // Add config path as environment variable for the service so winsw knows it.
  svc.env = { name: 'TRPC_CONFIG_DIR', value: chosenConfigDir };
} catch (err) {
  console.warn('Failed preparing config directory:', err.message);
}

svc.on('install', () => {
  console.log('Service installed. Starting service...');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed.');
});

svc.on('uninstall', () => {
  console.log('Service uninstalled.');
  if (systemInstall && process.platform === 'win32') {
    try {
      const installCfg = path.join(chosenConfigDir, 'install-config.json');
      if (fs.existsSync(installCfg)) {
        fs.unlinkSync(installCfg);
        console.log('Removed', installCfg);
      }
      // attempt to remove config dir if empty
      const files = fs.readdirSync(chosenConfigDir);
      if (files.length === 0) {
        fs.rmdirSync(chosenConfigDir);
        console.log('Removed empty config dir', chosenConfigDir);
      }
    } catch (err) {
      console.warn('Cleanup after uninstall failed:', err.message);
    }
  }
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

if (action === 'install') {
  svc.install();
} else if (action === 'uninstall') {
  svc.uninstall();
}
