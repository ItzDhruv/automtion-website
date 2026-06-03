import { AdbService } from '../adb/adb.service';
import { ScrcpyManager } from '../scrcpy/scrcpy.manager';
import { DeviceInfo } from '../types/device';

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
}
