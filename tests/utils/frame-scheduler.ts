import { vi } from 'vitest'

/**
 * Controllable requestAnimationFrame scheduler for testing code
 * that accepts a `{ requestFrame, cancelFrame }` dependency.
 *
 * Does NOT stub globals — the returned object is passed directly
 * to the function under test.
 *
 * @example
 * const scheduler = createFrameScheduler()
 * const ctrl = createCarouselAutoplay({ ...opts, requestFrame: scheduler.requestFrame, cancelFrame: scheduler.cancelFrame })
 * scheduler.flush(1000) // simulate timestamp
 */
export function createFrameScheduler() {
  let nextHandle = 1
  const callbacks = new Map<number, (timestamp: number) => void>()

  return {
    requestFrame(callback: (timestamp: number) => void) {
      const handle = nextHandle
      nextHandle += 1
      callbacks.set(handle, callback)
      return handle
    },
    cancelFrame(handle: number) {
      callbacks.delete(handle)
    },
    flush(timestamp = 0) {
      const frameCallbacks = [...callbacks.values()]
      callbacks.clear()
      frameCallbacks.forEach((callback) => callback(timestamp))
    },
    pendingCount() {
      return callbacks.size
    }
  }
}

export type FrameScheduler = ReturnType<typeof createFrameScheduler>

/**
 * Controllable requestAnimationFrame mock that auto-stubs globals.
 *
 * Call `flush(timestamp)` to run all pending frame callbacks.
 * Call `vi.unstubAllGlobals()` in afterEach to clean up.
 *
 * @example
 * const scheduler = installFrameScheduler()
 * // ... trigger code that calls requestAnimationFrame ...
 * scheduler.flush()
 */
export function installFrameScheduler() {
  let nextHandle = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const handle = nextHandle
    nextHandle += 1
    callbacks.set(handle, callback)
    return handle
  })
  const cancelAnimationFrame = vi.fn((handle: number) => {
    callbacks.delete(handle)
  })

  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame)
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame)

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    flush(timestamp = 0) {
      const frameCallbacks = [...callbacks.values()]
      callbacks.clear()
      frameCallbacks.forEach((callback) => callback(timestamp))
    },
    pendingCount() {
      return callbacks.size
    }
  }
}

export type InstalledFrameScheduler = ReturnType<typeof installFrameScheduler>
