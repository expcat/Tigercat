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

/** Same-position cap. Older items are removed when a new one would exceed it. */
export const DEFAULT_TOAST_MAX_PER_POSITION = 5

export interface ToastQueueItem {
  id: string | number
  duration: number
  onClose?: () => void
}

export interface ToastQueueOptions<T extends ToastQueueItem> {
  /** Defaults to {@link DEFAULT_TOAST_MAX_PER_POSITION}. `Infinity` disables the cap. */
  maxPerGroup?: number
  groupOf?: (item: T) => string
}

export interface ToastQueue<T extends ToastQueueItem> {
  add: (item: Omit<T, 'id'> & { id?: string | number }) => T | null
  remove: (id: string | number) => boolean
  clear: () => void
  /** Freeze the auto-close clock while the pointer or focus is on the item. */
  pause: (id: string | number) => void
  resume: (id: string | number) => void
  getSnapshot: () => readonly T[]
  getServerSnapshot: () => readonly T[]
  subscribe: (listener: () => void) => () => void
}

interface ToastTimerMeta {
  timer?: ImperativeTimeoutId
  remaining: number
  startedAt: number
  paused: boolean
  /** Pointer and focus each hold the clock. It runs only when both are gone. */
  holds: number
}

export function createToastQueue<T extends ToastQueueItem>(
  hooks: ImperativeTimerHooks = {},
  options: ToastQueueOptions<T> = {}
): ToastQueue<T> {
  let items: T[] = []
  const listeners = new Set<() => void>()
  const timers = new Map<string | number, ToastTimerMeta>()
  const nextId = createInstanceCounter()
  const maxPerGroup = options.maxPerGroup ?? DEFAULT_TOAST_MAX_PER_POSITION
  const groupOf = options.groupOf ?? (() => '')
  const schedule =
    hooks.setTimeout ?? ((handler, timeout) => globalThis.setTimeout(handler, timeout))
  const cancel = hooks.clearTimeout ?? ((id) => globalThis.clearTimeout(id))
  const now = () => Date.now()

  function canMutate(): boolean {
    return isBrowser() || Boolean(hooks.setTimeout)
  }

  function emit(): void {
    listeners.forEach((listener) => listener())
  }

  function clearTimer(id: string | number): void {
    const meta = timers.get(id)
    if (!meta) return
    if (meta.timer !== undefined) cancel(meta.timer)
    timers.delete(id)
  }

  function arm(id: string | number, duration: number, holds = 0): void {
    clearTimer(id)
    if (!(duration > 0)) return
    const meta: ToastTimerMeta = {
      remaining: duration,
      startedAt: now(),
      paused: holds > 0,
      holds
    }
    if (holds <= 0) {
      meta.timer = schedule(() => {
        timers.delete(id)
        remove(id)
      }, duration)
    }
    timers.set(id, meta)
  }

  function invokeClose(item: T | undefined): void {
    if (!item?.onClose) return
    try {
      item.onClose()
    } catch (error) {
      devWarn(
        'toast.onClose',
        `[Tigercat] onClose threw after the toast was removed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  function dropOldest(group: string, spareId: string | number): void {
    if (!Number.isFinite(maxPerGroup)) return
    const grouped = items.filter((item) => groupOf(item) === group)
    const overflow = grouped.length - maxPerGroup
    if (overflow <= 0) return
    const victims = grouped.filter((item) => item.id !== spareId).slice(0, overflow)
    victims.forEach((item) => remove(item.id))
  }

  function add(item: Omit<T, 'id'> & { id?: string | number }): T | null {
    if (!canMutate()) return null
    const instance = { ...item, id: item.id ?? nextId() } as T
    const existing = items.findIndex((entry) => entry.id === instance.id)
    const holds = existing >= 0 ? (timers.get(instance.id)?.holds ?? 0) : 0
    if (existing >= 0) {
      clearTimer(instance.id)
      items = items.map((entry) => (entry.id === instance.id ? instance : entry))
    } else {
      items = [...items, instance]
    }
    arm(instance.id, instance.duration, holds)
    emit()
    if (existing < 0) dropOldest(groupOf(instance), instance.id)
    return instance
  }

  function remove(id: string | number): boolean {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return false
    clearTimer(id)
    const instance = items[index]
    items = items.filter((item) => item.id !== id)
    emit()
    invokeClose(instance)
    return true
  }

  function pause(id: string | number): void {
    const meta = timers.get(id)
    if (!meta) return
    meta.holds += 1
    if (meta.holds > 1 || meta.paused) return
    const elapsed = now() - meta.startedAt
    meta.remaining = Math.max(0, meta.remaining - elapsed)
    if (meta.timer !== undefined) cancel(meta.timer)
    meta.timer = undefined
    meta.paused = true
  }

  function resume(id: string | number): void {
    const meta = timers.get(id)
    if (!meta || meta.holds <= 0) return
    meta.holds -= 1
    if (meta.holds > 0 || !meta.paused) return
    if (meta.remaining <= 0) {
      timers.delete(id)
      remove(id)
      return
    }
    meta.paused = false
    meta.startedAt = now()
    meta.timer = schedule(() => {
      timers.delete(id)
      remove(id)
    }, meta.remaining)
  }

  function clear(): void {
    const closing = items
    items = []
    timers.forEach((meta) => {
      if (meta.timer !== undefined) cancel(meta.timer)
    })
    timers.clear()
    emit()
    closing.forEach((item) => invokeClose(item))
  }

  return {
    add,
    remove,
    clear,
    pause,
    resume,
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
