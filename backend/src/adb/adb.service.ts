import { ChildProcessWithoutNullStreams, execFile, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { config } from '../config';
import { AppError } from '../utils/error';
import { parseAdbDevices, parseWmSize, sanitizeTextForAdb } from '../utils/adb.utils';
import { DeviceInfo, DeviceStatus } from '../types/device';
import { log } from '../utils/logger';

export interface AdbEvents {
  deviceConnected: (device: DeviceInfo) => void;
  deviceDisconnected: (deviceId: string) => void;
  deviceUpdated: (device: DeviceInfo) => void;
}

export class AdbService extends EventEmitter {
  private deviceCache = new Map<string, DeviceInfo>();
  private trackerProcess?: ChildProcessWithoutNullStreams;
  private trackerBuffer = '';

  constructor(private adbPath: string = config.adbPath) {
    super();
  }

  public startWatching(): void {
    if (this.trackerProcess) {
      return;
    }

    this.trackerProcess = spawn(this.adbPath, ['track-devices']);

    this.trackerProcess.stdout.on('data', (chunk) => this.handleTrackerData(chunk.toString()));
    this.trackerProcess.stderr.on('data', (chunk) => log.error('ADB tracker stderr', chunk.toString()));
    this.trackerProcess.on('exit', (code, signal) => {
      log.warn('ADB tracker exited', { code, signal });
      this.trackerProcess = undefined;
      setTimeout(() => this.startWatching(), 1500);
    });
    this.trackerProcess.on('error', (error) => {
      log.error('Failed to start adb track-devices', error);
    });

    this.refreshDeviceCache().catch((error) => log.error('Initial device refresh failed', error));
  }

  public stopWatching(): void {
    if (this.trackerProcess) {
      this.trackerProcess.kill();
      this.trackerProcess = undefined;
    }
  }

  public async listDevices(): Promise<DeviceInfo[]> {
    await this.refreshDeviceCache();
    return Array.from(this.deviceCache.values());
  }

  public async getDevice(deviceId: string): Promise<DeviceInfo> {
    const cached = this.deviceCache.get(deviceId);
    if (cached) {
      return cached;
    }

    const deviceInfo = await this.buildDeviceInfo(deviceId);
    this.deviceCache.set(deviceId, deviceInfo);
    return deviceInfo;
  }

  public getCachedDevices(): DeviceInfo[] {
    return Array.from(this.deviceCache.values());
  }

  public async captureScreenshot(deviceId: string): Promise<Buffer> {
    return this.execAdbFile(['-s', deviceId, 'exec-out', 'screencap', '-p']);
  }

  public async sendTap(deviceId: string, x: number, y: number): Promise<void> {
    await this.execAdb(['-s', deviceId, 'shell', 'input', 'tap', `${x}`, `${y}`]);
  }

  public async sendSwipe(deviceId: string, startX: number, startY: number, endX: number, endY: number, duration = 150): Promise<void> {
    await this.execAdb([
      '-s',
      deviceId,
      'shell',
      'input',
      'swipe',
      `${startX}`,
      `${startY}`,
      `${endX}`,
      `${endY}`,
      `${duration}`,
    ]);
  }

  public async sendText(deviceId: string, text: string): Promise<void> {
    const payload = sanitizeTextForAdb(text);
    await this.execAdb(['-s', deviceId, 'shell', 'input', 'text', payload]);
  }

  public async sendKeyEvent(deviceId: string, keyEvent: string): Promise<void> {
    await this.execAdb(['-s', deviceId, 'shell', 'input', 'keyevent', keyEvent]);
  }

  private handleTrackerData(data: string): void {
    this.trackerBuffer += data;
    const payloads = this.readTrackerPayloads();

    for (const payload of payloads) {
      const currentDeviceMap = this.buildDeviceMapFromTrackerPayload(payload);
      this.updateDeviceCache(currentDeviceMap).catch((error) => log.error('Device cache update failed', error));
    }
  }

  private readTrackerPayloads(): string[] {
    const payloads: string[] = [];

    while (this.trackerBuffer.length >= 4) {
      const lengthPrefix = this.trackerBuffer.slice(0, 4);

      if (!/^[\da-f]{4}$/i.test(lengthPrefix)) {
        const lastCompleteLine = this.trackerBuffer.lastIndexOf('\n');
        if (lastCompleteLine === -1) {
          break;
        }

        payloads.push(this.trackerBuffer.slice(0, lastCompleteLine + 1));
        this.trackerBuffer = this.trackerBuffer.slice(lastCompleteLine + 1);
        continue;
      }

      const payloadLength = Number.parseInt(lengthPrefix, 16);
      const packetLength = 4 + payloadLength;

      if (this.trackerBuffer.length < packetLength) {
        break;
      }

      payloads.push(this.trackerBuffer.slice(4, packetLength));
      this.trackerBuffer = this.trackerBuffer.slice(packetLength);
    }

    return payloads;
  }

  private buildDeviceMapFromTrackerPayload(payload: string): Map<string, DeviceStatus> {
    const deviceLines = payload
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0 && !line.startsWith('List of devices'));
    const currentDeviceMap = new Map<string, DeviceStatus>();

    for (const line of deviceLines) {
      const [id, status] = line.trim().split(/\s+/);
      if (!id) {
        continue;
      }

      currentDeviceMap.set(
        id,
        status === 'device' || status === 'offline' || status === 'unauthorized' ? status : 'unknown',
      );
    }

    return currentDeviceMap;
  }

  private async refreshDeviceCache(): Promise<void> {
    const output = await this.execAdb(['devices']);
    const deviceEntries = parseAdbDevices(output);
    const currentDeviceMap = new Map<string, DeviceStatus>();

    for (const entry of deviceEntries) {
      currentDeviceMap.set(entry.id, entry.status);
    }

    await this.updateDeviceCache(currentDeviceMap);
  }

  private async updateDeviceCache(currentDeviceMap: Map<string, DeviceStatus>): Promise<void> {
    const previousIds = new Set(this.deviceCache.keys());
    const currentIds = new Set(currentDeviceMap.keys());

    for (const deviceId of currentIds) {
      const status = currentDeviceMap.get(deviceId) ?? 'unknown';
      if (!previousIds.has(deviceId)) {
        try {
          const deviceInfo = status === 'device' ? await this.buildDeviceInfo(deviceId) : this.buildStubDeviceInfo(deviceId, status);
          this.deviceCache.set(deviceId, deviceInfo);
          this.emit('deviceConnected', deviceInfo);
          this.emit('deviceUpdated', deviceInfo);
        } catch (error) {
          log.error('Error building new device info', { deviceId, error });
        }
      } else {
        const cached = this.deviceCache.get(deviceId);
        if (cached && cached.status !== status) {
          const updated = status === 'device' ? await this.buildDeviceInfo(deviceId) : this.buildStubDeviceInfo(deviceId, status);
          this.deviceCache.set(deviceId, updated);
          this.emit('deviceUpdated', updated);
        }
      }
    }

    for (const deviceId of previousIds) {
      if (!currentIds.has(deviceId)) {
        this.deviceCache.delete(deviceId);
        this.emit('deviceDisconnected', deviceId);
      }
    }
  }

  private async buildDeviceInfo(deviceId: string): Promise<DeviceInfo> {
    const [model, androidVersion, resolution, batteryLevel] = await Promise.all([
      this.fetchDeviceProperty(deviceId, 'ro.product.model'),
      this.fetchDeviceProperty(deviceId, 'ro.build.version.release'),
      this.fetchDeviceResolution(deviceId),
      this.fetchBatteryLevel(deviceId),
    ]);

    return {
      id: deviceId,
      model: model || 'Unknown',
      androidVersion: androidVersion || 'Unknown',
      resolution,
      batteryLevel,
      status: 'device',
      connectedAt: new Date().toISOString(),
    };
  }

  private buildStubDeviceInfo(deviceId: string, status: DeviceStatus): DeviceInfo {
    return {
      id: deviceId,
      model: 'Unknown',
      androidVersion: 'Unknown',
      resolution: { width: 0, height: 0 },
      batteryLevel: null,
      status,
      connectedAt: new Date().toISOString(),
    };
  }

  private async fetchDeviceProperty(deviceId: string, property: string): Promise<string> {
    return this.execAdb([ '-s', deviceId, 'shell', 'getprop', property ]).then((value) => value.trim());
  }

  private async fetchDeviceResolution(deviceId: string): Promise<{ width: number; height: number }> {
    const output = await this.execAdb(['-s', deviceId, 'shell', 'wm', 'size']);
    return parseWmSize(output);
  }

  private async fetchBatteryLevel(deviceId: string): Promise<number | null> {
    try {
      const output = await this.execAdb(['-s', deviceId, 'shell', 'dumpsys', 'battery']);
      const match = output.match(/level:\s*(\d+)/i);
      return match ? Number(match[1]) : null;
    } catch (error) {
      log.warn('Unable to read battery level', { deviceId, error });
      return null;
    }
  }

  private execAdb(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(this.adbPath, args, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
          const message = stderr.toString() || error.message;
          reject(new AppError(`ADB command failed: ${message}`));
          return;
        }

        resolve(stdout.toString());
      });
    });
  }

  private execAdbFile(args: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      execFile(this.adbPath, args, { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          const message = stderr.toString() || error.message;
          reject(new AppError(`ADB command failed: ${message}`));
          return;
        }

        resolve(stdout as Buffer);
      });
    });
  }
}
