"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketHandler = void 0;
const logger_1 = require("../utils/logger");
class SocketHandler {
    constructor(io, adbService, scrcpyManager, controlHandler) {
        this.io = io;
        this.adbService = adbService;
        this.scrcpyManager = scrcpyManager;
        this.controlHandler = controlHandler;
        this.roomPrefix = 'device-stream-';
    }
    register() {
        this.io.on('connection', (socket) => {
            logger_1.log.info('Socket connected', socket.id);
            this.boundDeviceEvents(socket);
            this.registerControlEvents(socket);
            this.registerRoomEvents(socket);
            socket.on('disconnect', () => {
                logger_1.log.info('Socket disconnected', socket.id);
                this.cleanupSocketRooms(socket);
            });
        });
        this.adbService.on('deviceConnected', (device) => this.io.emit('deviceConnected', device));
        this.adbService.on('deviceDisconnected', (deviceId) => this.io.emit('deviceDisconnected', { deviceId }));
        this.adbService.on('deviceUpdated', (device) => this.io.emit('deviceInfo', device));
    }
    registerRoomEvents(socket) {
        socket.on('joinDevice', async ({ deviceId }) => {
            if (!deviceId) {
                return;
            }
            const room = this.getRoom(deviceId);
            socket.join(room);
            const roomSize = this.io.sockets.adapter.rooms.get(room)?.size ?? 0;
            if (roomSize === 1) {
                await this.scrcpyManager.startSession(deviceId);
            }
            const device = await this.adbService.getDevice(deviceId);
            socket.emit('deviceInfo', device);
        });
        socket.on('leaveDevice', async ({ deviceId }) => {
            if (!deviceId) {
                return;
            }
            socket.leave(this.getRoom(deviceId));
            await this.stopSessionIfNoViewers(deviceId);
        });
    }
    boundDeviceEvents(socket) {
        socket.emit('deviceInfo', this.adbService.getCachedDevices());
    }
    registerControlEvents(socket) {
        socket.on('tap', async (payload) => this.handleControl(socket, 'tap', payload));
        socket.on('doubleTap', async (payload) => this.handleControl(socket, 'doubleTap', payload));
        socket.on('longPress', async (payload) => this.handleControl(socket, 'longPress', payload));
        socket.on('swipe', async (payload) => this.handleControl(socket, 'swipe', payload));
        socket.on('scroll', async (payload) => this.handleControl(socket, 'scroll', payload));
        socket.on('textInput', async (payload) => this.handleControl(socket, 'textInput', payload));
        socket.on('home', async (payload) => this.handleControl(socket, 'home', payload));
        socket.on('back', async (payload) => this.handleControl(socket, 'back', payload));
        socket.on('recentApps', async (payload) => this.handleControl(socket, 'recentApps', payload));
        socket.on('power', async (payload) => this.handleControl(socket, 'power', payload));
        socket.on('volumeUp', async (payload) => this.handleControl(socket, 'volumeUp', payload));
        socket.on('volumeDown', async (payload) => this.handleControl(socket, 'volumeDown', payload));
        socket.on('rotate', async (payload) => this.handleControl(socket, 'rotate', payload));
    }
    async handleControl(socket, event, payload) {
        if (!payload || typeof payload !== 'object') {
            socket.emit('streamError', { message: `Invalid payload for ${event}` });
            return;
        }
        try {
            switch (event) {
                case 'tap':
                    await this.controlHandler.tap(payload);
                    break;
                case 'doubleTap':
                    await this.controlHandler.doubleTap(payload);
                    break;
                case 'longPress':
                    await this.controlHandler.longPress(payload);
                    break;
                case 'swipe':
                    await this.controlHandler.swipe(payload);
                    break;
                case 'scroll':
                    await this.controlHandler.scroll(payload);
                    break;
                case 'textInput':
                    await this.controlHandler.textInput(payload);
                    break;
                case 'home':
                    await this.controlHandler.home(payload.deviceId);
                    break;
                case 'back':
                    await this.controlHandler.back(payload.deviceId);
                    break;
                case 'recentApps':
                    await this.controlHandler.recentApps(payload.deviceId);
                    break;
                case 'power':
                    await this.controlHandler.power(payload.deviceId);
                    break;
                case 'volumeUp':
                    await this.controlHandler.volumeUp(payload.deviceId);
                    break;
                case 'volumeDown':
                    await this.controlHandler.volumeDown(payload.deviceId);
                    break;
                case 'rotate':
                    await this.controlHandler.rotate(payload.deviceId);
                    break;
                default:
                    socket.emit('streamError', { message: `Unsupported control event ${event}` });
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown control error';
            socket.emit('streamError', { message, event, payload });
        }
    }
    async cleanupSocketRooms(socket) {
        for (const room of socket.rooms) {
            if (room.startsWith(this.roomPrefix)) {
                const deviceId = room.replace(this.roomPrefix, '');
                await this.stopSessionIfNoViewers(deviceId);
            }
        }
    }
    async stopSessionIfNoViewers(deviceId) {
        const room = this.getRoom(deviceId);
        const roomSize = this.io.sockets.adapter.rooms.get(room)?.size ?? 0;
        if (roomSize === 0) {
            await this.scrcpyManager.stopSession(deviceId);
        }
    }
    getRoom(deviceId) {
        return `${this.roomPrefix}${deviceId}`;
    }
}
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=socket.handler.js.map