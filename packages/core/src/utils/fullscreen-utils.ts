/**
 * Browser Fullscreen API helpers. SSR is a no-op: `supported` is false and
 * enter/exit resolve without throwing.
 */

import { isBrowser } from './env'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

export function isFullscreenSupported(): boolean {
  if (!isBrowser()) return false
  const el = document.documentElement as FullscreenElement
  return (
    typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function'
  )
}

export function getFullscreenElement(): Element | null {
  if (!isBrowser()) return null
  const doc = document as FullscreenDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export function isElementFullscreen(target: Element | null | undefined): boolean {
  const current = getFullscreenElement()
  if (!current) return false
  if (!target) return true
  return current === target
}

export async function requestElementFullscreen(target: Element): Promise<void> {
  if (!isBrowser()) return
  const el = target as FullscreenElement
  if (typeof el.requestFullscreen === 'function') {
    await el.requestFullscreen()
    return
  }
  if (typeof el.webkitRequestFullscreen === 'function') {
    await el.webkitRequestFullscreen()
    return
  }
  throw new Error('Fullscreen is not supported')
}

/**
 * Leave fullscreen only when `target` is the current fullscreen element.
 * Omit `target` to exit whatever is fullscreen. A different target is a no-op.
 */
export async function exitElementFullscreen(target?: Element | null): Promise<void> {
  if (!isBrowser()) return
  const current = getFullscreenElement()
  if (!current) return
  if (target != null && current !== target) return
  const doc = document as FullscreenDocument
  if (typeof document.exitFullscreen === 'function') {
    await document.exitFullscreen()
    return
  }
  if (typeof doc.webkitExitFullscreen === 'function') {
    await doc.webkitExitFullscreen()
  }
}

export function subscribeFullscreenChange(onChange: () => void): () => void {
  if (!isBrowser()) return () => undefined
  document.addEventListener('fullscreenchange', onChange)
  document.addEventListener('webkitfullscreenchange', onChange)
  return () => {
    document.removeEventListener('fullscreenchange', onChange)
    document.removeEventListener('webkitfullscreenchange', onChange)
  }
}

export function resolveFullscreenTarget(
  target: Element | (() => Element | null | undefined) | null | undefined
): Element | null {
  if (!isBrowser()) return null
  if (typeof target === 'function') {
    try {
      return target() ?? document.documentElement
    } catch {
      return document.documentElement
    }
  }
  return target ?? document.documentElement
}

export const fullscreenButtonClasses =
  'inline-flex items-center justify-center min-h-9 min-w-9 rounded-[var(--tiger-radius-md)] text-[var(--tiger-text)] hover:bg-[var(--tiger-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 disabled:opacity-50 disabled:cursor-not-allowed'
