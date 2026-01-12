/**
 * Type-safe style helpers.
 *
 * These utilities intentionally avoid Vue/React types so they can be shared.
 * The resulting `StyleValue` is compatible with common renderers that accept:
 * - string (cssText)
 * - object (style map)
 * - array of strings/objects (merged style)
 */

export type StyleObject = Record<string, string | number | undefined>;
export type StyleAtom = string | StyleObject;
export type StyleValue = StyleAtom | StyleAtom[];

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null;

const isStyleObject = (val: unknown): val is StyleObject => {
  if (!isRecord(val)) return false;

  // Accept empty objects.
  for (const key of Object.keys(val)) {
    const v = val[key];
    if (v === undefined) continue;
    if (typeof v !== 'string' && typeof v !== 'number') return false;
  }

  return true;
};

export function coerceStyleValue(input: unknown): StyleValue | undefined {
  if (!input) return undefined;

  if (typeof input === 'string') return input;

  if (Array.isArray(input)) {
    const parts: StyleAtom[] = [];
    for (const item of input) {
      const coerced = coerceStyleValue(item);
      if (!coerced) continue;

      if (Array.isArray(coerced)) {
        parts.push(...coerced);
      } else {
        parts.push(coerced);
      }
    }

    if (parts.length === 0) return undefined;
    return parts;
  }

  if (isStyleObject(input)) return input;

  return undefined;
}

export function mergeStyleValues(...inputs: unknown[]): StyleValue | undefined {
  const parts: StyleAtom[] = [];

  for (const input of inputs) {
    const coerced = coerceStyleValue(input);
    if (!coerced) continue;

    if (Array.isArray(coerced)) {
      parts.push(...coerced);
    } else {
      parts.push(coerced);
    }
  }

  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return parts;
}
