export class ElementNotFoundException extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ElementNotFoundException';
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}
