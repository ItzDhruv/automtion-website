export class ScreenshotFailedException extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ScreenshotFailedException';
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}
