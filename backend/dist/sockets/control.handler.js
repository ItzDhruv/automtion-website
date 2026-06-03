"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlHandler = void 0;
const error_1 = require("../utils/error");
const coordinate_1 = require("../utils/coordinate");
class ControlHandler {
    constructor(adbService) {
        this.adbService = adbService;
    }
    async tap(payload) {
        const device = await this.adbService.getDevice(payload.deviceId);
        const position = (0, coordinate_1.mapBrowserToDeviceCoordinates)({
            deviceResolution: device.resolution,
            x: payload.x,
            y: payload.y,
            screenWidth: payload.screenWidth,
            screenHeight: payload.screenHeight,
            orientation: payload.orientation,
        });
        await this.adbService.sendTap(payload.deviceId, position.x, position.y);
    }
    async doubleTap(payload) {
        await this.tap(payload);
        await new Promise((resolve) => setTimeout(resolve, 80));
        await this.tap(payload);
    }
    async longPress(payload) {
        const duration = payload.duration ?? 500;
        const device = await this.adbService.getDevice(payload.deviceId);
        const position = (0, coordinate_1.mapBrowserToDeviceCoordinates)({
            deviceResolution: device.resolution,
            x: payload.x,
            y: payload.y,
            screenWidth: payload.screenWidth,
            screenHeight: payload.screenHeight,
            orientation: payload.orientation,
        });
        await this.adbService.sendSwipe(payload.deviceId, position.x, position.y, position.x, position.y, duration);
    }
    async swipe(payload) {
        const device = await this.adbService.getDevice(payload.deviceId);
        const start = (0, coordinate_1.mapBrowserToDeviceCoordinates)({
            deviceResolution: device.resolution,
            x: payload.startX,
            y: payload.startY,
            screenWidth: payload.screenWidth,
            screenHeight: payload.screenHeight,
            orientation: payload.orientation,
        });
        const end = (0, coordinate_1.mapBrowserToDeviceCoordinates)({
            deviceResolution: device.resolution,
            x: payload.endX,
            y: payload.endY,
            screenWidth: payload.screenWidth,
            screenHeight: payload.screenHeight,
            orientation: payload.orientation,
        });
        await this.adbService.sendSwipe(payload.deviceId, start.x, start.y, end.x, end.y, payload.duration ?? 150);
    }
    async scroll(payload) {
        await this.swipe(payload);
    }
    async textInput(payload) {
        if (!payload.text || typeof payload.text !== 'string') {
            throw new error_1.AppError('textInput payload must include a valid text string', 400);
        }
        await this.adbService.sendText(payload.deviceId, payload.text);
    }
    async home(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_HOME');
    }
    async back(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_BACK');
    }
    async recentApps(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_APP_SWITCH');
    }
    async power(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_POWER');
    }
    async volumeUp(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_VOLUME_UP');
    }
    async volumeDown(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_VOLUME_DOWN');
    }
    async rotate(deviceId) {
        await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_ROTATE_SCREEN');
    }
}
exports.ControlHandler = ControlHandler;
//# sourceMappingURL=control.handler.js.map