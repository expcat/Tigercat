import { vi } from 'vitest'

/**
 * Mock ResizeObserver for tests that need to observe element size changes.
 *
 * Supports two modes:
 * - Simple: no callback, just tracks observe/disconnect calls (e.g. Affix)
 * - Full: with callback + trigger(width, height) to simulate resize events (e.g. ChartCanvas)
 *
 * @example
 * beforeEach(() => {
 *   MockResizeObserver.reset()
 *   vi.stubGlobal('ResizeObserver', MockResizeObserver)
 * })
 */
export class MockResizeObserver implements ResizeObserver {
  static instances: MockResizeObserver[] = []

  private callback: ResizeObserverCallback | null
  private target: Element | null = null

  observe = vi.fn((target: Element) => {
    this.target = target
  })
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [] as ResizeObserverEntry[])

  constructor(callback?: ResizeObserverCallback) {
    this.callback = callback ?? null
    MockResizeObserver.instances.push(this)
  }

  trigger(width: number, height: number) {
    const target = this.target ?? document.createElement('div')
    this.callback?.(
      [
        {
          target,
          contentRect: new DOMRect(0, 0, width, height)
        } as ResizeObserverEntry
      ],
      this
    )
  }

  static reset() {
    MockResizeObserver.instances = []
  }
}

/**
 * Mock IntersectionObserver for tests that need to observe element visibility.
 *
 * Call `trigger(entry)` to simulate intersection changes.
 *
 * @example
 * beforeEach(() => {
 *   MockIntersectionObserver.reset()
 *   vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
 * })
 */
export class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  readonly root: Element | Document | null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>

  private callback: IntersectionObserverCallback
  private target: Element | null = null

  observe = vi.fn((target: Element) => {
    this.target = target
  })
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[])

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback
    this.root = (options.root as Element | Document | null) ?? null
    this.rootMargin = options.rootMargin ?? '0px'
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0]
    MockIntersectionObserver.instances.push(this)
  }

  trigger(entry: Partial<IntersectionObserverEntry>) {
    const target = this.target ?? document.createElement('div')
    const record: IntersectionObserverEntry = {
      time: 0,
      target,
      rootBounds: new DOMRect(0, 0, 100, 600),
      boundingClientRect: new DOMRect(),
      intersectionRect: new DOMRect(),
      isIntersecting: false,
      intersectionRatio: 0,
      ...entry
    }

    this.callback([record], this)
  }

  static reset() {
    MockIntersectionObserver.instances = []
  }
}
