"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesController = void 0;
class DevicesController {
    constructor(deviceService) {
        this.deviceService = deviceService;
        this.getDevices = async (_req, res, next) => {
            try {
                const devices = await this.deviceService.listDevices();
                return res.json(devices);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDevice = async (req, res, next) => {
            try {
                const device = await this.deviceService.getDevice(req.params.deviceId);
                return res.json(device);
            }
            catch (error) {
                next(error);
            }
        };
        this.startDevice = async (req, res, next) => {
            try {
                await this.deviceService.startStreaming(req.params.deviceId);
                return res.json({ message: 'Streaming started', deviceId: req.params.deviceId });
            }
            catch (error) {
                next(error);
            }
        };
        this.stopDevice = async (req, res, next) => {
            try {
                await this.deviceService.stopStreaming(req.params.deviceId);
                return res.json({ message: 'Streaming stopped', deviceId: req.params.deviceId });
            }
            catch (error) {
                next(error);
            }
        };
        this.captureScreenshot = async (req, res, next) => {
            try {
                const screenshotBuffer = await this.deviceService.captureScreenshot(req.params.deviceId);
                res.setHeader('Content-Type', 'image/png');
                res.send(screenshotBuffer);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.DevicesController = DevicesController;
//# sourceMappingURL=devices.controller.js.map