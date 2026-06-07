export class ElementNotClickableException extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ElementNotClickableException';
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}
