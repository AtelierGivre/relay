import { createApp } from './app.js';

const port = process.env.PORT || 4000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Relay API listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing the Relay API.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}
