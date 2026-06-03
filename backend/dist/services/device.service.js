"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
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
}
exports.DeviceService = DeviceService;
//# sourceMappingURL=device.service.js.map