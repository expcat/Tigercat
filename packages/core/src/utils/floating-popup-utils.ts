/**
 * Shared utilities for floating-popup components (Tooltip, Popover, Popconfirm).
 *
 * Provides:
 * - Auto-incrementing ID factory for aria-* attributes
 * - Trigger-handler builder (maps trigger type → event handler map)
 */

import type { FloatingTrigger } from '../types/floating-popup'

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
  let counter = 0
  return () => `tiger-${prefix}-${++counter}`
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
