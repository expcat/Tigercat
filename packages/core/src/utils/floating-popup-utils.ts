/**
 * Shared utilities for floating-popup components (Tooltip, Popover, Popconfirm).
 *
 * Provides:
 * - Auto-incrementing ID factory for aria-* attributes
 * - Trigger-handler builder (maps trigger type → event handler map)
 * - Hover delay controller so trigger + floating layer act as one hover group
 */

import type { FloatingTrigger } from '../types/floating-popup'
import { createAriaIdScope } from './a11y-utils'

/**
 * Hide delay after the pointer leaves the trigger / floating layer.
 * 100ms is enough to cross the default 8px offset gap.
 */
export const DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS = 100

/**
 * Show delay after the pointer enters the hover group.
 * A positive default avoids opening a tooltip on every pointer pass.
 */
export const DEFAULT_FLOATING_HOVER_SHOW_DELAY_MS = 100

/** After one tooltip opens, the next one in the group skips show delay. */
export const TOOLTIP_DELAY_SKIP_MS = 300

export interface TooltipDelayGroup {
  shouldSkip: (now?: number) => boolean
  noteOpen: (now?: number) => void
}

export function createTooltipDelayGroup(windowMs = TOOLTIP_DELAY_SKIP_MS): TooltipDelayGroup {
  let lastOpen = 0
  return {
    shouldSkip(now = Date.now()) {
      return lastOpen > 0 && now - lastOpen < windowMs
    },
    noteOpen(now = Date.now()) {
      lastOpen = now
    }
  }
}

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
  const scope = createAriaIdScope()
  return () => scope.next({ prefix: `tiger-${prefix}` })
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

export type OverlayPopupTrigger = FloatingTrigger

export type OverlayPopupDismissReason = 'escape' | 'outside' | 'blur' | 'tab' | 'toggle'

export interface OverlayPopupControllerOptions {
  /** `undefined` means uncontrolled. */
  getControlledOpen: () => boolean | undefined
  getDefaultOpen?: () => boolean
  getDisabled: () => boolean
  getTrigger: () => OverlayPopupTrigger
  getShowDelay?: () => number | undefined
  getHideDelay?: () => number | undefined
  /** A recently opened sibling tooltip skips the show delay. */
  getSkipShowDelay?: () => boolean
  /** Called when the popup actually opens. */
  onShown?: () => void
  /** Popconfirm ignores dismiss while its confirm promise is pending. */
  isDismissLocked?: () => boolean
  /** Focus is inside the trigger, so a pointer leave keeps a hover popup open. */
  isFocusWithinTrigger?: () => boolean
  onOpenChange?: (open: boolean) => void
  setTimeout?: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>
  clearTimeout?: (id: ReturnType<typeof setTimeout>) => void
}

export interface OverlayPopupController {
  getOpen: () => boolean
  subscribe: (listener: () => void) => () => void
  pointerEnter: () => void
  pointerLeave: () => void
  focusEnter: () => void
  focusLeave: (relatedInside: boolean) => void
  /** Click trigger toggles. Hover click opens and stays. */
  activate: () => void
  /** Absolute open/close. Close is ignored while dismiss is locked. */
  setOpen: (next: boolean) => boolean
  requestClose: (reason: OverlayPopupDismissReason) => boolean
  syncDisabled: () => void
  dispose: () => void
}

/**
 * One open/close controller for Tooltip, Popover, and Popconfirm.
 * Frameworks bind refs and events; they do not keep a second timer or escape path.
 */
export function createOverlayPopupController(
  options: OverlayPopupControllerOptions
): OverlayPopupController {
  const listeners = new Set<() => void>()
  let uncontrolledOpen = options.getDefaultOpen?.() ?? false
  let pointerInside = false
  let focusInside = false
  let showTimer: ReturnType<typeof setTimeout> | null = null
  let hideTimer: ReturnType<typeof setTimeout> | null = null
  const schedule = options.setTimeout ?? ((handler, timeout) => setTimeout(handler, timeout))
  const cancelTimer = options.clearTimeout ?? ((id) => clearTimeout(id))

  function emit(): void {
    listeners.forEach((listener) => listener())
  }

  function showDelay(): number {
    if (options.getSkipShowDelay?.()) return 0
    const value = options.getShowDelay?.()
    return value === undefined ? DEFAULT_FLOATING_HOVER_SHOW_DELAY_MS : value
  }

  function hideDelay(): number {
    const value = options.getHideDelay?.()
    return value === undefined ? DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS : value
  }

  function clearShow(): void {
    if (showTimer === null) return
    cancelTimer(showTimer)
    showTimer = null
  }

  function clearHide(): void {
    if (hideTimer === null) return
    cancelTimer(hideTimer)
    hideTimer = null
  }

  function getOpen(): boolean {
    if (options.getDisabled()) return false
    const controlled = options.getControlledOpen()
    if (controlled !== undefined) return controlled
    return uncontrolledOpen
  }

  function commit(next: boolean): boolean {
    if (options.getDisabled() && next) return false
    if (!next && options.isDismissLocked?.()) return false
    const controlled = options.getControlledOpen()
    if (controlled === undefined) {
      if (uncontrolledOpen === next) return true
      uncontrolledOpen = next
    } else if (controlled === next) {
      return true
    }
    options.onOpenChange?.(next)
    if (next) options.onShown?.()
    emit()
    return true
  }

  function openSoon(): void {
    clearHide()
    if (getOpen() || options.getDisabled()) return
    const delay = showDelay()
    if (delay <= 0) {
      clearShow()
      commit(true)
      return
    }
    if (showTimer !== null) return
    showTimer = schedule(() => {
      showTimer = null
      if (options.getDisabled()) return
      commit(true)
    }, delay)
  }

  function closeSoon(): void {
    clearShow()
    if (!getOpen()) return
    if (options.isDismissLocked?.()) return
    const delay = hideDelay()
    if (delay <= 0) {
      clearHide()
      commit(false)
      return
    }
    if (hideTimer !== null) return
    hideTimer = schedule(() => {
      hideTimer = null
      if (pointerInside || focusInside) return
      commit(false)
    }, delay)
  }

  function pointerEnter(): void {
    if (options.getTrigger() !== 'hover') return
    pointerInside = true
    openSoon()
  }

  function pointerLeave(): void {
    if (options.getTrigger() !== 'hover') return
    pointerInside = false
    if (focusInside || options.isFocusWithinTrigger?.()) {
      clearShow()
      clearHide()
      return
    }
    closeSoon()
  }

  function focusEnter(): void {
    const trigger = options.getTrigger()
    if (trigger !== 'hover' && trigger !== 'focus') return
    focusInside = true
    clearHide()
    if (options.getDisabled()) return
    clearShow()
    commit(true)
  }

  function focusLeave(relatedInside: boolean): void {
    const trigger = options.getTrigger()
    if (trigger === 'manual') return
    if (relatedInside) return
    if (options.isDismissLocked?.()) return
    focusInside = false
    if (trigger === 'hover' && (pointerInside || options.isFocusWithinTrigger?.())) return
    if (trigger === 'click') {
      clearShow()
      clearHide()
      commit(false)
      return
    }
    closeSoon()
  }

  function setOpen(next: boolean): boolean {
    clearShow()
    clearHide()
    if (!next) {
      pointerInside = false
      focusInside = false
    }
    return commit(next)
  }

  function activate(): void {
    if (options.getDisabled()) return
    const trigger = options.getTrigger()
    if (trigger === 'manual') return
    if (trigger === 'hover' || trigger === 'focus') {
      clearShow()
      clearHide()
      if (!getOpen()) commit(true)
      return
    }
    if (options.isDismissLocked?.()) return
    clearShow()
    clearHide()
    commit(!getOpen())
  }

  function requestClose(reason: OverlayPopupDismissReason): boolean {
    const trigger = options.getTrigger()
    if (trigger === 'manual' && (reason === 'escape' || reason === 'outside')) return false
    if (options.isDismissLocked?.()) return false
    if (!getOpen() && options.getControlledOpen() !== true) return false
    clearShow()
    clearHide()
    pointerInside = false
    focusInside = false
    return commit(false)
  }

  function syncDisabled(): void {
    if (!options.getDisabled()) return
    clearShow()
    clearHide()
    pointerInside = false
    focusInside = false
    if (options.getControlledOpen() === undefined) {
      if (!uncontrolledOpen) return
      uncontrolledOpen = false
      options.onOpenChange?.(false)
      emit()
      return
    }
    if (options.getControlledOpen()) {
      options.onOpenChange?.(false)
      emit()
    }
  }

  return {
    getOpen,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    pointerEnter,
    pointerLeave,
    focusEnter,
    focusLeave,
    activate,
    setOpen,
    requestClose,
    syncDisabled,
    dispose() {
      clearShow()
      clearHide()
      listeners.clear()
    }
  }
}
