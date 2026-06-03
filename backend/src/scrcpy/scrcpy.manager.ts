import { Server as SocketIOServer } from 'socket.io';
import { AdbService } from '../adb/adb.service';
import { ScrcpyService } from './scrcpy.service';
import { log } from '../utils/logger';

export class ScrcpyManager {
  private sessions = new Map<string, ScrcpyService>();

  constructor(private adbService: AdbService, private io: SocketIOServer) {}

  public async startSession(deviceId: string): Promise<void> {
    if (this.sessions.has(deviceId)) {
      return;
    }

    const session = new ScrcpyService(deviceId, this.adbService);
    this.sessions.set(deviceId, session);

    session.on('frame', (payload) => {
      this.io.to(this.getRoomName(deviceId)).emit('screenFrame', payload);
    });

    session.on('started', () => {
      this.io.to(this.getRoomName(deviceId)).emit('streamStarted', { deviceId });
      log.info(`Scrcpy stream started for ${deviceId}`);
    });

    session.on('stopped', () => {
      this.io.to(this.getRoomName(deviceId)).emit('streamStopped', { deviceId });
      this.sessions.delete(deviceId);
      log.info(`Scrcpy stream stopped for ${deviceId}`);
    });

    session.on('error', (deviceIdArg, error) => {
      this.io.to(this.getRoomName(deviceIdArg)).emit('streamError', {
        deviceId: deviceIdArg,
        message: error.message,
      });
      log.error('Scrcpy stream error', { deviceId: deviceIdArg, error });
    });

    await session.start();
  }

  public async stopSession(deviceId: string): Promise<void> {
    const session = this.sessions.get(deviceId);
    if (!session) {
      return;
    }
    await session.stop();
    this.sessions.delete(deviceId);
  }

  public async stopAll(): Promise<void> {
    const sessions = Array.from(this.sessions.values());
    await Promise.all(sessions.map((session) => session.stop()));
    this.sessions.clear();
  }

  public getRoomName(deviceId: string): string {
    return `device-stream-${deviceId}`;
  }
}
