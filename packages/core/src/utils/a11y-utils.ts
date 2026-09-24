import { isBrowser } from './env'

export interface KeyLikeEvent {
  key?: string
}

export function isEnterKey(event: KeyLikeEvent): boolean {
  return event.key === 'Enter'
}

export function isSpaceKey(event: KeyLikeEvent): boolean {
  return event.key === ' '
}

export function isActivationKey(event: KeyLikeEvent): boolean {
  return isEnterKey(event) || isSpaceKey(event)
}

export function isEscapeKey(event: KeyLikeEvent): boolean {
  return event.key === 'Escape'
}

export function isTabKey(event: KeyLikeEvent): boolean {
  return event.key === 'Tab'
}

export interface CreateAriaIdOptions {
  prefix?: string
  separator?: string
}

export interface AriaIdScope {
  next(options?: CreateAriaIdOptions): string
}

/** Per-root id generator. Server and client each start at zero for the scope they own. */
export function createAriaIdScope(): AriaIdScope {
  let counter = 0
  return {
    next(options: CreateAriaIdOptions = {}) {
      const prefix = options.prefix ?? 'tigercat'
      const separator = options.separator ?? '-'
      counter += 1
      return `${prefix}${separator}${counter}`
    }
  }
}

// ----- Screen Reader Announcements -----

export type AriaLiveLevel = 'polite' | 'assertive' | 'off'

const LIVE_REGION_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: '0'
}

function createLiveRegionElement(level: AriaLiveLevel): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('data-tiger-live-region', level)
  el.setAttribute('aria-live', level)
  el.setAttribute('aria-atomic', 'true')
  if (level === 'polite') {
    el.setAttribute('role', 'status')
  }
  Object.assign(el.style, LIVE_REGION_STYLE)
  return el
}

export interface LiveRegion {
  /** The element this announcer owns. Null outside the browser. */
  element: HTMLElement | null
  announce: (message: string) => void
  clear: () => void
  destroy: () => void
}

/**
 * Caller-owned live region. Each call creates its own node.
 * `destroy` removes only that node and cancels a pending announcement frame.
 */
export function manageLiveRegion(level: AriaLiveLevel = 'polite'): LiveRegion {
  if (!isBrowser()) {
    return {
      element: null,
      announce() {},
      clear() {},
      destroy() {}
    }
  }

  const region = createLiveRegionElement(level)
  document.body.appendChild(region)
  let frame = 0
  let destroyed = false

  const cancelFrame = () => {
    if (!frame) return
    cancelAnimationFrame(frame)
    frame = 0
  }

  return {
    element: region,
    announce(message: string) {
      if (destroyed) return
      cancelFrame()
      region.textContent = ''
      frame = requestAnimationFrame(() => {
        frame = 0
        if (destroyed) return
        region.textContent = message
      })
    },
    clear() {
      if (destroyed) return
      cancelFrame()
      region.textContent = ''
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      cancelFrame()
      region.remove()
    }
  }
}
