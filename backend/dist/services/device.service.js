"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const error_1 = require("../utils/error");
class DeviceService {
    constructor(adbService, scrcpyManager) {
        this.adbService = adbService;
        this.scrcpyManager = scrcpyManager;
    }
    async listDevices() {
        return this.adbService.listDevices();
    }
    async getDevice(deviceId) {
        return this.adbService.getDevice(deviceId);
    }
    async startStreaming(deviceId) {
        await this.scrcpyManager.startSession(deviceId);
    }
    async stopStreaming(deviceId) {
        await this.scrcpyManager.stopSession(deviceId);
    }
    async captureScreenshot(deviceId) {
        return this.adbService.captureScreenshot(deviceId);
    }
    async installApk(deviceId, apkPath) {
        const device = await this.adbService.getDevice(deviceId);
        if (device.status !== 'device') {
            throw new error_1.AppError(`Device ${deviceId} is not currently connected`, 404);
        }
        return this.adbService.installApk(deviceId, apkPath);
    }
}
exports.DeviceService = DeviceService;
//# sourceMappingURL=device.service.js.map