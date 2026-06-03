"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeviceRouter = void 0;
const express_1 = require("express");
const devices_controller_1 = require("../controllers/devices.controller");
const createDeviceRouter = (deviceService) => {
    const router = (0, express_1.Router)();
    const controller = new devices_controller_1.DevicesController(deviceService);
    router.get('/', controller.getDevices);
    router.get('/:deviceId', controller.getDevice);
    router.post('/:deviceId/start', controller.startDevice);
    router.post('/:deviceId/stop', controller.stopDevice);
    router.post('/:deviceId/screenshot', controller.captureScreenshot);
    return router;
};
exports.createDeviceRouter = createDeviceRouter;
//# sourceMappingURL=devices.routes.js.map