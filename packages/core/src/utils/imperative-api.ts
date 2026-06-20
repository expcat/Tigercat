/**
 * Normalize imperative API options: if a plain string is provided,
 * wrap it into a config object with the given key.
 *
 * Used by Message (key='content') and Notification (key='title').
 *
 * @example
 * normalizeStringOption('hello', 'content')  // → { content: 'hello' }
 */
export function normalizeStringOption<T extends object>(options: string | T, key: string): T {
  if (typeof options === 'string') {
    return { [key]: options } as T
  }
  return options
}

/**
 * Create a monotonically increasing instance-id counter.
 *
 * Each call to the returned function yields the next positive integer,
 * starting at 1. Used by imperative APIs (Message, Notification) that need
 * unique, per-module instance ids without sharing a global counter.
 *
 * @example
 * const nextId = createInstanceCounter()
 * nextId() // → 1
 * nextId() // → 2
 */
export function createInstanceCounter(): () => number {
  let counter = 0
  return () => ++counter
}

/**
 * @deprecated Use `createInstanceCounter`.
 */
export const createInstanceIdGenerator = createInstanceCounter
