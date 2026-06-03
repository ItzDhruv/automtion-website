"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrcpyService = void 0;
const events_1 = require("events");
const config_1 = require("../config");
const error_1 = require("../utils/error");
class ScrcpyService extends events_1.EventEmitter {
    constructor(deviceId, adbService) {
        super();
        this.deviceId = deviceId;
        this.adbService = adbService;
        this.isRunning = false;
    }
    async start() {
        const device = await this.adbService.getDevice(this.deviceId);
        if (!device || device.status !== 'device') {
            throw new error_1.AppError(`Device ${this.deviceId} is not currently connected`, 404);
        }
        this.isRunning = true;
        this.emit('started', this.deviceId);
        void this.captureFrameLoop();
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.frameTimer) {
            clearTimeout(this.frameTimer);
            this.frameTimer = undefined;
        }
        this.emit('stopped', this.deviceId);
    }
    async captureFrameLoop() {
        if (!this.isRunning) {
            return;
        }
        try {
            const screenshot = await this.adbService.captureScreenshot(this.deviceId);
            this.emit('frame', {
                deviceId: this.deviceId,
                frameBase64: `data:image/png;base64,${screenshot.toString('base64')}`,
            });
        }
        catch (error) {
            this.emit('error', this.deviceId, error instanceof Error ? error : new Error('Frame capture failed'));
        }
        if (!this.isRunning) {
            return;
        }
        const intervalMs = Math.max(200, Math.round(1000 / Math.min(Math.max(config_1.config.maxFps, 1), 5)));
        this.frameTimer = setTimeout(() => void this.captureFrameLoop(), intervalMs);
    }
}
exports.ScrcpyService = ScrcpyService;
//# sourceMappingURL=scrcpy.service.js.map