import { AdbService } from '../adb/adb.service';
import { ActionExecutor } from './ActionExecutor';
import { AssertionExecutor } from './AssertionExecutor';
import { ScreenshotManager } from './ScreenshotManager';
import { Locator } from './Locator';

export interface CTOptions {
  appPackage?: string;
  appActivity?: string;
  screenshotDirectory?: string;
  pollIntervalMs?: number;
  timeoutMs?: number;
}

export class CT {
  private static adbService: AdbService | null = null;
  private static deviceId: string | null = null;
  private static actionExecutor: ActionExecutor | null = null;
  private static assertionExecutor: AssertionExecutor | null = null;
  private static screenshotManager: ScreenshotManager | null = null;
  private static options: CTOptions = {};

  private constructor() {
    // static utility only
  }

  public static init(adbService: AdbService, deviceId: string, options: CTOptions = {}): void {
    if (!adbService) {
      throw new Error('CT requires an AdbService instance');
    }
    if (!deviceId) {
      throw new Error('CT requires a connected device ID');
    }

    CT.adbService = adbService;
    CT.deviceId = deviceId;
    CT.options = options;
    CT.actionExecutor = new ActionExecutor(adbService, deviceId, options);
    CT.assertionExecutor = new AssertionExecutor(adbService, deviceId, options);
    CT.screenshotManager = new ScreenshotManager(adbService, deviceId, options);
  }

  public static getDeviceId(): string {
    CT.ensureInitialized();
    return CT.deviceId as string;
  }

  public static click(locator: Locator): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.click(locator);
  }

  public static type(locator: Locator, value: string): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.type(locator, value);
  }

  public static clear(locator: Locator): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.clear(locator);
  }

  public static wait(seconds: number): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.wait(seconds);
  }

  public static scrollDown(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.scrollDown();
  }

  public static scrollUp(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.scrollUp();
  }

  public static scrollLeft(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.scrollLeft();
  }

  public static scrollRight(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.scrollRight();
  }

  public static swipe(startX: number, startY: number, endX: number, endY: number, durationMilliseconds: number): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.swipe(startX, startY, endX, endY, durationMilliseconds);
  }

  public static tap(locator: Locator): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.tap(locator);
  }

  public static takeScreenshot(): Promise<string> {
    CT.ensureInitialized();
    return CT.screenshotManager!.takeScreenshot();
  }

  public static back(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.back();
  }

  public static home(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.home();
  }

  public static verifyText(expectedText: string): Promise<void> {
    CT.ensureInitialized();
    return CT.assertionExecutor!.verifyText(expectedText);
  }

  public static verifyElement(locator: Locator): Promise<void> {
    CT.ensureInitialized();
    return CT.assertionExecutor!.verifyElement(locator);
  }

  public static verifyNotPresent(locator: Locator): Promise<void> {
    CT.ensureInitialized();
    return CT.assertionExecutor!.verifyNotPresent(locator);
  }

  public static verifyContains(locator: Locator, expectedSubstring: string): Promise<void> {
    CT.ensureInitialized();
    return CT.assertionExecutor!.verifyContains(locator, expectedSubstring);
  }

  public static launchApp(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.launchApp();
  }

  public static closeApp(): Promise<void> {
    CT.ensureInitialized();
    return CT.actionExecutor!.closeApp();
  }

  private static ensureInitialized(): void {
    if (!CT.adbService || !CT.deviceId) {
      throw new Error('CT must be initialized before use. Call CT.init(adbService, deviceId, options)');
    }
  }
}
