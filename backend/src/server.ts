import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp, mountFinalHandlers } from './app';
import { config } from './config';
import { AdbService } from './adb/adb.service';
import { ScrcpyManager } from './scrcpy/scrcpy.manager';
import { createDeviceRouter } from './routes/devices.routes';
import { DeviceService } from './services/device.service';
import { ControlHandler } from './sockets/control.handler';
import { SocketHandler } from './sockets/socket.handler';
import { log } from './utils/logger';

const adbService = new AdbService(config.adbPath);
const app = createApp();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

const scrcpyManager = new ScrcpyManager(adbService, io);
const deviceService = new DeviceService(adbService, scrcpyManager);
app.use('/api/devices', createDeviceRouter(deviceService));
mountFinalHandlers(app);

const socketHandler = new SocketHandler(io, adbService, scrcpyManager, new ControlHandler(adbService));

socketHandler.register();
adbService.startWatching();

const startServer = (): void => {
  httpServer.listen(config.port, () => {
    log.info(`Backend listening on port ${config.port}`);
  });
};

const shutdown = async (): Promise<void> => {
  log.info('Shutdown triggered');

  try {
    await scrcpyManager.stopAll();
    adbService.stopWatching();

    httpServer.close(() => {
      log.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    log.error('Shutdown failed', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => log.error('Unhandled rejection', reason));
process.on('uncaughtException', (error) => log.error('Uncaught exception', error));

startServer();
