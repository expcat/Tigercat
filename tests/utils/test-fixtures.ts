import { nextTick } from 'vue'
import { vi, type MockInstance } from 'vitest'

/**
 * Common test data and fixtures for Vue and React component tests
 */

/**
 * Type for button variant values
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'

/**
 * Type for component size values
 */
export type ComponentSize = 'sm' | 'md' | 'lg'

/**
 * Type for input type values
 */
export type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url'

/**
 * Common button variants for testing
 */
export const buttonVariants: readonly ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const

/**
 * Common sizes for components
 */
export const componentSizes: readonly ComponentSize[] = ['sm', 'md', 'lg'] as const

/**
 * Common input types for form components
 */
export const inputTypes: readonly InputType[] = ['text', 'number', 'email', 'password', 'tel', 'url'] as const

/**
 * Type for mock event handlers
 */
export interface MockHandlers {
  onClick: MockInstance
  onChange: MockInstance
  onInput: MockInstance
  onFocus: MockInstance
  onBlur: MockInstance
  onSubmit: MockInstance
  onKeyDown: MockInstance
  onKeyUp: MockInstance
  onMouseEnter: MockInstance
  onMouseLeave: MockInstance
}

/**
 * Create mock event handlers for testing
 * Returns a set of vitest mock functions for common events
 * 
 * @returns Object containing mock functions for common event handlers
 * 
 * @example
 * const handlers = createMockHandlers()
 * render(<Button onClick={handlers.onClick}>Click me</Button>)
 * await userEvent.click(button)
 * expect(handlers.onClick).toHaveBeenCalled()
 */
export const createMockHandlers = (): MockHandlers => ({
  onClick: vi.fn(),
  onChange: vi.fn(),
  onInput: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  onSubmit: vi.fn(),
  onKeyDown: vi.fn(),
  onKeyUp: vi.fn(),
  onMouseEnter: vi.fn(),
  onMouseLeave: vi.fn(),
})

/**
 * Wait for next tick helper using Vue's nextTick
 * Useful for waiting for Vue's reactive updates
 * 
 * @returns Promise that resolves on next tick
 * 
 * @example
 * await waitForNextTick()
 */
export const waitForNextTick = (): Promise<void> => nextTick()

/**
 * Wait for condition helper with timeout
 * Polls a condition function until it returns true or timeout is reached
 * 
 * @param condition - Function that returns true when condition is met
 * @param timeout - Maximum time to wait in milliseconds (default: 1000)
 * @param interval - Polling interval in milliseconds (default: 50)
 * @returns Promise that resolves when condition is met
 * @throws {Error} If timeout is reached before condition is met
 * 
 * @example
 * await waitFor(() => screen.getByText('Loaded'))
 * await waitFor(() => button.disabled === false, 2000, 100)
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 1000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now()
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`)
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Common test labels and text content
 * Reusable text values for consistent test assertions
 */
export const testLabels = {
  button: 'Test Button',
  input: 'Test Input',
  placeholder: 'Enter text here',
  label: 'Form Label',
  helperText: 'Helper text',
  errorText: 'Error message',
  successText: 'Success message',
  warningText: 'Warning message',
  loadingText: 'Loading...',
  emptyText: 'No data available',
} as const

/**
 * Common CSS classes to check in tests
 * Frequently tested Tailwind CSS classes
 */
export const commonClasses = {
  disabled: 'cursor-not-allowed',
  focus: 'focus:outline-none',
  hover: 'hover:',
  transition: 'transition',
  flex: 'flex',
  inlineFlex: 'inline-flex',
  hidden: 'hidden',
  visible: 'visible',
  rounded: 'rounded',
  border: 'border',
  shadow: 'shadow',
} as const

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
    nan: NaN,
  },
  arrays: {
    empty: [],
    single: [1],
    large: Array(1000).fill(0).map((_, i) => i),
  },
  objects: {
    empty: {},
    nested: { a: { b: { c: { d: 'deep' } } } },
  },
  // Test data for XSS/injection resistance - DO NOT USE IN PRODUCTION
  malicious: {
    html: '<script>alert("XSS")</script>',
    sql: "'; DROP TABLE users; --", // SQL injection test pattern
  },
} as const

/**
 * Common file types for upload testing
 */
export const fileTypes = {
  image: {
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
  },
  document: {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  },
  video: {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
  },
  audio: {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
  },
} as const

/**
 * Create a test file for upload testing
 * 
 * @param name - File name
 * @param content - File content (default: 'test content')
 * @param type - MIME type (default: 'text/plain')
 * @param size - File size override (optional, may not work in all environments)
 * @returns File object for testing
 * 
 * @example
 * const file = createTestFile('test.txt')
 * const image = createTestFile('test.png', 'image data', 'image/png')
 * 
 * @note Size override uses Object.defineProperty which may not work in all environments.
 * For reliable size testing, consider using actual file content to set size.
 */
export function createTestFile(
  name: string,
  content: string = 'test content',
  type: string = 'text/plain',
  size?: number
): File {
  const file = new File([content], name, { type })
  
  // Override size if provided (may not work in all JavaScript environments)
  if (size !== undefined) {
    try {
      Object.defineProperty(file, 'size', {
        value: size,
        writable: false,
      })
    } catch (e) {
      // Silently fail if defineProperty is not supported
      console.warn('File size override not supported in this environment')
    }
  }
  
  return file
}

/**
 * Create multiple test files
 * 
 * @param count - Number of files to create
 * @param namePrefix - Prefix for file names (default: 'file')
 * @returns Array of File objects
 * 
 * @example
 * const files = createTestFiles(3, 'image')
 * // Returns: [image-0.txt, image-1.txt, image-2.txt]
 */
export function createTestFiles(count: number, namePrefix: string = 'file'): File[] {
  return Array.from({ length: count }, (_, i) => 
    createTestFile(`${namePrefix}-${i}.txt`, `Content ${i}`)
  )
}
