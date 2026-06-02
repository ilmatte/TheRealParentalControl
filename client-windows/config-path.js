const path = require('path');
const os = require('os');
const fs = require('fs');

function getProgramDataDir() {
  return process.env.PROGRAMDATA || path.join(process.env.SystemDrive || 'C:', 'ProgramData');
}

function getInstallConfigFile() {
  // location where installer may write a JSON file to signal a custom config dir
  const pd = getProgramDataDir();
  return path.join(pd, 'TheRealParentalControl', 'install-config.json');
}

function getConfigDir() {
  // If installer wrote a custom config location, prefer it
  try {
    const installCfg = getInstallConfigFile();
    if (fs.existsSync(installCfg)) {
      const parsed = JSON.parse(fs.readFileSync(installCfg, 'utf8'));
      if (parsed && parsed.configDir) return parsed.configDir;
      if (parsed && parsed.useProgramData)
        return path.join(getProgramDataDir(), 'TheRealParentalControl');
    }
  } catch (e) {
    // ignore and fall back
  }

  // Default behavior: per-user directory on non-windows, and per-user on Windows
  if (process.platform === 'win32') {
    return path.join(os.homedir(), '.therealparentalcontrol');
  }

  return path.join(os.homedir(), '.therealparentalcontrol');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'agent-config.json');
}

module.exports = {
  getConfigDir,
  getConfigPath,
};
