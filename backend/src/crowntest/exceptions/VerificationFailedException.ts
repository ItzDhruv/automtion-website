export class VerificationFailedException extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'VerificationFailedException';
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}
