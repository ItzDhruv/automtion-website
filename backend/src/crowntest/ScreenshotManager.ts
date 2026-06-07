import fs from 'fs';
import path from 'path';
import { AdbService } from '../adb/adb.service';
import { DateTimeUtils } from './utils/DateTimeUtils';
import { FileUtils } from './utils/FileUtils';
import { ScreenshotFailedException } from './exceptions/ScreenshotFailedException';

export interface CTOptions {
  screenshotDirectory?: string;
}

export class ScreenshotManager {
  private readonly outputDir: string;

  constructor(private readonly adbService: AdbService, private readonly deviceId: string, options: CTOptions = {}) {
    this.outputDir = options.screenshotDirectory ?? path.join(process.cwd(), 'crowntest-screenshots');
    FileUtils.ensureDirectoryExists(this.outputDir);
  }

  public async takeScreenshot(): Promise<string> {
    const screenshotBuffer = await this.adbService.captureScreenshot(this.deviceId);
    const fileName = `CT-${DateTimeUtils.createTimestamp()}.png`;
    const filePath = path.join(this.outputDir, fileName);

    try {
      await fs.promises.writeFile(filePath, screenshotBuffer);
      return filePath;
    } catch (error) {
      throw new ScreenshotFailedException(`Unable to save screenshot to ${filePath}`, error instanceof Error ? error : undefined);
    }
  }
}
