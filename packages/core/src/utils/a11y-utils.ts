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

// ----- Focus Trap -----

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null
  returnFocusOnDeactivate?: boolean
  escapeDeactivates?: boolean
  onEscape?: () => void
}

export interface FocusTrap {
  activate: () => void
  deactivate: () => void
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null
  )
}

export function createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}): FocusTrap {
  const {
    initialFocus = null,
    returnFocusOnDeactivate = true,
    escapeDeactivates = true,
    onEscape
  } = options

  let previouslyFocused: HTMLElement | null = null
  let active = false

  function handleKeyDown(e: KeyboardEvent): void {
    if (!active) return

    if (e.key === 'Escape' && escapeDeactivates) {
      e.preventDefault()
      onEscape?.()
      return
    }

    if (e.key !== 'Tab') return

    const focusable = getFocusableElements(container)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last || !container.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return {
    activate() {
      if (active) return
      active = true
      previouslyFocused = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', handleKeyDown, true)

      if (initialFocus) {
        initialFocus.focus()
      } else {
        const focusable = getFocusableElements(container)
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }
    },
    deactivate() {
      if (!active) return
      active = false
      document.removeEventListener('keydown', handleKeyDown, true)

      if (returnFocusOnDeactivate && previouslyFocused) {
        previouslyFocused.focus()
        previouslyFocused = null
      }
    }
  }
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
