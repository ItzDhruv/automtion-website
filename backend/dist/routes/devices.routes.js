"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeviceRouter = void 0;
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const devices_controller_1 = require("../controllers/devices.controller");
const createDeviceRouter = (deviceService) => {
    const router = (0, express_1.Router)();
    const controller = new devices_controller_1.DevicesController(deviceService);
    router.get('/', controller.getDevices);
    router.get('/:deviceId', controller.getDevice);
    router.post('/:deviceId/start', controller.startDevice);
    router.post('/:deviceId/stop', controller.stopDevice);
    router.post('/:deviceId/screenshot', controller.captureScreenshot);
    router.post('/:deviceId/install-apk', express_2.default.raw({
        limit: '250mb',
        type: ['application/vnd.android.package-archive', 'application/octet-stream'],
    }), controller.installApk);
    router.post('/:deviceId/run-test', express_2.default.raw({
        limit: '250mb',
        type: ['application/java-archive', 'text/x-java-source', 'application/octet-stream'],
    }), controller.runJavaTest);
    return router;
};
exports.createDeviceRouter = createDeviceRouter;
//# sourceMappingURL=devices.routes.js.map