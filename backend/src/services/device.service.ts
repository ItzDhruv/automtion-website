import { AdbService } from '../adb/adb.service';
import { ScrcpyManager } from '../scrcpy/scrcpy.manager';
import { DeviceInfo } from '../types/device';
import { AppError } from '../utils/error';

export class DeviceService {
  constructor(private adbService: AdbService, private scrcpyManager: ScrcpyManager) {}

  public async listDevices(): Promise<DeviceInfo[]> {
    return this.adbService.listDevices();
  }

  public async getDevice(deviceId: string): Promise<DeviceInfo> {
    return this.adbService.getDevice(deviceId);
  }

  public async startStreaming(deviceId: string): Promise<void> {
    await this.scrcpyManager.startSession(deviceId);
  }

  public async stopStreaming(deviceId: string): Promise<void> {
    await this.scrcpyManager.stopSession(deviceId);
  }

  public async captureScreenshot(deviceId: string): Promise<Buffer> {
    return this.adbService.captureScreenshot(deviceId);
  }

  public async installApk(deviceId: string, apkPath: string): Promise<string> {
    const device = await this.adbService.getDevice(deviceId);
    if (device.status !== 'device') {
      throw new AppError(`Device ${deviceId} is not currently connected`, 404);
    }

    return this.adbService.installApk(deviceId, apkPath);
  }
}
