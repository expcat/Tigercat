/**
 * Overlay trigger ARIA and keyboard helpers.
 *
 * Vue/React merge these onto the focus node (asChild or a self-rendered
 * `<button type="button">`). Do not put haspopup/expanded on a wrapping div.
 */

import type { FloatingTrigger } from '../types/floating-popup'

export type OverlayTriggerHasPopup = 'menu' | 'dialog' | 'true'

export type OverlayTriggerKind = 'menu' | 'dialog' | 'context-menu' | 'tooltip'

export type OverlayTriggerKeyboardAction =
  'open' | 'close' | 'toggle' | 'open-first' | 'open-last' | null

export interface OverlayTriggerAria {
  'aria-haspopup'?: OverlayTriggerHasPopup
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-describedby'?: string
  'data-state': 'open' | 'closed'
  disabled?: boolean
  [key: string]: string | boolean | undefined
}

export interface OverlayTriggerAriaOptions {
  kind: OverlayTriggerKind
  open: boolean
  controlsId?: string
  describedBy?: string
  disabled?: boolean
}

export function isNativeOverlayTriggerType(type: unknown): boolean {
  return type === 'button' || type === 'a'
}

export function shouldMergeOverlayTriggerChild(
  asChild: boolean | undefined,
  childType: unknown
): boolean {
  if (asChild || isNativeOverlayTriggerType(childType)) return true
  if (typeof childType === 'function') return true
  // Vue/React component objects. Symbols (Text/Comment/Fragment) stay wrapped.
  return typeof childType === 'object' && childType !== null
}

export function getOverlayTriggerAria(options: OverlayTriggerAriaOptions): OverlayTriggerAria {
  const { kind, open, controlsId, describedBy, disabled } = options
  const state = open ? 'open' : 'closed'

  if (kind === 'tooltip') {
    return {
      'data-state': state,
      ...(open && describedBy ? { 'aria-describedby': describedBy } : {}),
      ...(disabled ? { disabled: true } : {})
    }
  }

  const hasPopup: OverlayTriggerHasPopup = kind === 'dialog' ? 'dialog' : 'menu'

  return {
    'aria-haspopup': hasPopup,
    'aria-expanded': disabled ? false : open,
    ...(open && controlsId ? { 'aria-controls': controlsId } : {}),
    'data-state': state,
    ...(disabled ? { disabled: true } : {})
  }
}

export function getOverlayTriggerKeyboardAction(
  event: {
    key: string
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
    ctrlKey?: boolean
  },
  options: { kind: OverlayTriggerKind; open: boolean; disabled?: boolean }
): OverlayTriggerKeyboardAction {
  if (options.disabled) return null
  if (event.altKey || event.metaKey || event.ctrlKey) return null

  if (options.kind === 'context-menu') {
    if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) return 'open'
    return null
  }

  if (options.kind === 'tooltip') return null

  if (event.key === 'Escape' && options.open) return 'close'

  // Enter/Space already fire click on a real <button>. Only arrows need extra
  // handling so APG menu buttons open and land on the first/last item.
  if (options.kind === 'menu') {
    if (event.key === 'ArrowDown') return 'open-first'
    if (event.key === 'ArrowUp') return 'open-last'
  }

  return null
}

/**
 * Hover also responds to click (touch) and focus (keyboard). Click stays
 * click-only; focus stays focus-only aside from the relatedTarget guard in
 * the hide handler.
 */
export function buildOverlayTriggerHandlerMap<H>(
  trigger: FloatingTrigger,
  handlers: {
    toggle: H
    show: H
    hide: H
  },
  framework: 'vue' | 'react' = 'vue'
): Record<string, H> {
  const mouseEnter = framework === 'vue' ? 'onMouseenter' : 'onMouseEnter'
  const mouseLeave = framework === 'vue' ? 'onMouseleave' : 'onMouseLeave'
  const focusIn = framework === 'vue' ? 'onFocusin' : 'onFocus'
  const focusOut = framework === 'vue' ? 'onFocusout' : 'onBlur'

  switch (trigger) {
    case 'click':
      return { onClick: handlers.toggle }

    case 'hover':
      return {
        onClick: handlers.toggle,
        [mouseEnter]: handlers.show,
        [mouseLeave]: handlers.hide,
        [focusIn]: handlers.show,
        [focusOut]: handlers.hide
      }

    case 'focus':
      return {
        [focusIn]: handlers.show,
        [focusOut]: handlers.hide
      }

    case 'manual':
    default:
      return {}
  }
}
