import { AdbService } from '../adb/adb.service';
import { Locator } from './Locator';
import { WaitStrategy } from './WaitStrategy';
import { ElementNotFoundException } from './exceptions/ElementNotFoundException';
import { VerificationFailedException } from './exceptions/VerificationFailedException';

export interface CTOptions {
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export class AssertionExecutor {
  private readonly waitStrategy: WaitStrategy;

  constructor(private readonly adbService: AdbService, private readonly deviceId: string, options: CTOptions = {}) {
    this.waitStrategy = new WaitStrategy(adbService, deviceId, options);
  }

  public async verifyText(expectedText: string): Promise<void> {
    const locator = Locator.text(expectedText);
    const element = await this.waitStrategy.waitForVisible(locator);
    if (!element) {
      throw new ElementNotFoundException(`Text element not found: ${expectedText}`);
    }

    if (element.text?.trim() !== expectedText.trim()) {
      throw new VerificationFailedException(`Expected text '${expectedText}' but found '${element.text}'`);
    }
  }

  public async verifyElement(locator: Locator): Promise<void> {
    const element = await this.waitStrategy.waitForPresence(locator);
    if (!element) {
      throw new ElementNotFoundException(`Element not found: ${locator}`);
    }
  }

  public async verifyNotPresent(locator: Locator): Promise<void> {
    await this.waitStrategy.waitForNotPresent(locator);
  }

  public async verifyContains(locator: Locator, expectedSubstring: string): Promise<void> {
    const element = await this.waitStrategy.waitForVisible(locator);
    if (!element) {
      throw new ElementNotFoundException(`Element not found: ${locator}`);
    }
    const actual = element.text ?? '';
    if (!actual.includes(expectedSubstring)) {
      throw new VerificationFailedException(`Expected '${locator}' to contain '${expectedSubstring}', but found '${actual}'`);
    }
  }
}
