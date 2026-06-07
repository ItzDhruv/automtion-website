import { Locator } from './Locator';
import { LocatorResolver, ResolvedElement } from './LocatorResolver';
import { AdbService } from '../adb/adb.service';

export interface WaitOptions {
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export class WaitStrategy {
  private readonly timeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly locatorResolver: LocatorResolver;

  constructor(adbService: AdbService, deviceId: string, options: WaitOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? 20000;
    this.pollIntervalMs = options.pollIntervalMs ?? 500;
    this.locatorResolver = new LocatorResolver(adbService, deviceId);
  }

  public async waitForPresence(locator: Locator): Promise<ResolvedElement> {
    return this.poll(async () => {
      return this.locatorResolver.resolve(locator);
    }, `Element presence timed out for ${locator}`);
  }

  public async waitForVisible(locator: Locator): Promise<ResolvedElement> {
    return this.waitForPresence(locator);
  }

  public async waitForClickable(locator: Locator): Promise<ResolvedElement> {
    return this.waitForPresence(locator);
  }

  public async waitForNotPresent(locator: Locator): Promise<void> {
    await this.poll(async () => {
      const element = await this.locatorResolver.resolve(locator);
      return element === null;
    }, `Element still present after timeout: ${locator}`);
  }

  private async poll<T>(callback: () => Promise<T | null>, message: string): Promise<T> {
    const timeoutAt = Date.now() + this.timeoutMs;
    let lastError: Error | null = null;

    while (Date.now() < timeoutAt) {
      try {
        const result = await callback();
        if (result !== null && result !== undefined) {
          return result as T;
        }
        if (result === null) {
          return result as T;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }

    throw lastError ?? new Error(message);
  }
}
