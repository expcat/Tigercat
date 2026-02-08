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
  buildTriggerHandlerMap,
  type FloatingPlacement,
  type FloatingTrigger
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
export interface UsePopupOptions {
  visible?: boolean
  defaultVisible?: boolean
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
  onVisibleChange?: (visible: boolean) => void
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
    visible,
    defaultVisible = false,
    disabled = false,
    trigger = 'click',
    placement = 'top',
    offset = 8,
    multiTrigger = true,
    onVisibleChange
  } = options

  // ─── Visibility ──────────────────────────────────────────────────────
  const isControlled = visible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const currentVisible = isControlled ? visible : internalVisible

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
      onVisibleChange?.(next)
    },
    [disabled, isControlled, onVisibleChange]
  )

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
    refs: [containerRef],
    onOutsideClick: () => setVisible(false),
    defer: true
  })

  useEscapeKey({
    enabled: currentVisible && effectiveTrigger !== 'manual',
    onEscape: () => setVisible(false)
  })

  // ─── Floating styles ─────────────────────────────────────────────────
  const floatingStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      left: x,
      top: y,
      transformOrigin: getTransformOrigin(actualPlacement),
      zIndex: 1000
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
