const http = require('http');
const config = require('./src/config');
const createApp = require('./src/loaders/express');
const connectDatabase = require('./src/loaders/mongoose');
const setupSocket = require('./src/loaders/socket');

async function start() {
  try {
    await connectDatabase();
    const app = createApp();
    const server = http.createServer(app);
    setupSocket(server);

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port} (env: ${config.env})`);
    });
  } catch (err) {
    console.error('Failed to start application', err);
    process.exit(1);
  }
}

start();
