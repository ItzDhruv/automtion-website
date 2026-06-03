import { Router } from 'express';
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

  return router;
};
