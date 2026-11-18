import { createApp } from '../server/src/app.js';

export default createApp({ serveStatic: false, logRequests: false });
