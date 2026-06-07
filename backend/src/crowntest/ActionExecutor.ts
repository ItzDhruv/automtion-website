import { AdbService } from '../adb/adb.service';
import { Locator } from './Locator';
import { LocatorResolver } from './LocatorResolver';
import { WaitStrategy } from './WaitStrategy';
import { ElementNotClickableException } from './exceptions/ElementNotClickableException';
import { ElementNotFoundException } from './exceptions/ElementNotFoundException';

export interface CTOptions {
  appPackage?: string;
  appActivity?: string;
  screenshotDirectory?: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export class ActionExecutor {
  private readonly locatorResolver: LocatorResolver;
  private readonly waitStrategy: WaitStrategy;
  private readonly appPackage?: string;
  private readonly appActivity?: string;

  constructor(private readonly adbService: AdbService, private readonly deviceId: string, options: CTOptions = {}) {
    this.locatorResolver = new LocatorResolver(adbService, deviceId);
    this.waitStrategy = new WaitStrategy(adbService, deviceId, options);
    this.appPackage = options.appPackage;
    this.appActivity = options.appActivity;
  }

  public async click(locator: Locator): Promise<void> {
    const element = await this.waitStrategy.waitForClickable(locator);
    if (!element) {
      throw new ElementNotClickableException(`Element not clickable: ${locator}`);
    }
    await this.tapCoordinates(element.bounds);
  }

  public async type(locator: Locator, value: string): Promise<void> {
    const element = await this.waitStrategy.waitForVisible(locator);
    if (!element) {
      throw new ElementNotFoundException(`Element not found for typing: ${locator}`);
    }
    await this.tapCoordinates(element.bounds);
    await this.adbService.sendText(this.deviceId, value);
  }

  public async clear(locator: Locator): Promise<void> {
    const element = await this.waitStrategy.waitForVisible(locator);
    if (!element) {
      throw new ElementNotFoundException(`Element not found for clear: ${locator}`);
    }
    await this.tapCoordinates(element.bounds);
    await this.adbService.sendKeyEvent(this.deviceId, 'KEYCODE_MOVE_END');
    for (let i = 0; i < 50; i += 1) {
      await this.adbService.sendKeyEvent(this.deviceId, 'KEYCODE_DEL');
    }
  }

  public async wait(seconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  public async scrollDown(): Promise<void> {
    await this.swipeRelative(0.5, 0.8, 0.5, 0.2);
  }

  public async scrollUp(): Promise<void> {
    await this.swipeRelative(0.5, 0.2, 0.5, 0.8);
  }

  public async scrollLeft(): Promise<void> {
    await this.swipeRelative(0.8, 0.5, 0.2, 0.5);
  }

  public async scrollRight(): Promise<void> {
    await this.swipeRelative(0.2, 0.5, 0.8, 0.5);
  }

  public async swipe(startX: number, startY: number, endX: number, endY: number, durationMilliseconds: number): Promise<void> {
    await this.adbService.sendSwipe(this.deviceId, startX, startY, endX, endY, durationMilliseconds);
  }

  public async tap(locator: Locator): Promise<void> {
    const element = await this.waitStrategy.waitForClickable(locator);
    if (!element) {
      throw new ElementNotClickableException(`Element not clickable: ${locator}`);
    }
    await this.tapCoordinates(element.bounds);
  }

  public async back(): Promise<void> {
    await this.adbService.sendKeyEvent(this.deviceId, 'KEYCODE_BACK');
  }

  public async home(): Promise<void> {
    await this.adbService.sendKeyEvent(this.deviceId, 'KEYCODE_HOME');
  }

  public async launchApp(): Promise<void> {
    if (!this.appPackage) {
      throw new Error('App package is required to launch the app');
    }
    await this.adbService.launchApp(this.deviceId, this.appPackage, this.appActivity);
  }

  public async closeApp(): Promise<void> {
    if (!this.appPackage) {
      throw new Error('App package is required to close the app');
    }
    await this.adbService.closeApp(this.deviceId, this.appPackage);
  }

  private async tapCoordinates(bounds: ResolvedBounds): Promise<void> {
    const x = Math.floor((bounds.left + bounds.right) / 2);
    const y = Math.floor((bounds.top + bounds.bottom) / 2);
    await this.adbService.sendTap(this.deviceId, x, y);
  }

  private async swipeRelative(startXRatio: number, startYRatio: number, endXRatio: number, endYRatio: number): Promise<void> {
    const size = await this.adbService.getScreenSize(this.deviceId);
    const startX = Math.floor(size.width * startXRatio);
    const startY = Math.floor(size.height * startYRatio);
    const endX = Math.floor(size.width * endXRatio);
    const endY = Math.floor(size.height * endYRatio);
    await this.adbService.sendSwipe(this.deviceId, startX, startY, endX, endY, 600);
  }
}

interface ResolvedBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
