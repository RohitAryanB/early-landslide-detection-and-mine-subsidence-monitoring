import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

let latestHardwareTelemetry: any = null;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'hardware-telemetry-api',
      configureServer(server) {
        server.middlewares.use('/api/telemetry', (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                let parsed;
                if (body.trim().startsWith('{')) {
                  parsed = JSON.parse(body);
                } else {
                  parsed = { rawString: body.trim() };
                }
                latestHardwareTelemetry = {
                  ...parsed,
                  receivedAt: new Date().toISOString()
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, received: latestHardwareTelemetry }));
              } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid payload' }));
              }
            });
          } else if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(latestHardwareTelemetry || { status: 'waiting_for_esp32_data' }));
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
