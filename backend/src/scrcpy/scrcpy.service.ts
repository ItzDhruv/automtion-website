import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';
import sharp from 'sharp';
import { config } from '../config';
import { AdbService } from '../adb/adb.service';
import { AppError } from '../utils/error';
import { log } from '../utils/logger';

export interface ScrcpyEvents {
  frame: (payload: { deviceId: string; frameBase64: string }) => void;
  started: (deviceId: string) => void;
  stopped: (deviceId: string) => void;
  error: (deviceId: string, error: Error) => void;
}

export class ScrcpyService extends EventEmitter {
  private process?: ChildProcessWithoutNullStreams;
  private pendingBuffer = Buffer.alloc(0);
  private frameSize = 0;

  constructor(private deviceId: string, private adbService: AdbService) {
    super();
  }

  public async start(): Promise<void> {
    const device = await this.adbService.getDevice(this.deviceId);

    if (!device || device.status !== 'device') {
      throw new AppError(`Device ${this.deviceId} is not currently connected`, 404);
    }

    this.frameSize = device.resolution.width * device.resolution.height * 4;
    this.pendingBuffer = Buffer.alloc(0);

    this.process = spawn(config.scrcpyPath, [
      '-s',
      this.deviceId,
      '--no-display',
      '--rawvideo',
      '-',
      '--bit-rate',
      config.bitRate,
      '--max-fps',
      String(config.maxFps),
    ]);

    this.process.stdout.on('data', (chunk: Buffer) => this.handleRawFrameData(chunk, device.resolution));
    this.process.stderr.on('data', (chunk: Buffer) => log.warn('Scrcpy stderr', chunk.toString()));

    this.process.on('exit', (code, signal) => {
      log.warn('Scrcpy process exited', { deviceId: this.deviceId, code, signal });
      this.emit('stopped', this.deviceId);
    });

    this.process.on('error', (error) => {
      log.error('Scrcpy start error', error);
      this.emit('error', this.deviceId, error);
    });

    this.emit('started', this.deviceId);
  }

  public async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.process.kill();
    this.process = undefined;
    this.pendingBuffer = Buffer.alloc(0);
  }

  private async handleRawFrameData(chunk: Buffer, resolution: { width: number; height: number }): Promise<void> {
    this.pendingBuffer = Buffer.concat([this.pendingBuffer, chunk]);

    while (this.pendingBuffer.length >= this.frameSize) {
      const rawFrame = this.pendingBuffer.slice(0, this.frameSize);
      this.pendingBuffer = this.pendingBuffer.slice(this.frameSize);

      try {
        const jpeg = await sharp(rawFrame, {
          raw: {
            width: resolution.width,
            height: resolution.height,
            channels: 4,
          },
        })
          .jpeg({ quality: config.frameQuality })
          .toBuffer();

        this.emit('frame', {
          deviceId: this.deviceId,
          frameBase64: `data:image/jpeg;base64,${jpeg.toString('base64')}`,
        });
      } catch (error) {
        this.emit('error', this.deviceId, error instanceof Error ? error : new Error('Frame conversion failed'));
      }
    }
  }
}
