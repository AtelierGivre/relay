import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { api } from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../../client/dist');

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function createApp({ serveStatic = true, logRequests = true } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
    next();
  });

  app.use(express.json({ limit: '100kb' }));

  if (logRequests) {
    app.use((req, res, next) => {
      const started = Date.now();
      res.on('finish', () => {
        if (req.path.startsWith('/api')) {
          console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
        }
      });
      next();
    });
  }

  app.use('/api', api);

  const hasBuild = serveStatic && fs.existsSync(dist);
  if (hasBuild) {
    app.use(express.static(dist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(dist, 'index.html'));
    });
  } else if (serveStatic) {
    app.get('/', (req, res) => {
      res
        .type('text/plain')
        .send('Relay API is running. Start the client with `npm run dev` or build it with `npm run build`.');
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (res.headersSent) return;
    const isParseError = err.type === 'entity.parse.failed' || err.type === 'entity.too.large';
    const status = isParseError ? 400 : err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error: isParseError ? 'Request body must be valid JSON.' : status >= 500 ? 'Something went wrong.' : err.message,
    });
  });

  return app;
}
