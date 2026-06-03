import { Server as SocketIOServer, Socket } from 'socket.io';
import { AdbService } from '../adb/adb.service';
import { ScrcpyManager } from '../scrcpy/scrcpy.manager';
import { ControlHandler } from './control.handler';
import { log } from '../utils/logger';

export class SocketHandler {
  private readonly roomPrefix = 'device-stream-';

  constructor(
    private io: SocketIOServer,
    private adbService: AdbService,
    private scrcpyManager: ScrcpyManager,
    private controlHandler: ControlHandler,
  ) {}

  public register(): void {
    this.io.on('connection', (socket) => {
      log.info('Socket connected', socket.id);
      this.boundDeviceEvents(socket);
      this.registerControlEvents(socket);
      this.registerRoomEvents(socket);

      socket.on('disconnect', () => {
        log.info('Socket disconnected', socket.id);
        this.cleanupSocketRooms(socket);
      });
    });

    this.adbService.on('deviceConnected', (device) => this.io.emit('deviceConnected', device));
    this.adbService.on('deviceDisconnected', (deviceId) => this.io.emit('deviceDisconnected', { deviceId }));
    this.adbService.on('deviceUpdated', (device) => this.io.emit('deviceInfo', device));
  }

  private registerRoomEvents(socket: Socket): void {
    socket.on('joinDevice', async ({ deviceId }: { deviceId: string }) => {
      if (!deviceId) {
        return;
      }

      const room = this.getRoom(deviceId);
      socket.join(room);
      const roomSize = this.io.sockets.adapter.rooms.get(room)?.size ?? 0;

      if (roomSize === 1) {
        await this.scrcpyManager.startSession(deviceId);
      }

      const device = await this.adbService.getDevice(deviceId);
      socket.emit('deviceInfo', device);
    });

    socket.on('leaveDevice', async ({ deviceId }: { deviceId: string }) => {
      if (!deviceId) {
        return;
      }
      socket.leave(this.getRoom(deviceId));
      await this.stopSessionIfNoViewers(deviceId);
    });
  }

  private boundDeviceEvents(socket: Socket): void {
    socket.emit('deviceInfo', this.adbService.getCachedDevices());
  }

  private registerControlEvents(socket: Socket): void {
    socket.on('tap', async (payload) => this.handleControl(socket, 'tap', payload));
    socket.on('doubleTap', async (payload) => this.handleControl(socket, 'doubleTap', payload));
    socket.on('longPress', async (payload) => this.handleControl(socket, 'longPress', payload));
    socket.on('swipe', async (payload) => this.handleControl(socket, 'swipe', payload));
    socket.on('scroll', async (payload) => this.handleControl(socket, 'scroll', payload));
    socket.on('textInput', async (payload) => this.handleControl(socket, 'textInput', payload));
    socket.on('home', async (payload: { deviceId: string }) => this.handleControl(socket, 'home', payload));
    socket.on('back', async (payload: { deviceId: string }) => this.handleControl(socket, 'back', payload));
    socket.on('recentApps', async (payload: { deviceId: string }) => this.handleControl(socket, 'recentApps', payload));
    socket.on('power', async (payload: { deviceId: string }) => this.handleControl(socket, 'power', payload));
    socket.on('volumeUp', async (payload: { deviceId: string }) => this.handleControl(socket, 'volumeUp', payload));
    socket.on('volumeDown', async (payload: { deviceId: string }) => this.handleControl(socket, 'volumeDown', payload));
    socket.on('rotate', async (payload: { deviceId: string }) => this.handleControl(socket, 'rotate', payload));
  }

  private async handleControl(socket: Socket, event: string, payload: unknown): Promise<void> {
    if (!payload || typeof payload !== 'object') {
      socket.emit('streamError', { message: `Invalid payload for ${event}` });
      return;
    }

    try {
      switch (event) {
        case 'tap':
          await this.controlHandler.tap(payload as any);
          break;
        case 'doubleTap':
          await this.controlHandler.doubleTap(payload as any);
          break;
        case 'longPress':
          await this.controlHandler.longPress(payload as any);
          break;
        case 'swipe':
          await this.controlHandler.swipe(payload as any);
          break;
        case 'scroll':
          await this.controlHandler.scroll(payload as any);
          break;
        case 'textInput':
          await this.controlHandler.textInput(payload as any);
          break;
        case 'home':
          await this.controlHandler.home((payload as any).deviceId);
          break;
        case 'back':
          await this.controlHandler.back((payload as any).deviceId);
          break;
        case 'recentApps':
          await this.controlHandler.recentApps((payload as any).deviceId);
          break;
        case 'power':
          await this.controlHandler.power((payload as any).deviceId);
          break;
        case 'volumeUp':
          await this.controlHandler.volumeUp((payload as any).deviceId);
          break;
        case 'volumeDown':
          await this.controlHandler.volumeDown((payload as any).deviceId);
          break;
        case 'rotate':
          await this.controlHandler.rotate((payload as any).deviceId);
          break;
        default:
          socket.emit('streamError', { message: `Unsupported control event ${event}` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown control error';
      socket.emit('streamError', { message, event, payload });
    }
  }

  private async cleanupSocketRooms(socket: Socket): Promise<void> {
    for (const room of socket.rooms) {
      if (room.startsWith(this.roomPrefix)) {
        const deviceId = room.replace(this.roomPrefix, '');
        await this.stopSessionIfNoViewers(deviceId);
      }
    }
  }

  private async stopSessionIfNoViewers(deviceId: string): Promise<void> {
    const room = this.getRoom(deviceId);
    const roomSize = this.io.sockets.adapter.rooms.get(room)?.size ?? 0;
    if (roomSize === 0) {
      await this.scrcpyManager.stopSession(deviceId);
    }
  }

  private getRoom(deviceId: string): string {
    return `${this.roomPrefix}${deviceId}`;
  }
}
