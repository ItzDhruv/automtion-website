"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrcpyManager = void 0;
const scrcpy_service_1 = require("./scrcpy.service");
const logger_1 = require("../utils/logger");
class ScrcpyManager {
    constructor(adbService, io) {
        this.adbService = adbService;
        this.io = io;
        this.sessions = new Map();
    }
    async startSession(deviceId) {
        if (this.sessions.has(deviceId)) {
            this.io.to(this.getRoomName(deviceId)).emit('streamStarted', { deviceId });
            return;
        }
        const session = new scrcpy_service_1.ScrcpyService(deviceId, this.adbService);
        this.sessions.set(deviceId, session);
        session.on('frame', (payload) => {
            this.io.to(this.getRoomName(deviceId)).emit('screenFrame', payload);
        });
        session.on('started', () => {
            this.io.to(this.getRoomName(deviceId)).emit('streamStarted', { deviceId });
            logger_1.log.info(`Scrcpy stream started for ${deviceId}`);
        });
        session.on('stopped', () => {
            this.io.to(this.getRoomName(deviceId)).emit('streamStopped', { deviceId });
            this.sessions.delete(deviceId);
            logger_1.log.info(`Scrcpy stream stopped for ${deviceId}`);
        });
        session.on('error', (deviceIdArg, error) => {
            this.io.to(this.getRoomName(deviceIdArg)).emit('streamError', {
                deviceId: deviceIdArg,
                message: error.message,
            });
            logger_1.log.error('Scrcpy stream error', { deviceId: deviceIdArg, error });
        });
        await session.start();
    }
    async stopSession(deviceId) {
        const session = this.sessions.get(deviceId);
        if (!session) {
            return;
        }
        await session.stop();
        this.sessions.delete(deviceId);
    }
    async stopAll() {
        const sessions = Array.from(this.sessions.values());
        await Promise.all(sessions.map((session) => session.stop()));
        this.sessions.clear();
    }
    getRoomName(deviceId) {
        return `device-stream-${deviceId}`;
    }
}
exports.ScrcpyManager = ScrcpyManager;
//# sourceMappingURL=scrcpy.manager.js.map