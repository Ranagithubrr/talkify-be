const config = require('./src/config');
const createApp = require('./src/loaders/express');

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port} (env: ${config.env})`);
});
