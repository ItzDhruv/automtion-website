"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const config_1 = require("./config");
const adb_service_1 = require("./adb/adb.service");
const scrcpy_manager_1 = require("./scrcpy/scrcpy.manager");
const devices_routes_1 = require("./routes/devices.routes");
const device_service_1 = require("./services/device.service");
const control_handler_1 = require("./sockets/control.handler");
const socket_handler_1 = require("./sockets/socket.handler");
const logger_1 = require("./utils/logger");
const adbService = new adb_service_1.AdbService(config_1.config.adbPath);
const app = (0, app_1.createApp)();
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.config.allowedOrigins,
        methods: ['GET', 'POST'],
    },
});
const scrcpyManager = new scrcpy_manager_1.ScrcpyManager(adbService, io);
const deviceService = new device_service_1.DeviceService(adbService, scrcpyManager);
app.use('/api/devices', (0, devices_routes_1.createDeviceRouter)(deviceService));
(0, app_1.mountFinalHandlers)(app);
const socketHandler = new socket_handler_1.SocketHandler(io, adbService, scrcpyManager, new control_handler_1.ControlHandler(adbService));
socketHandler.register();
adbService.startWatching();
const startServer = () => {
    httpServer.listen(config_1.config.port, () => {
        logger_1.log.info(`Backend listening on port ${config_1.config.port}`);
    });
};
const shutdown = async () => {
    logger_1.log.info('Shutdown triggered');
    try {
        await scrcpyManager.stopAll();
        adbService.stopWatching();
        httpServer.close(() => {
            logger_1.log.info('HTTP server closed');
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.log.error('Shutdown failed', error);
        process.exit(1);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => logger_1.log.error('Unhandled rejection', reason));
process.on('uncaughtException', (error) => logger_1.log.error('Uncaught exception', error));
startServer();
//# sourceMappingURL=server.js.map