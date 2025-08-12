const { spawn } = require('child_process');
const path = require('path');

// Determine the correct command based on the environment
const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';

// Start the server with ts-node
const server = spawn(command, ['ts-node', 'server.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});