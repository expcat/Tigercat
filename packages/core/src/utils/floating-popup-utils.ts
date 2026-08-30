/**
 * Shared utilities for floating-popup components (Tooltip, Popover, Popconfirm).
 *
 * Provides:
 * - Auto-incrementing ID factory for aria-* attributes
 * - Trigger-handler builder (maps trigger type → event handler map)
 * - Hover delay controller so trigger + floating layer act as one hover group
 */

import type { FloatingTrigger } from '../types/floating-popup'
import { createAriaId } from './a11y-utils'

/**
 * Hide delay after the pointer leaves the trigger / floating layer.
 * 100ms is enough to cross the default 8px offset gap.
 */
export const DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS = 100

/**
 * Show delay after the pointer enters the hover group.
 * 0 keeps existing hover-show tests / UX (open immediately).
 */
export const DEFAULT_FLOATING_HOVER_SHOW_DELAY_MS = 0

export interface FloatingHoverDelayControllerOptions {
  show: () => void
  hide: () => void
  hideDelay?: number
  showDelay?: number
}

export interface FloatingHoverDelayController {
  /** Cancel pending hide and show (immediately when showDelay is 0). */
  enter: () => void
  /** Cancel pending show and hide after hideDelay. */
  leave: () => void
  /** Clear both timers without changing visibility. */
  cancel: () => void
  /** Alias of `cancel` for unmount. */
  dispose: () => void
  /** Clear timers and hide immediately (Esc / outside / click-toggle off). */
  closeNow: () => void
}

/**
 * Tiny hover-group delay controller for teleported floating layers.
 *
 * `enter` / `leave` are intended for both the trigger and the floating root so
 * the pointer can cross the offset gap without the layer unmounting.
 */
export function createFloatingHoverDelayController(
  options: FloatingHoverDelayControllerOptions
): FloatingHoverDelayController {
  const hideDelay = options.hideDelay ?? DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS
  const showDelay = options.showDelay ?? DEFAULT_FLOATING_HOVER_SHOW_DELAY_MS
  let showTimer: ReturnType<typeof setTimeout> | null = null
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  const clearShowTimer = (): void => {
    if (showTimer === null) return
    clearTimeout(showTimer)
    showTimer = null
  }

  const clearHideTimer = (): void => {
    if (hideTimer === null) return
    clearTimeout(hideTimer)
    hideTimer = null
  }

  const cancel = (): void => {
    clearShowTimer()
    clearHideTimer()
  }

  const enter = (): void => {
    clearHideTimer()
    if (showDelay <= 0) {
      clearShowTimer()
      options.show()
      return
    }
    if (showTimer !== null) return
    showTimer = setTimeout(() => {
      showTimer = null
      options.show()
    }, showDelay)
  }

  const leave = (): void => {
    clearShowTimer()
    if (hideDelay <= 0) {
      clearHideTimer()
      options.hide()
      return
    }
    if (hideTimer !== null) return
    hideTimer = setTimeout(() => {
      hideTimer = null
      options.hide()
    }, hideDelay)
  }

  const closeNow = (): void => {
    cancel()
    options.hide()
  }

  return { enter, leave, cancel, dispose: cancel, closeNow }
}

/**
 * Create an auto-incrementing ID generator for a given component prefix.
 *
 * @example
 * ```ts
 * const createId = createFloatingIdFactory('tooltip')
 * createId() // 'tiger-tooltip-1'
 * createId() // 'tiger-tooltip-2'
 * ```
 */
export function createFloatingIdFactory(prefix: string): () => string {
  return () => createAriaId({ prefix: `tiger-${prefix}` })
}

/**
 * Describes a set of event-handler names produced by `buildTriggerHandlerMap`.
 * The actual values are determined by the caller (Vue or React).
 */
export interface TriggerHandlerMap<H> {
  onClick?: H
  onMouseenter?: H
  onMouseleave?: H
  onMouseEnter?: H
  onMouseLeave?: H
  onFocus?: H
  onBlur?: H
  onFocusin?: H
  onFocusout?: H
}

/**
 * Build a trigger-handler map for a given trigger type.
 * Returns *only* the keys relevant to `trigger`; the caller supplies the
 * handler functions so this stays framework-agnostic.
 *
 * @param trigger   - Current trigger type
 * @param handlers  - Named handler functions keyed by action
 * @param framework - 'vue' | 'react' (differences: casing & focusin/focusout)
 */
export function buildTriggerHandlerMap<H>(
  trigger: FloatingTrigger,
  handlers: {
    toggle: H
    show: H
    hide: H
  },
  framework: 'vue' | 'react' = 'vue'
): Record<string, H> {
  switch (trigger) {
    case 'click':
      return { onClick: handlers.toggle }

    case 'hover':
      return framework === 'vue'
        ? { onMouseenter: handlers.show, onMouseleave: handlers.hide }
        : { onMouseEnter: handlers.show, onMouseLeave: handlers.hide }

    case 'focus':
      return framework === 'vue'
        ? { onFocusin: handlers.show, onFocusout: handlers.hide }
        : { onFocus: handlers.show, onBlur: handlers.hide }

    case 'manual':
    default:
      return {}
  }
}
