import { EventEmitter } from 'events';
import { config } from '../config';
import { AdbService } from '../adb/adb.service';
import { AppError } from '../utils/error';

export interface ScrcpyEvents {
  frame: (payload: { deviceId: string; frameBase64: string }) => void;
  started: (deviceId: string) => void;
  stopped: (deviceId: string) => void;
  error: (deviceId: string, error: Error) => void;
}

export class ScrcpyService extends EventEmitter {
  private isRunning = false;
  private frameTimer?: NodeJS.Timeout;

  constructor(private deviceId: string, private adbService: AdbService) {
    super();
  }

  public async start(): Promise<void> {
    const device = await this.adbService.getDevice(this.deviceId);

    if (!device || device.status !== 'device') {
      throw new AppError(`Device ${this.deviceId} is not currently connected`, 404);
    }

    this.isRunning = true;
    this.emit('started', this.deviceId);
    void this.captureFrameLoop();
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.frameTimer) {
      clearTimeout(this.frameTimer);
      this.frameTimer = undefined;
    }

    this.emit('stopped', this.deviceId);
  }

  private async captureFrameLoop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const screenshot = await this.adbService.captureScreenshot(this.deviceId);
      this.emit('frame', {
        deviceId: this.deviceId,
        frameBase64: `data:image/png;base64,${screenshot.toString('base64')}`,
      });
    } catch (error) {
      this.emit('error', this.deviceId, error instanceof Error ? error : new Error('Frame capture failed'));
    }

    if (!this.isRunning) {
      return;
    }

    const intervalMs = Math.max(200, Math.round(1000 / Math.min(Math.max(config.maxFps, 1), 5)));
    this.frameTimer = setTimeout(() => void this.captureFrameLoop(), intervalMs);
  }
}
