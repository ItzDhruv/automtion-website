import { Locator, LocatorType } from './Locator';
import { AdbService } from '../adb/adb.service';

export interface ResolvedElement {
  resourceId?: string;
  contentDesc?: string;
  text?: string;
  className?: string;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

interface UiNode {
  attributes: Record<string, string>;
}

export class LocatorResolver {
  constructor(private adbService: AdbService, private deviceId: string) {}

  public async resolve(locator: Locator): Promise<ResolvedElement | null> {
    const dump = await this.adbService.dumpUiHierarchy(this.deviceId);
    const nodes = this.parseNodes(dump);

    for (const node of nodes) {
      if (this.matches(locator, node.attributes)) {
        const bounds = this.parseBounds(node.attributes.bounds);
        if (!bounds) {
          continue;
        }
        return {
          resourceId: node.attributes['resource-id'],
          contentDesc: node.attributes['content-desc'],
          text: node.attributes.text,
          className: node.attributes.class,
          bounds,
        };
      }
    }

    return null;
  }

  private matches(locator: Locator, attrs: Record<string, string>): boolean {
    const normalizedValue = locator.value.trim();

    switch (locator.type) {
      case LocatorType.ID:
        return attrs['resource-id'] === normalizedValue;
      case LocatorType.ACCESSIBILITY_ID:
        return attrs['content-desc'] === normalizedValue;
      case LocatorType.TEXT:
        return attrs.text === normalizedValue;
      case LocatorType.CLASS_NAME:
        return attrs.class === normalizedValue;
      case LocatorType.XPATH:
        return this.matchesXpath(locator.value, attrs);
      default:
        return false;
    }
  }

  private matchesXpath(xpath: string, attrs: Record<string, string>): boolean {
    if (!xpath.startsWith('//')) {
      return false;
    }

    const expression = xpath.slice(2).trim();
    if (expression.includes('[@')) {
      const match = /([^\[]+)\[@([^=]+)=['\"]([^'\"]+)['\"]\]/.exec(expression);
      if (!match) {
        return false;
      }
      const [, className, attribute, value] = match;
      if (attrs.class !== className) {
        return false;
      }
      const attrName = this.xpathAttributeToNodeAttribute(attribute);
      return attrs[attrName] === value;
    }

    return attrs.class === expression;
  }

  private xpathAttributeToNodeAttribute(attribute: string): string {
    if (attribute === 'text()') {
      return 'text';
    }
    return attribute.replace(/^@/, '');
  }

  private parseNodes(xml: string): UiNode[] {
    const nodes: UiNode[] = [];
    const regex = /<node ([^>]+)\/>/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(xml))) {
      const attrString = match[1];
      const attributes = this.parseAttributes(attrString);
      nodes.push({ attributes });
    }

    return nodes;
  }

  private parseAttributes(attributeString: string): Record<string, string> {
    const result: Record<string, string> = {};
    const regex = /([\w:-]+)="([^"]*)"/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(attributeString))) {
      result[match[1]] = match[2];
    }

    return result;
  }

  private parseBounds(boundsString?: string): ResolvedElement['bounds'] | null {
    if (!boundsString) {
      return null;
    }
    const regex = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/;
    const match = boundsString.match(regex);
    if (!match) {
      return null;
    }
    return {
      left: Number(match[1]),
      top: Number(match[2]),
      right: Number(match[3]),
      bottom: Number(match[4]),
    };
  }
}
