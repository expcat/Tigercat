/**
 * Normalize imperative API options: if a plain string is provided,
 * wrap it into a config object with the given key.
 *
 * Used by Message (key='content') and Notification (key='title').
 *
 * @example
 * normalizeStringOption('hello', 'content')  // → { content: 'hello' }
 */
export function normalizeStringOption<T extends object>(
  options: string | T,
  key: string
): T {
  if (typeof options === 'string') {
    return { [key]: options } as T
  }
  return options
}
