import { Request, Response, NextFunction } from 'express';
import { DeviceService } from '../services/device.service';

export class DevicesController {
  constructor(private deviceService: DeviceService) {}

  public getDevices = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const devices = await this.deviceService.listDevices();
      return res.json(devices);
    } catch (error) {
      next(error);
    }
  };

  public getDevice = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const device = await this.deviceService.getDevice(req.params.deviceId);
      return res.json(device);
    } catch (error) {
      next(error);
    }
  };

  public startDevice = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this.deviceService.startStreaming(req.params.deviceId);
      return res.json({ message: 'Streaming started', deviceId: req.params.deviceId });
    } catch (error) {
      next(error);
    }
  };

  public stopDevice = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this.deviceService.stopStreaming(req.params.deviceId);
      return res.json({ message: 'Streaming stopped', deviceId: req.params.deviceId });
    } catch (error) {
      next(error);
    }
  };

  public captureScreenshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const screenshotBuffer = await this.deviceService.captureScreenshot(req.params.deviceId);
      res.setHeader('Content-Type', 'image/png');
      res.send(screenshotBuffer);
    } catch (error) {
      next(error);
    }
  };
}
