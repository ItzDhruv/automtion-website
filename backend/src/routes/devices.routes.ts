import { Router } from 'express';
import express from 'express';
import { DeviceService } from '../services/device.service';
import { DevicesController } from '../controllers/devices.controller';

export const createDeviceRouter = (deviceService: DeviceService): Router => {
  const router = Router();
  const controller = new DevicesController(deviceService);

  router.get('/', controller.getDevices);
  router.get('/:deviceId', controller.getDevice);
  router.post('/:deviceId/start', controller.startDevice);
  router.post('/:deviceId/stop', controller.stopDevice);
  router.post('/:deviceId/screenshot', controller.captureScreenshot);
  router.post(
    '/:deviceId/install-apk',
    express.raw({
      limit: '250mb',
      type: ['application/vnd.android.package-archive', 'application/octet-stream'],
    }),
    controller.installApk,
  );
  router.post('/:deviceId/run-test',
    express.raw({
      limit: '250mb',
      type: ['application/java-archive', 'text/x-java-source', 'application/octet-stream'],
    }),
    controller.runJavaTest,
  );
  return router;
};
