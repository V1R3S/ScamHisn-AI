import { createApp } from './app.js';
import { config } from './config.js';
import { closeSharedBrowser } from './inspectors/browserInspector.js';

const app = createApp();

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(
    `[ScamHisn AI] Server listening on http://0.0.0.0:${config.port} (model=${config.geminiModel}, aiConfigured=${Boolean(config.geminiApiKey)})`,
  );
});

async function shutdown(signal: string) {
  console.log(`[ScamHisn AI] Received ${signal}, shutting down cleanly...`);
  server.close(async () => {
    await closeSharedBrowser();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
