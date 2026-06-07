export enum LocatorType {
  ID = 'ID',
  ACCESSIBILITY_ID = 'ACCESSIBILITY_ID',
  TEXT = 'TEXT',
  XPATH = 'XPATH',
  CLASS_NAME = 'CLASS_NAME',
}

export class Locator {
  private constructor(public readonly type: LocatorType, public readonly value: string) {}

  public static id(id: string): Locator {
    return new Locator(LocatorType.ID, id);
  }

  public static accessibilityId(accessibilityId: string): Locator {
    return new Locator(LocatorType.ACCESSIBILITY_ID, accessibilityId);
  }

  public static text(text: string): Locator {
    return new Locator(LocatorType.TEXT, text);
  }

  public static xpath(xpath: string): Locator {
    return new Locator(LocatorType.XPATH, xpath);
  }

  public static className(className: string): Locator {
    return new Locator(LocatorType.CLASS_NAME, className);
  }

  public toString(): string {
    return `Locator[${this.type}=${this.value}]`;
  }
}
