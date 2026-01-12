/**
 * Coerce an unknown "class" input (e.g. Vue `attrs.class`) into a `ClassValue`.
 *
 * Vue allows class bindings like:
 * - string
 * - array of strings/objects
 * - object map of { [className]: truthy }
 *
 * Our `classNames()` helper only accepts primitive `ClassValue`s, so this
 * function normalizes Vue-style inputs into a single space-delimited string.
 */

import type { ClassValue } from './class-names';

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null;

const toClassString = (input: unknown): string => {
  if (!input) return '';

  if (typeof input === 'string' || typeof input === 'number') {
    return String(input);
  }

  if (Array.isArray(input)) {
    return input
      .map((item) => toClassString(item))
      .filter(Boolean)
      .join(' ');
  }

  if (isRecord(input)) {
    return Object.keys(input)
      .filter((key) => Boolean(input[key]))
      .join(' ');
  }

  return '';
};

export function coerceClassValue(input: unknown): ClassValue {
  if (input === null || input === undefined || input === false) return input;

  if (typeof input === 'string' || typeof input === 'number') return input;

  const normalized = toClassString(input);
  return normalized ? normalized : undefined;
}
