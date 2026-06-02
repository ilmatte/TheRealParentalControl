const path = require('path');
const { Service } = require('node-windows');

const svc = new Service({
  name: 'The Real Parental Control Service',
  description: 'Background Windows service for parental control monitoring and screen-time tracking.',
  script: path.join(__dirname, 'service.js'),
  wait: 2,
  grow: 0.5,
  nodeOptions: ['--harmony', '--max_old_space_size=4096'],
});

const action = process.argv[2];

if (!action || !['install', 'uninstall'].includes(action)) {
  console.error('Usage: node service-install.js <install|uninstall>');
  process.exit(1);
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
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

if (action === 'install') {
  svc.install();
} else if (action === 'uninstall') {
  svc.uninstall();
}
