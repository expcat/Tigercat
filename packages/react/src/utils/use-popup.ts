/**
 * Shared React hook for floating-popup components
 * (Tooltip, Popover, Popconfirm).
 *
 * Extracts the common pattern: controlled/uncontrolled visibility,
 * Floating UI positioning, click-outside dismiss, escape-key dismiss,
 * trigger → event-handler mapping, floating styles.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useFloating, useClickOutside, useEscapeKey } from './overlay'
import {
  getTransformOrigin,
  FLOATING_OVERLAY_Z_INDEX,
  buildTriggerHandlerMap,
  restoreFocus,
  type FloatingPlacement,
  type FloatingTrigger
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
export interface UsePopupOptions {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  trigger?: FloatingTrigger
  placement?: FloatingPlacement
  offset?: number
  /**
   * Whether the component supports multi-trigger-type (click/hover/focus/manual).
   * Popconfirm is click-only so this should be false for it.
   * @default true
   */
  multiTrigger?: boolean
  onOpenChange?: (visible: boolean) => void
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------
export interface UsePopupReturn {
  currentVisible: boolean
  setVisible: (next: boolean) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  triggerRef: React.RefObject<HTMLDivElement | null>
  floatingRef: React.RefObject<HTMLDivElement | null>
  x: number
  y: number
  actualPlacement: FloatingPlacement
  floatingStyles: React.CSSProperties
  triggerHandlers: React.DOMAttributes<HTMLDivElement>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePopup(options: UsePopupOptions): UsePopupReturn {
  const {
    open,
    defaultOpen = false,
    disabled = false,
    trigger = 'click',
    placement = 'top',
    offset = 8,
    multiTrigger = true,
    onOpenChange
  } = options

  // ─── Visibility ──────────────────────────────────────────────────────
  const isControlled = open !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultOpen)
  const currentVisible = isControlled ? open : internalVisible

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)

  // ─── Floating positioning ────────────────────────────────────────────
  const {
    x,
    y,
    placement: actualPlacement
  } = useFloating({
    referenceRef: triggerRef,
    floatingRef,
    enabled: currentVisible,
    placement,
    offset
  })

  // ─── setVisible ──────────────────────────────────────────────────────
  const setVisible = useCallback(
    (next: boolean) => {
      if (disabled && next) return
      if (!isControlled) setInternalVisible(next)
      onOpenChange?.(next)
    },
    [disabled, isControlled, onOpenChange]
  )

  const restoreTriggerFocus = useCallback(() => {
    const trigger = triggerRef.current
    const target =
      trigger?.querySelector<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ) ?? trigger

    window.setTimeout(() => {
      restoreFocus(target, { preventScroll: true })
    }, 0)
  }, [])

  const closeAndRestoreFocus = useCallback(() => {
    setVisible(false)
    restoreTriggerFocus()
  }, [restoreTriggerFocus, setVisible])

  // ─── Trigger handlers ────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    if (!disabled) setVisible(!currentVisible)
  }, [disabled, currentVisible, setVisible])

  const handleShow = useCallback(() => {
    if (!disabled) setVisible(true)
  }, [disabled, setVisible])

  const handleHide = useCallback(() => {
    if (!disabled) setVisible(false)
  }, [disabled, setVisible])

  const effectiveTrigger: FloatingTrigger = multiTrigger ? trigger : 'click'

  // ─── Overlay dismiss ─────────────────────────────────────────────────
  useClickOutside({
    enabled: currentVisible && effectiveTrigger === 'click',
    refs: [containerRef, floatingRef],
    onOutsideClick: closeAndRestoreFocus,
    defer: true
  })

  useEscapeKey({
    enabled: currentVisible && effectiveTrigger !== 'manual',
    onEscape: closeAndRestoreFocus
  })

  // ─── Floating styles ─────────────────────────────────────────────────
  const floatingStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      left: x,
      top: y,
      transformOrigin: getTransformOrigin(actualPlacement),
      zIndex: FLOATING_OVERLAY_Z_INDEX
    }),
    [x, y, actualPlacement]
  )

  // ─── Trigger handlers map ────────────────────────────────────────────
  const triggerHandlers = useMemo<React.DOMAttributes<HTMLDivElement>>(() => {
    if (!multiTrigger) {
      return { onClick: handleToggle }
    }
    return buildTriggerHandlerMap(
      effectiveTrigger,
      { toggle: handleToggle, show: handleShow, hide: handleHide },
      'react'
    ) as React.DOMAttributes<HTMLDivElement>
  }, [multiTrigger, effectiveTrigger, handleToggle, handleShow, handleHide])

  return {
    currentVisible,
    setVisible,
    containerRef,
    triggerRef,
    floatingRef,
    x,
    y,
    actualPlacement,
    floatingStyles,
    triggerHandlers
  }
}
