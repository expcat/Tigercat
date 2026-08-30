import { isBrowser } from './env'

export interface KeyLikeEvent {
  key?: string
  code?: string
  keyCode?: number
  which?: number
}

export function isEnterKey(event: KeyLikeEvent): boolean {
  if (event.key === 'Enter' || event.code === 'Enter') return true
  const keyCode = event.keyCode ?? event.which
  return keyCode === 13
}

export function isSpaceKey(event: KeyLikeEvent): boolean {
  if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') return true
  const keyCode = event.keyCode ?? event.which
  return keyCode === 32
}

export function isActivationKey(event: KeyLikeEvent): boolean {
  return isEnterKey(event) || isSpaceKey(event)
}

export function isEscapeKey(event: KeyLikeEvent): boolean {
  if (event.key === 'Escape' || event.code === 'Escape') return true
  const keyCode = event.keyCode ?? event.which
  return keyCode === 27
}

export function isTabKey(event: KeyLikeEvent): boolean {
  if (event.key === 'Tab' || event.code === 'Tab') return true
  const keyCode = event.keyCode ?? event.which
  return keyCode === 9
}

let ariaIdCounter = 0

export interface CreateAriaIdOptions {
  prefix?: string
  separator?: string
}

export function createAriaId(options: CreateAriaIdOptions = {}): string {
  const prefix = options.prefix ?? 'tigercat'
  const separator = options.separator ?? '-'
  ariaIdCounter += 1
  return `${prefix}${separator}${ariaIdCounter}`
}

export function resetAriaIdCounter(): void {
  ariaIdCounter = 0
}

// ----- Screen Reader Announcements -----

export type AriaLiveLevel = 'polite' | 'assertive' | 'off'

function getOrCreateLiveRegion(level: AriaLiveLevel): HTMLElement {
  const id = `tigercat-live-region-${level}`
  let el = document.getElementById(id)
  if (el) return el

  el = document.createElement('div')
  el.id = id
  el.setAttribute('aria-live', level)
  el.setAttribute('aria-atomic', 'true')
  el.setAttribute('role', level === 'assertive' ? 'alert' : 'status')
  Object.assign(el.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  })
  document.body.appendChild(el)
  return el
}

export function announceToScreenReader(message: string, level: AriaLiveLevel = 'polite'): void {
  if (!isBrowser()) return

  const region = getOrCreateLiveRegion(level)
  // Clear first to ensure re-announcing the same message works
  region.textContent = ''
  // Use rAF for reliable announcement timing
  requestAnimationFrame(() => {
    region.textContent = message
  })
}

export interface LiveRegion {
  announce: (message: string) => void
  clear: () => void
  destroy: () => void
}

export function manageLiveRegion(level: AriaLiveLevel = 'polite'): LiveRegion {
  if (!isBrowser()) {
    return {
      announce() {},
      clear() {},
      destroy() {}
    }
  }

  const region = getOrCreateLiveRegion(level)

  return {
    announce(message: string) {
      region.textContent = ''
      requestAnimationFrame(() => {
        region.textContent = message
      })
    },
    clear() {
      region.textContent = ''
    },
    destroy() {
      region.remove()
    }
  }
}
