/**
 * Convert Zod schemas to JSON Schema
 * Based on zod-to-json-schema but simplified for our needs
 */

import type { z } from 'zod';

export interface JsonSchema {
  $schema?: string;
  type: string;
  title?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JsonSchema;
  enum?: unknown[];
  nullable?: boolean;
}

/**
 * Convert a Zod schema to JSON Schema
 */
export function zodToJsonSchema(
  zodSchema: z.ZodType,
  options: {
    title?: string;
    description?: string;
    $schema?: string;
    additionalProperties?: boolean;
  } = {},
): JsonSchema {
  const {
    title,
    description,
    $schema = 'http://json-schema.org/draft-07/schema#',
    additionalProperties = false,
  } = options;

  const jsonSchema = convertZodType(zodSchema);

  return {
    $schema,
    title,
    description,
    additionalProperties,
    ...jsonSchema,
  };
}

/**
 * Convert a Zod type to JSON Schema properties
 */
function convertZodType(zodType: z.ZodType): JsonSchema {
  const typeName = (zodType._def as { typeName: string }).typeName;

  switch (typeName) {
    case 'ZodString':
      return handleZodString(zodType as z.ZodString);

    case 'ZodNumber':
      return handleZodNumber(zodType as z.ZodNumber);

    case 'ZodBoolean':
      return { type: 'boolean' };

    case 'ZodArray':
      return handleZodArray(zodType as z.ZodArray<z.ZodType>);

    case 'ZodObject':
      return handleZodObject(zodType as z.ZodObject<z.ZodRawShape>);

    case 'ZodEnum':
      return handleZodEnum(zodType as z.ZodEnum<[string, ...string[]]>);

    case 'ZodOptional':
      return convertZodType((zodType as z.ZodOptional<z.ZodType>)._def.innerType);

    case 'ZodNullable': {
      const innerSchema = convertZodType((zodType as z.ZodNullable<z.ZodType>)._def.innerType);
      return {
        ...innerSchema,
        nullable: true,
      };
    }

    case 'ZodUnion':
      return handleZodUnion(zodType as z.ZodUnion<[z.ZodType, z.ZodType, ...z.ZodType[]]>);

    default:
      // Fallback for unsupported types
      return { type: 'object' };
  }
}

function handleZodString(zodString: z.ZodString): JsonSchema {
  const schema: JsonSchema = { type: 'string' };

  // Extract description from Zod
  if (zodString.description) {
    schema.description = zodString.description;
  }

  return schema;
}

function handleZodNumber(zodNumber: z.ZodNumber): JsonSchema {
  const schema: JsonSchema = { type: 'number' };

  if (zodNumber.description) {
    schema.description = zodNumber.description;
  }

  return schema;
}

function handleZodArray(zodArray: z.ZodArray<z.ZodType>): JsonSchema {
  return {
    type: 'array',
    items: convertZodType(zodArray._def.type),
  };
}

function handleZodObject(zodObject: z.ZodObject<z.ZodRawShape>): JsonSchema {
  const shape = zodObject._def.shape();
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    properties[key] = convertZodType(value as z.ZodType);

    // Check if field is required (not optional)
    if (!isOptional(value as z.ZodType)) {
      required.push(key);
    }
  }

  const schema: JsonSchema = {
    type: 'object',
    properties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  return schema;
}

function handleZodEnum(zodEnum: z.ZodEnum<[string, ...string[]]>): JsonSchema {
  return {
    type: 'string',
    enum: zodEnum._def.values,
  };
}

function handleZodUnion(zodUnion: z.ZodUnion<[z.ZodType, z.ZodType, ...z.ZodType[]]>): JsonSchema {
  // For simplicity, we'll just take the first option
  // In a full implementation, you'd want to handle this more sophisticatedly
  return convertZodType(zodUnion._def.options[0]);
}

function isOptional(zodType: z.ZodType): boolean {
  return (
    (zodType._def as { typeName: string }).typeName === 'ZodOptional' ||
    (zodType._def as { typeName: string }).typeName === 'ZodNullable'
  );
}
