/**
 * Common test data and fixtures for Vue and React component tests
 */

/**
 * Type for component size values
 */
export type ComponentSize = 'sm' | 'md' | 'lg'

/**
 * Common sizes for components
 */
export const componentSizes: readonly ComponentSize[] = ['sm', 'md', 'lg'] as const

/**
 * Test data for edge cases and boundary testing
 */
export const edgeCaseData = {
  emptyString: '',
  whitespace: '   ',
  veryLongText: 'a'.repeat(10000),
  specialCharacters: '<>&"\'\`§±!@#$%^&*()',
  unicode: '你好世界 🌍 مرحبا',
  numbers: {
    zero: 0,
    negative: -1,
    positive: 1,
    large: Number.MAX_SAFE_INTEGER,
    small: Number.MIN_SAFE_INTEGER,
    float: 3.14159,
    infinity: Infinity,
    negativeInfinity: -Infinity,
    nan: NaN
  },
  arrays: {
    empty: [],
    single: [1],
    large: Array(1000)
      .fill(0)
      .map((_, i) => i)
  },
  objects: {
    empty: {},
    nested: { a: { b: { c: { d: 'deep' } } } }
  },
  // Test data for XSS/injection resistance - DO NOT USE IN PRODUCTION
  malicious: {
    html: '<script>alert("XSS")</script>',
    sql: "'; DROP TABLE users; --" // SQL injection test pattern
  }
} as const
