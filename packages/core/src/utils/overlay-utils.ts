import { isTabKey, type KeyLikeEvent } from './a11y-utils'
import { isBrowser } from './env'

let bodyScrollLockCount = 0
let previousBodyOverflow = ''

type ComposedPathEvent = Event & {
  composedPath?: () => EventTarget[]
}

function getComposedPath(event: Event): EventTarget[] {
  const eventWithPath = event as ComposedPathEvent
  if (typeof eventWithPath.composedPath === 'function') {
    return eventWithPath.composedPath()
  }
  return []
}

function isNode(value: unknown): value is Node {
  return typeof Node !== 'undefined' && value instanceof Node
}

export type ElementLike = {
  contains: (node: Node) => boolean
}

export interface IsEventOutsideOptions {
  ignore?: Array<ElementLike | null | undefined>
}

export type MaskClickLikeEvent = {
  target: EventTarget | null
  currentTarget: EventTarget | null
}

export function shouldCloseOnMaskClick(event: MaskClickLikeEvent, maskClosable: boolean): boolean {
  return maskClosable && event.target === event.currentTarget
}

export function isEventOutside(
  event: Event,
  containers: Array<ElementLike | null | undefined>,
  options: IsEventOutsideOptions = {}
): boolean {
  const path = getComposedPath(event)
  const target = (event as { target?: unknown }).target

  const allContainers = [...containers, ...(options.ignore ?? [])].filter((el): el is ElementLike =>
    Boolean(el)
  )

  const isInsideAny = allContainers.some((container) => {
    if (path.length > 0 && path.includes(container as unknown as EventTarget)) {
      return true
    }

    if (isNode(target) && container.contains(target)) {
      return true
    }

    return false
  })

  return !isInsideAny
}

export function getFocusableElements(root: ParentNode): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ]

  const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')))

  return elements.filter((el) => {
    if (el.getAttribute('aria-hidden') === 'true') return false
    if (el.getAttribute('disabled') !== null) return false
    if (el.tabIndex < 0) return false
    return true
  })
}

export interface FocusTrapNavigation {
  shouldHandle: boolean
  next?: HTMLElement
}

export function getFocusTrapNavigation(
  event: KeyLikeEvent & { shiftKey?: boolean },
  focusables: HTMLElement[],
  activeElement: Element | null
): FocusTrapNavigation {
  if (!isTabKey(event)) return { shouldHandle: false }
  if (focusables.length === 0) return { shouldHandle: false }

  const currentIndex = activeElement ? focusables.findIndex((el) => el === activeElement) : -1

  const isShift = Boolean(event.shiftKey)

  if (currentIndex === -1) {
    return {
      shouldHandle: true,
      next: isShift ? focusables[focusables.length - 1] : focusables[0]
    }
  }

  const isFirst = currentIndex === 0
  const isLast = currentIndex === focusables.length - 1

  if (isShift && isFirst) {
    return { shouldHandle: true, next: focusables[focusables.length - 1] }
  }

  if (!isShift && isLast) {
    return { shouldHandle: true, next: focusables[0] }
  }

  return { shouldHandle: false }
}

export function lockBodyScroll(targetDocument?: Document): () => void {
  const resolvedDocument =
    targetDocument ?? (isBrowser() ? document : undefined)
  const body = resolvedDocument?.body
  if (!body) return () => undefined

  let active = true

  if (bodyScrollLockCount === 0) {
    previousBodyOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }

  bodyScrollLockCount += 1

  return () => {
    if (!active) return
    active = false
    bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1)

    if (bodyScrollLockCount === 0) {
      body.style.overflow = previousBodyOverflow
      previousBodyOverflow = ''
    }
  }
}

export function getBodyScrollLockCount(): number {
  return bodyScrollLockCount
}
