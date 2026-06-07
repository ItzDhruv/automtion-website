import fs from 'fs';
import path from 'path';

export class FileUtils {
  private constructor() {
    // utility class
  }

  public static ensureDirectoryExists(directory: string): void {
    const normalized = path.resolve(directory);
    if (!fs.existsSync(normalized)) {
      fs.mkdirSync(normalized, { recursive: true });
    }
  }
}
