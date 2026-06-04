import { Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { DeviceService } from '../services/device.service';
import { AppError } from '../utils/error';

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

  public installApk = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    let apkPath: string | null = null;

    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        throw new AppError('APK upload body is empty', 400);
      }

      const rawFileName = String(req.header('x-apk-filename') || 'upload.apk');
      const fileName = this.decodeFileName(rawFileName);
      if (!fileName.toLowerCase().endsWith('.apk')) {
        throw new AppError('Only .apk files can be installed on Android devices', 400);
      }

      const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tg-live-apk-'));
      apkPath = path.join(uploadDir, path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_'));

      await fs.writeFile(apkPath, req.body);
      const adbOutput = await this.deviceService.installApk(req.params.deviceId, apkPath);

      return res.json({
        message: 'APK installed successfully',
        deviceId: req.params.deviceId,
        fileName,
        adbOutput: adbOutput.trim(),
      });
    } catch (error) {
      next(error);
    } finally {
      if (apkPath) {
        await fs.rm(path.dirname(apkPath), { recursive: true, force: true }).catch(() => undefined);
      }
    }
  };

  private decodeFileName(fileName: string): string {
    try {
      return decodeURIComponent(fileName);
    } catch {
      return fileName;
    }
  }
}
