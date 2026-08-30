/**
 * Shared React hook for floating-popup components
 * (Tooltip, Popover, Popconfirm).
 *
 * Extracts the common pattern: controlled/uncontrolled visibility,
 * Floating UI positioning, click-outside dismiss, escape-key dismiss,
 * trigger → event-handler mapping, floating styles.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAnchoredOverlay } from './overlay'
import { useControlledState } from '../hooks/useControlledState'
import {
  buildTriggerHandlerMap,
  createFloatingHoverDelayController,
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
  floatingClasses: string
  positioned: boolean
  overlayTarget: HTMLElement | null
  triggerHandlers: React.DOMAttributes<HTMLDivElement>
  closeAndRestoreFocus: () => void
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
  const [currentVisible, setVisibleState] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)

  // ─── setVisible ──────────────────────────────────────────────────────
  const setVisible = useCallback(
    (next: boolean) => {
      if (disabled && next) return
      setVisibleState(next)
    },
    [disabled, setVisibleState]
  )

  const setVisibleRef = useRef(setVisible)
  setVisibleRef.current = setVisible

  const hoverControllerRef = useRef<ReturnType<typeof createFloatingHoverDelayController> | null>(
    null
  )
  if (hoverControllerRef.current === null) {
    hoverControllerRef.current = createFloatingHoverDelayController({
      show: () => setVisibleRef.current(true),
      hide: () => setVisibleRef.current(false)
    })
  }
  const hoverController = hoverControllerRef.current

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
    hoverController.closeNow()
    restoreTriggerFocus()
  }, [hoverController, restoreTriggerFocus])

  const effectiveTrigger: FloatingTrigger = multiTrigger ? trigger : 'click'

  // ─── Trigger handlers ────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    if (disabled) return
    hoverController.cancel()
    setVisible(!currentVisible)
  }, [disabled, currentVisible, setVisible, hoverController])

  const handleShow = useCallback(() => {
    if (disabled) return
    if (effectiveTrigger === 'hover') {
      hoverController.enter()
      return
    }
    hoverController.cancel()
    setVisible(true)
  }, [disabled, effectiveTrigger, setVisible, hoverController])

  const handleHide = useCallback(() => {
    if (disabled) return
    if (effectiveTrigger === 'hover') {
      hoverController.leave()
      return
    }
    hoverController.closeNow()
  }, [disabled, effectiveTrigger, hoverController])

  const overlay = useAnchoredOverlay({
    enabled: currentVisible,
    referenceRef: triggerRef,
    floatingRef,
    containerRef,
    placement,
    offset,
    dismissOnOutside: effectiveTrigger === 'click',
    dismissOnEscape: effectiveTrigger !== 'manual',
    onDismiss: (reason) => {
      if (reason === 'escape') {
        closeAndRestoreFocus()
      } else {
        hoverController.closeNow()
      }
    }
  })

  // Trigger + floating share one hover group so the pointer can cross the
  // offset gap into the portaled layer before hideDelay fires.
  useEffect(() => {
    if (!multiTrigger || effectiveTrigger !== 'hover' || !currentVisible) return
    const el = floatingRef.current
    if (!el) return
    const handleEnter = () => hoverController.enter()
    const handleLeave = () => hoverController.leave()
    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [multiTrigger, effectiveTrigger, currentVisible, hoverController])

  useEffect(() => () => hoverController.dispose(), [hoverController])

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
    x: overlay.x,
    y: overlay.y,
    actualPlacement: overlay.placement,
    floatingStyles: overlay.floatingStyles,
    floatingClasses: overlay.floatingClasses,
    positioned: overlay.positioned,
    overlayTarget: overlay.target,
    triggerHandlers,
    closeAndRestoreFocus
  }
}
