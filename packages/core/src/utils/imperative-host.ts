/**
 * Shared imperative host lifecycle and toast queue.
 *
 * Message / Notification / LoadingBar use this so Vue and React only render
 * containers. Queue, duration timers, mount targets, and SSR no-ops live here.
 */

import { resolveAnchoredOverlayTarget } from './anchored-overlay'
import { createInstanceCounter } from './imperative-api'
import { devWarn } from './dev-warn'
import { isBrowser } from './env'

export type ImperativeTimeoutId = ReturnType<typeof setTimeout>

export interface ImperativeTimerHooks {
  setTimeout?: (handler: () => void, timeout: number) => ImperativeTimeoutId
  clearTimeout?: (id: ImperativeTimeoutId) => void
}

export interface ImperativeHostAdapter<THandle> {
  mount: (element: HTMLElement) => THandle
  unmount: (handle: THandle, element: HTMLElement) => void
}

export interface ImperativeHost<THandle> {
  ensure: (container?: string | HTMLElement) => THandle | null
  scheduleEnsure: (container?: string | HTMLElement, shouldMount?: () => boolean) => void
  teardown: () => void
  getHandle: () => THandle | null
  getElement: () => HTMLElement | null
  isMounted: () => boolean
}

const EMPTY_TOASTS: never[] = []

/**
 * Resolve the mount parent for an imperative host.
 *
 * Omitted container follows the overlay-host chain. Illegal selectors warn and
 * fall back to that chain. A selector that matches nothing does not silently
 * remount on `document.body`.
 */
export function resolveImperativeMountTarget(
  container?: string | HTMLElement,
  reference: HTMLElement | null = null
): HTMLElement | null {
  if (!isBrowser()) return null

  if (container instanceof HTMLElement) return container

  if (typeof container === 'string') {
    let found: Element | null = null
    try {
      found = document.querySelector(container)
    } catch {
      devWarn(
        'imperative-host.container.invalid',
        `[Tigercat] Invalid container selector "${container}". Falling back to the overlay host.`
      )
      return resolveAnchoredOverlayTarget(reference)
    }
    if (found instanceof HTMLElement) return found
    devWarn(
      'imperative-host.container.missing',
      `[Tigercat] Container "${container}" was not found. The host was not remounted onto document.body.`
    )
    return null
  }

  return resolveAnchoredOverlayTarget(reference)
}

export function createImperativeHost<THandle>(
  adapter: ImperativeHostAdapter<THandle>
): ImperativeHost<THandle> {
  let handle: THandle | null = null
  let element: HTMLElement | null = null
  let parent: HTMLElement | null = null
  let ensureScheduled = false
  let pendingContainer: string | HTMLElement | undefined

  function isElementLive(): boolean {
    return Boolean(element?.isConnected)
  }

  function teardown(): void {
    const currentHandle = handle
    const currentElement = element
    handle = null
    element = null
    parent = null
    if (currentHandle && currentElement) {
      adapter.unmount(currentHandle, currentElement)
    }
    currentElement?.parentNode?.removeChild(currentElement)
  }

  function ensure(container?: string | HTMLElement): THandle | null {
    if (!isBrowser()) return null

    const target = resolveImperativeMountTarget(container)
    if (!target) return isElementLive() ? handle : null

    if (handle && (!isElementLive() || parent !== target)) {
      teardown()
    }

    if (handle) return handle

    const hostElement = document.createElement('div')
    hostElement.setAttribute('data-tiger-imperative-host', '')
    target.appendChild(hostElement)
    element = hostElement
    parent = target
    handle = adapter.mount(hostElement)
    return handle
  }

  function scheduleEnsure(container?: string | HTMLElement, shouldMount?: () => boolean): void {
    if (!isBrowser()) return
    pendingContainer = container
    if (ensureScheduled) return
    ensureScheduled = true
    queueMicrotask(() => {
      ensureScheduled = false
      const nextContainer = pendingContainer
      if (shouldMount && !shouldMount()) return
      ensure(nextContainer)
    })
  }

  return {
    ensure,
    scheduleEnsure,
    teardown,
    getHandle: () => (isElementLive() ? handle : null),
    getElement: () => (isElementLive() ? element : null),
    isMounted: () => Boolean(handle && isElementLive())
  }
}

export interface ToastQueueItem {
  id: string | number
  duration: number
  onClose?: () => void
}

export interface ToastQueue<T extends ToastQueueItem> {
  add: (item: Omit<T, 'id'> & { id?: string | number }) => T | null
  remove: (id: string | number) => boolean
  clear: () => void
  getSnapshot: () => readonly T[]
  getServerSnapshot: () => readonly T[]
  subscribe: (listener: () => void) => () => void
}

export function createToastQueue<T extends ToastQueueItem>(
  hooks: ImperativeTimerHooks = {}
): ToastQueue<T> {
  let items: T[] = []
  const listeners = new Set<() => void>()
  const timeouts = new Map<string | number, ImperativeTimeoutId>()
  const nextId = createInstanceCounter()
  const schedule =
    hooks.setTimeout ?? ((handler, timeout) => globalThis.setTimeout(handler, timeout))
  const cancel = hooks.clearTimeout ?? ((id) => globalThis.clearTimeout(id))

  function canMutate(): boolean {
    return isBrowser() || Boolean(hooks.setTimeout)
  }

  function emit(): void {
    listeners.forEach((listener) => listener())
  }

  function clearTimer(id: string | number): void {
    const timer = timeouts.get(id)
    if (timer === undefined) return
    cancel(timer)
    timeouts.delete(id)
  }

  function add(item: Omit<T, 'id'> & { id?: string | number }): T | null {
    if (!canMutate()) return null
    const instance = { ...item, id: item.id ?? nextId() } as T
    items = [...items, instance]
    if (instance.duration > 0) {
      timeouts.set(
        instance.id,
        schedule(() => {
          timeouts.delete(instance.id)
          remove(instance.id)
        }, instance.duration)
      )
    }
    emit()
    return instance
  }

  function remove(id: string | number): boolean {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return false
    clearTimer(id)
    const instance = items[index]
    items = items.filter((item) => item.id !== id)
    instance.onClose?.()
    emit()
    return true
  }

  function clear(): void {
    const closing = items
    items = []
    timeouts.forEach((timer) => cancel(timer))
    timeouts.clear()
    closing.forEach((item) => item.onClose?.())
    emit()
  }

  return {
    add,
    remove,
    clear,
    getSnapshot: () => items,
    getServerSnapshot: () => EMPTY_TOASTS as T[],
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }
}

export function shouldHandleToastSurfaceEvent(event: {
  target: EventTarget | null
  currentTarget: EventTarget | null
}): boolean {
  const target = event.target
  if (!(target instanceof Element)) return event.target === event.currentTarget
  return target.closest('button, a, input, textarea, select, [role="button"]') === null
}

export function getToastItemRole(type: string): 'alert' | 'status' {
  return type === 'error' ? 'alert' : 'status'
}
