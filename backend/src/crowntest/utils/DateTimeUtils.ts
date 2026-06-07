export class DateTimeUtils {
  private constructor() {
    // utility class
  }

  public static createTimestamp(): string {
    const now = new Date();
    const pad = (value: number, length = 2) => String(value).padStart(length, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${pad(now.getMilliseconds(), 3)}`;
  }
}
