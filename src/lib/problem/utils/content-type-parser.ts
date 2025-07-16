/**
 * Content-Type aware parsers for HTTP responses
 * Supports JSON, YAML, XML, TOML, and other common formats
 */

import type { Result } from '@/lib/monads/result';
import { Ok, Err } from '@/lib/monads/result';

// Optional dependencies - install if you need these formats
// bun add js-yaml @iarna/toml
import * as yaml from 'js-yaml';
import * as toml from '@iarna/toml';

export interface ContentTypeParser {
  /** Media types this parser can handle */
  supportedTypes: string[];
  /** Parse the content string into a JavaScript object */
  parse<T = unknown>(content: string): Result<T, Error>;
  /** Serialize a JavaScript object into this content type */
  serialize(data: unknown): Result<string, Error>;
}

/**
 * JSON parser implementation
 */
export class JsonParser implements ContentTypeParser {
  supportedTypes = ['application/json', 'application/json; charset=utf-8', 'text/json'];

  parse<T = unknown>(content: string): Result<T, Error> {
    try {
      const parsed = JSON.parse(content) as T;
      return Ok(parsed);
    } catch (error) {
      return Err(new Error(`JSON parse error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  serialize(data: unknown): Result<string, Error> {
    try {
      return Ok(JSON.stringify(data));
    } catch (error) {
      return Err(new Error(`JSON stringify error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}

/**
 * YAML parser implementation
 * Note: Requires js-yaml package - suggested as optional dependency
 */
export class YamlParser implements ContentTypeParser {
  supportedTypes = ['application/yaml', 'application/x-yaml', 'text/yaml', 'text/x-yaml'];

  parse<T = unknown>(content: string): Result<T, Error> {
    try {
      const parsed = yaml.load(content) as T;
      return Ok(parsed);
    } catch (error) {
      return Err(new Error(`YAML parse error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  serialize(data: unknown): Result<string, Error> {
    try {
      return Ok(yaml.dump(data));
    } catch (error) {
      return Err(new Error(`YAML stringify error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}

/**
 * XML parser implementation
 * Note: Basic implementation using DOMParser - consider xml2js for full support
 */
export class XmlParser implements ContentTypeParser {
  supportedTypes = ['application/xml', 'text/xml', 'application/rss+xml', 'application/atom+xml'];

  parse<T = unknown>(content: string): Result<T, Error> {
    try {
      if (typeof DOMParser === 'undefined') {
        return Err(new Error('XML parsing not supported in this environment (no DOMParser)'));
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');

      // Check for parse errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return Err(new Error(`XML parse error: ${parserError.textContent}`));
      }

      // Convert DOM to simple object (basic conversion)
      const result = this.domToObject(doc.documentElement);
      return Ok(result as T);
    } catch (error) {
      return Err(new Error(`XML parse error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  serialize(data: unknown): Result<string, Error> {
    try {
      // Basic XML serialization - mainly for simple objects
      const xml = this.objectToXml(data);
      return Ok(xml);
    } catch (error) {
      return Err(new Error(`XML stringify error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  private domToObject(element: Element): unknown {
    const obj: Record<string, unknown> = {};

    // Add attributes
    for (const attr of element.attributes) {
      obj[`@${attr.name}`] = attr.value;
    }

    // Add child elements
    const children = Array.from(element.children);
    if (children.length === 0) {
      return element.textContent || '';
    }

    for (const child of children) {
      const childObj = this.domToObject(child);
      if (obj[child.tagName]) {
        // Handle multiple elements with same name
        if (Array.isArray(obj[child.tagName])) {
          (obj[child.tagName] as unknown[]).push(childObj);
        } else {
          obj[child.tagName] = [obj[child.tagName], childObj];
        }
      } else {
        obj[child.tagName] = childObj;
      }
    }

    return obj;
  }

  private objectToXml(data: unknown, rootName = 'root'): string {
    if (typeof data !== 'object' || data === null) {
      return `<${rootName}>${String(data)}</${rootName}>`;
    }

    let xml = `<${rootName}>`;

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (key.startsWith('@')) {
        continue; // Skip attributes in this basic implementation
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          xml += this.objectToXml(item, key);
        }
      } else {
        xml += this.objectToXml(value, key);
      }
    }

    xml += `</${rootName}>`;
    return xml;
  }
}

/**
 * TOML parser implementation
 * Note: Requires @iarna/toml package - suggested as optional dependency
 */
export class TomlParser implements ContentTypeParser {
  supportedTypes = ['application/toml', 'text/toml'];

  parse<T = unknown>(content: string): Result<T, Error> {
    try {
      const parsed = toml.parse(content) as T;
      return Ok(parsed);
    } catch (error) {
      return Err(new Error(`TOML parse error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  serialize(data: unknown): Result<string, Error> {
    try {
      // @iarna/toml expects a specific object type for serialization
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return Err(new Error('TOML can only serialize objects (not arrays, primitives, or null)'));
      }

      // The @iarna/toml library has very strict types, but runtime validation will catch issues
      // We use a careful type assertion here since we've validated the input
      const result = toml.stringify(data as Parameters<typeof toml.stringify>[0]);
      return Ok(result);
    } catch (error) {
      return Err(new Error(`TOML stringify error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}

/**
 * Plain text parser - fallback for text content
 */
export class TextParser implements ContentTypeParser {
  supportedTypes = ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/javascript'];

  parse<T = unknown>(content: string): Result<T, Error> {
    // For text content, return as-is
    return Ok(content as T);
  }

  serialize(data: unknown): Result<string, Error> {
    return Ok(String(data));
  }
}

/**
 * URL-encoded form data parser
 */
export class FormDataParser implements ContentTypeParser {
  supportedTypes = ['application/x-www-form-urlencoded'];

  parse<T = unknown>(content: string): Result<T, Error> {
    try {
      const params = new URLSearchParams(content);
      const obj: Record<string, string> = {};

      for (const [key, value] of params.entries()) {
        obj[key] = value;
      }

      return Ok(obj as T);
    } catch (error) {
      return Err(new Error(`Form data parse error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  serialize(data: unknown): Result<string, Error> {
    try {
      if (typeof data !== 'object' || data === null) {
        return Err(new Error('Form data must be an object'));
      }

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        params.append(key, String(value));
      }

      return Ok(params.toString());
    } catch (error) {
      return Err(new Error(`Form data stringify error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}

/**
 * Content-Type parser registry
 */
export class ContentTypeParserRegistry {
  private parsers: ContentTypeParser[] = [];

  constructor(parsers: ContentTypeParser[] = []) {
    this.parsers = [...parsers];
  }

  /**
   * Register a new parser
   */
  register(parser: ContentTypeParser): void {
    this.parsers.push(parser);
  }

  /**
   * Find parser for content type
   */
  findParser(contentType: string): ContentTypeParser | null {
    // Normalize content type (remove charset, etc.)
    const normalizedType = contentType.split(';')[0].trim().toLowerCase();

    for (const parser of this.parsers) {
      for (const supportedType of parser.supportedTypes) {
        if (supportedType.toLowerCase() === normalizedType) {
          return parser;
        }
      }
    }

    return null;
  }

  /**
   * Parse content using appropriate parser
   */
  parse<T = unknown>(content: string, contentType: string): Result<T, Error> {
    const parser = this.findParser(contentType);
    if (!parser) {
      return Err(new Error(`No parser found for content type: ${contentType}`));
    }

    return parser.parse<T>(content);
  }

  /**
   * Serialize data using appropriate parser
   */
  serialize(data: unknown, contentType: string): Result<string, Error> {
    const parser = this.findParser(contentType);
    if (!parser) {
      return Err(new Error(`No parser found for content type: ${contentType}`));
    }

    return parser.serialize(data);
  }

  /**
   * Get all supported content types
   */
  getSupportedTypes(): string[] {
    return this.parsers.flatMap(parser => parser.supportedTypes);
  }
}

// Export default registry instance with all built-in parsers
export const defaultContentTypeRegistry = new ContentTypeParserRegistry([
  new JsonParser(),
  new YamlParser(),
  new XmlParser(),
  new TomlParser(),
  new FormDataParser(),
  new TextParser(), // Fallback parser should be last
]);
