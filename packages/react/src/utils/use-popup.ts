/**
 * React binding for the shared overlay popup controller.
 * Open state, hover timing, outside click, and Escape live in core.
 */
import React, { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useAnchoredOverlay } from './overlay'
import {
  buildOverlayTriggerHandlerMap,
  createOverlayPopupController,
  restoreFocus,
  type FloatingPlacement,
  type FloatingTrigger,
  type OverlayPopupController,
  type OverlayPopupDismissReason
} from '@expcat/tigercat-core'

export interface UsePopupOptions {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  trigger?: FloatingTrigger
  placement?: FloatingPlacement
  offset?: number
  showDelay?: number
  hideDelay?: number
  /**
   * Popconfirm is click-only.
   * @default true
   */
  multiTrigger?: boolean
  arrowRef?: React.RefObject<HTMLElement | null>
  onOpenChange?: (open: boolean) => void
  isDismissLocked?: () => boolean
  getSkipShowDelay?: () => boolean
  onShown?: () => void
  onDismissed?: (reason: OverlayPopupDismissReason) => void
  /** Popconfirm restores focus for outside clicks too. */
  restoreFocusOnDismiss?: 'escape' | 'all'
}

export interface UsePopupReturn {
  currentVisible: boolean
  setVisible: (next: boolean) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  triggerRef: React.RefObject<HTMLElement | null>
  floatingRef: React.RefObject<HTMLDivElement | null>
  x: number
  y: number
  actualPlacement: FloatingPlacement
  floatingStyles: React.CSSProperties
  floatingClasses: string
  positioned: boolean
  overlayTarget: HTMLElement | null
  triggerHandlers: React.DOMAttributes<HTMLElement>
  closeAndRestoreFocus: () => void
  arrowX: number | undefined
  arrowY: number | undefined
}

export function usePopup(options: UsePopupOptions): UsePopupReturn {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const floatingRef = useRef<HTMLDivElement>(null)

  const controllerRef = useRef<OverlayPopupController | null>(null)
  if (controllerRef.current === null) {
    controllerRef.current = createOverlayPopupController({
      getControlledOpen: () => optionsRef.current.open,
      getDefaultOpen: () => optionsRef.current.defaultOpen ?? false,
      getDisabled: () => Boolean(optionsRef.current.disabled),
      getTrigger: () =>
        optionsRef.current.multiTrigger === false
          ? 'click'
          : (optionsRef.current.trigger ?? 'click'),
      getShowDelay: () => optionsRef.current.showDelay,
      getHideDelay: () => optionsRef.current.hideDelay,
      getSkipShowDelay: () => Boolean(optionsRef.current.getSkipShowDelay?.()),
      onShown: () => optionsRef.current.onShown?.(),
      isDismissLocked: () => Boolean(optionsRef.current.isDismissLocked?.()),
      isFocusWithinTrigger: () => {
        const active = triggerRef.current?.ownerDocument?.activeElement
        return Boolean(active && triggerRef.current?.contains(active))
      },
      onOpenChange: (open) => optionsRef.current.onOpenChange?.(open)
    })
  }
  const controller = controllerRef.current

  const currentVisible = useSyncExternalStore(
    controller.subscribe,
    controller.getOpen,
    () => false
  )

  const disabled = Boolean(options.disabled)
  useEffect(() => {
    controller.syncDisabled()
  }, [disabled, controller])

  useEffect(() => () => controller.dispose(), [controller])

  const multiTrigger = options.multiTrigger !== false
  const effectiveTrigger: FloatingTrigger = multiTrigger ? (options.trigger ?? 'click') : 'click'

  const restoreTriggerFocus = useCallback(() => {
    window.setTimeout(() => {
      restoreFocus(triggerRef.current, { preventScroll: true })
    }, 0)
  }, [])

  const closeAndRestoreFocus = useCallback(() => {
    const closed = controller.requestClose('escape')
    if (closed && effectiveTrigger !== 'hover') restoreTriggerFocus()
  }, [controller, effectiveTrigger, restoreTriggerFocus])

  const relatedInside = (event?: { relatedTarget?: EventTarget | null }) => {
    const related = event?.relatedTarget
    if (!(related instanceof Node)) return false
    return Boolean(
      floatingRef.current?.contains(related) || triggerRef.current?.contains(related)
    )
  }

  const handleToggle = useCallback(() => {
    controller.activate()
  }, [controller])

  const handleShow = useCallback(
    (event?: React.SyntheticEvent) => {
      const type = event?.type
      if (type === 'click') {
        controller.activate()
        return
      }
      if (type === 'focus' || type === 'focusin') {
        controller.focusEnter()
        return
      }
      controller.pointerEnter()
    },
    [controller]
  )

  const handleHide = useCallback(
    (event?: React.SyntheticEvent) => {
      const type = event?.type
      if (type === 'blur' || type === 'focusout') {
        controller.focusLeave(relatedInside(event as React.FocusEvent))
        return
      }
      controller.pointerLeave()
    },
    [controller]
  )

  const placement = options.placement ?? 'top'
  const offset = options.offset ?? 8

  const overlay = useAnchoredOverlay({
    enabled: currentVisible,
    referenceRef: triggerRef,
    floatingRef,
    containerRef,
    placement,
    offset,
    dismissOnOutside: effectiveTrigger === 'click' || effectiveTrigger === 'hover',
    dismissOnEscape: effectiveTrigger !== 'manual',
    arrowRef: options.arrowRef,
    onDismiss: (reason) => {
      const mapped: OverlayPopupDismissReason = reason === 'escape' ? 'escape' : 'outside'
      const closed = controller.requestClose(mapped)
      if (!closed) return
      const restore =
        effectiveTrigger !== 'hover' &&
        (mapped === 'escape' || optionsRef.current.restoreFocusOnDismiss === 'all')
      if (restore) restoreTriggerFocus()
      optionsRef.current.onDismissed?.(mapped)
    }
  })

  useEffect(() => {
    if (effectiveTrigger !== 'hover' || !currentVisible) return
    const el = floatingRef.current
    if (!el) return
    const enter = () => controller.pointerEnter()
    const leave = () => controller.pointerLeave()
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [effectiveTrigger, currentVisible, controller])

  const triggerHandlers = useMemo<React.DOMAttributes<HTMLElement>>(() => {
    if (!multiTrigger) {
      return buildOverlayTriggerHandlerMap(
        'click',
        { toggle: handleToggle, show: handleShow, hide: handleHide },
        'react'
      ) as React.DOMAttributes<HTMLElement>
    }
    return buildOverlayTriggerHandlerMap(
      effectiveTrigger,
      { toggle: handleToggle, show: handleShow, hide: handleHide },
      'react'
    ) as React.DOMAttributes<HTMLElement>
  }, [multiTrigger, effectiveTrigger, handleToggle, handleShow, handleHide])

  const setVisible = useCallback(
    (next: boolean) => {
      controller.setOpen(next)
    },
    [controller]
  )

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
    closeAndRestoreFocus,
    arrowX: overlay.arrowX,
    arrowY: overlay.arrowY
  }
}
