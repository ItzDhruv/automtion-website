"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesController = void 0;
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const error_1 = require("../utils/error");
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
        this.installApk = async (req, res, next) => {
            let apkPath = null;
            try {
                if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
                    throw new error_1.AppError('APK upload body is empty', 400);
                }
                const rawFileName = String(req.header('x-apk-filename') || 'upload.apk');
                const fileName = this.decodeFileName(rawFileName);
                if (!fileName.toLowerCase().endsWith('.apk')) {
                    throw new error_1.AppError('Only .apk files can be installed on Android devices', 400);
                }
                const uploadDir = await fs_1.promises.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'tg-live-apk-'));
                apkPath = path_1.default.join(uploadDir, path_1.default.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_'));
                await fs_1.promises.writeFile(apkPath, req.body);
                const adbOutput = await this.deviceService.installApk(req.params.deviceId, apkPath);
                return res.json({
                    message: 'APK installed successfully',
                    deviceId: req.params.deviceId,
                    fileName,
                    adbOutput: adbOutput.trim(),
                });
            }
            catch (error) {
                next(error);
            }
            finally {
                if (apkPath) {
                    await fs_1.promises.rm(path_1.default.dirname(apkPath), { recursive: true, force: true }).catch(() => undefined);
                }
            }
        };
    }
    decodeFileName(fileName) {
        try {
            return decodeURIComponent(fileName);
        }
        catch {
            return fileName;
        }
    }
}
exports.DevicesController = DevicesController;
//# sourceMappingURL=devices.controller.js.map