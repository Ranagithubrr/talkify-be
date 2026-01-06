const config = require('./src/config');
const createApp = require('./src/loaders/express');
const connectDatabase = require('./src/loaders/mongoose');

async function start() {
  try {
    await connectDatabase();
    const app = createApp();

    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port} (env: ${config.env})`);
    });
  } catch (err) {
    console.error('Failed to start application', err);
    process.exit(1);
  }
}

start();
