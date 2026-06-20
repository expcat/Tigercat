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
 * Create an independent, monotonically increasing instance-id generator.
 *
 * Each call returns a fresh counter closure, so separate imperative APIs
 * (e.g. Message vs Notification, and the Vue vs React builds of each) keep
 * their own id sequences instead of sharing a single global counter.
 *
 * @example
 * const getNextInstanceId = createInstanceIdGenerator()
 * getNextInstanceId() // 1
 * getNextInstanceId() // 2
 */
export function createInstanceIdGenerator(): () => number {
  let counter = 0
  return () => ++counter
}
