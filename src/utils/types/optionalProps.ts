/**
 * Type utilities for handling exactOptionalPropertyTypes in TypeScript
 * These utilities help create objects with optional properties when exactOptionalPropertyTypes: true
 */

/**
 * Creates an object with only defined properties, filtering out undefined values
 * This solves exactOptionalPropertyTypes violations by conditionally including properties
 */
export function createOptionalProps<T extends Record<string, any>>(
  props: T
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

/**
 * Creates an object conditionally including properties based on their values
 * More explicit version for complex scenarios
 */
export function conditionalProps<T extends Record<string, any>>(
  conditions: Array<{ condition: boolean; props: Partial<T> }>
): Partial<T> {
  const result: Partial<T> = {};
  
  conditions.forEach(({ condition, props }) => {
    if (condition) {
      Object.assign(result, props);
    }
  });
  
  return result;
}

/**
 * Helper for conditional property assignment
 * Usage: assignIfDefined({ prop: value }, 'prop', conditionalValue)
 */
export function assignIfDefined<T extends Record<string, any>, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined
): T {
  if (value !== undefined) {
    target[key] = value;
  }
  return target;
}

/**
 * Type-safe way to build objects with optional properties
 * Usage: buildOptionalObject({ required: 'value' }).optionally('optional', maybeValue)
 */
export class OptionalObjectBuilder<T extends Record<string, any>> {
  constructor(private obj: T) {}
  
  optionally<K extends string, V>(
    key: K, 
    value: V | undefined
  ): OptionalObjectBuilder<T & { [P in K]?: V }> {
    if (value !== undefined) {
      (this.obj as any)[key] = value;
    }
    return this as any;
  }
  
  build(): T {
    return this.obj;
  }
}

export function buildOptionalObject<T extends Record<string, any>>(
  requiredProps: T
): OptionalObjectBuilder<T> {
  return new OptionalObjectBuilder({ ...requiredProps });
}