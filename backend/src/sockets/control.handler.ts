import { AppError } from '../utils/error';
import { AdbService } from '../adb/adb.service';
import { mapBrowserToDeviceCoordinates } from '../utils/coordinate';
import { ScreenCoordinatePayload, SwipePayload, TextInputPayload } from '../types/device';

export class ControlHandler {
  constructor(private adbService: AdbService) {}

  public async tap(payload: ScreenCoordinatePayload): Promise<void> {
    const device = await this.adbService.getDevice(payload.deviceId);
    const position = mapBrowserToDeviceCoordinates({
      deviceResolution: device.resolution,
      x: payload.x,
      y: payload.y,
      screenWidth: payload.screenWidth,
      screenHeight: payload.screenHeight,
      orientation: payload.orientation,
    });

    await this.adbService.sendTap(payload.deviceId, position.x, position.y);
  }

  public async doubleTap(payload: ScreenCoordinatePayload): Promise<void> {
    await this.tap(payload);
    await new Promise((resolve) => setTimeout(resolve, 80));
    await this.tap(payload);
  }

  public async longPress(payload: ScreenCoordinatePayload & { duration?: number }): Promise<void> {
    const duration = payload.duration ?? 500;
    const device = await this.adbService.getDevice(payload.deviceId);
    const position = mapBrowserToDeviceCoordinates({
      deviceResolution: device.resolution,
      x: payload.x,
      y: payload.y,
      screenWidth: payload.screenWidth,
      screenHeight: payload.screenHeight,
      orientation: payload.orientation,
    });

    await this.adbService.sendSwipe(payload.deviceId, position.x, position.y, position.x, position.y, duration);
  }

  public async swipe(payload: SwipePayload): Promise<void> {
    const device = await this.adbService.getDevice(payload.deviceId);
    const start = mapBrowserToDeviceCoordinates({
      deviceResolution: device.resolution,
      x: payload.startX,
      y: payload.startY,
      screenWidth: payload.screenWidth,
      screenHeight: payload.screenHeight,
      orientation: payload.orientation,
    });
    const end = mapBrowserToDeviceCoordinates({
      deviceResolution: device.resolution,
      x: payload.endX,
      y: payload.endY,
      screenWidth: payload.screenWidth,
      screenHeight: payload.screenHeight,
      orientation: payload.orientation,
    });

    await this.adbService.sendSwipe(payload.deviceId, start.x, start.y, end.x, end.y, payload.duration ?? 150);
  }

  public async scroll(payload: SwipePayload): Promise<void> {
    await this.swipe(payload);
  }

  public async textInput(payload: TextInputPayload): Promise<void> {
    if (!payload.text || typeof payload.text !== 'string') {
      throw new AppError('textInput payload must include a valid text string', 400);
    }
    await this.adbService.sendText(payload.deviceId, payload.text);
  }

  public async home(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_HOME');
  }

  public async back(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_BACK');
  }

  public async recentApps(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_APP_SWITCH');
  }

  public async power(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_POWER');
  }

  public async volumeUp(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_VOLUME_UP');
  }

  public async volumeDown(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_VOLUME_DOWN');
  }

  public async rotate(deviceId: string): Promise<void> {
    await this.adbService.sendKeyEvent(deviceId, 'KEYCODE_ROTATE_SCREEN');
  }
}
