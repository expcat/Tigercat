/**
 * Vue binding for the shared overlay popup controller.
 * Open state, hover timing, outside click, and Escape live in core.
 */
import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useVueAnchoredOverlay } from './overlay'
import {
  buildOverlayTriggerHandlerMap,
  createOverlayPopupController,
  restoreFocus,
  type FloatingPlacement,
  type FloatingTrigger,
  type OverlayPopupDismissReason
} from '@expcat/tigercat-core'

export interface UsePopupOptions {
  props: {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    trigger?: FloatingTrigger
    placement?: FloatingPlacement
    offset?: number
    showDelay?: number
    hideDelay?: number
  }
  emit(event: string, ...args: unknown[]): void
  /** Popconfirm is click-only. @default true */
  multiTrigger?: boolean
  arrowRef?: Ref<HTMLElement | null>
  isDismissLocked?: () => boolean
  onDismissed?: (reason: OverlayPopupDismissReason) => void
  restoreFocusOnDismiss?: 'escape' | 'all'
}

export interface UsePopupReturn {
  currentVisible: Ref<boolean>
  setVisible: (next: boolean) => void
  containerRef: Ref<HTMLElement | null>
  triggerRef: Ref<HTMLElement | null>
  floatingRef: Ref<HTMLElement | null>
  x: Ref<number>
  y: Ref<number>
  actualPlacement: Ref<FloatingPlacement>
  floatingStyles: Ref<Record<string, unknown>>
  floatingClasses: Ref<string>
  positioned: Ref<boolean>
  overlayTarget: Ref<HTMLElement | null>
  triggerHandlers: Ref<Record<string, unknown>>
  closeAndRestoreFocus: () => void
  arrowX: Ref<number | undefined>
  arrowY: Ref<number | undefined>
}

export function usePopup(options: UsePopupOptions): UsePopupReturn {
  const { props, emit, multiTrigger = true, arrowRef } = options
  const version = ref(0)
  const containerRef = ref<HTMLElement | null>(null)
  const triggerRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  const controller = createOverlayPopupController({
    getControlledOpen: () => props.open,
    getDefaultOpen: () => props.defaultOpen ?? false,
    getDisabled: () => Boolean(props.disabled),
    getTrigger: () => (multiTrigger ? (props.trigger ?? 'click') : 'click'),
    getShowDelay: () => props.showDelay,
    getHideDelay: () => props.hideDelay,
    isDismissLocked: () => Boolean(options.isDismissLocked?.()),
    isFocusWithinTrigger: () => {
      const active = triggerRef.value?.ownerDocument?.activeElement
      return Boolean(active && triggerRef.value?.contains(active))
    },
    onOpenChange: (open) => {
      emit('update:open', open)
      emit('open-change', open)
    }
  })

  const stop = controller.subscribe(() => {
    version.value += 1
  })

  const currentVisible = computed(() => {
    version.value
    return controller.getOpen()
  })

  const effectiveTrigger = computed<FloatingTrigger>(() =>
    multiTrigger ? (props.trigger ?? 'click') : 'click'
  )

  watch(
    () => props.disabled,
    () => controller.syncDisabled()
  )

  const restoreTriggerFocus = () => {
    window.setTimeout(() => {
      restoreFocus(triggerRef.value, { preventScroll: true })
    }, 0)
  }

  const closeAndRestoreFocus = () => {
    const closed = controller.requestClose('escape')
    if (closed && effectiveTrigger.value !== 'hover') restoreTriggerFocus()
  }

  const setVisible = (next: boolean) => {
    controller.setOpen(next)
  }

  const relatedInside = (event?: Event) => {
    const related = (event as FocusEvent | undefined)?.relatedTarget
    if (!(related instanceof Node)) return false
    return Boolean(floatingRef.value?.contains(related) || triggerRef.value?.contains(related))
  }

  const handleToggle = () => controller.activate()
  const handleShow = (event?: Event) => {
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
  }
  const handleHide = (event?: Event) => {
    const type = event?.type
    if (type === 'blur' || type === 'focusout') {
      controller.focusLeave(relatedInside(event))
      return
    }
    controller.pointerLeave()
  }

  const overlay = useVueAnchoredOverlay({
    enabled: currentVisible,
    referenceRef: triggerRef,
    floatingRef,
    containerRef,
    placement: () => (props.placement ?? 'top') as FloatingPlacement,
    offset: () => props.offset ?? 8,
    dismissOnOutside: computed(
      () => effectiveTrigger.value === 'click' || effectiveTrigger.value === 'hover'
    ),
    dismissOnEscape: computed(() => effectiveTrigger.value !== 'manual'),
    arrowRef,
    onDismiss: (reason) => {
      const mapped: OverlayPopupDismissReason = reason === 'escape' ? 'escape' : 'outside'
      const closed = controller.requestClose(mapped)
      if (!closed) return
      const restore =
        effectiveTrigger.value !== 'hover' &&
        (mapped === 'escape' || options.restoreFocusOnDismiss === 'all')
      if (restore) restoreTriggerFocus()
      options.onDismissed?.(mapped)
    }
  })

  watch(
    () => [floatingRef.value, currentVisible.value, effectiveTrigger.value] as const,
    ([el, visible, trigger], _prev, onCleanup) => {
      if (!multiTrigger || trigger !== 'hover' || !visible || !el) return
      const enter = () => controller.pointerEnter()
      const leave = () => controller.pointerLeave()
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      onCleanup(() => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
      })
    },
    { flush: 'post', immediate: true }
  )

  onBeforeUnmount(() => {
    stop()
    controller.dispose()
  })

  const triggerHandlers = computed<Record<string, unknown>>(() => {
    if (!multiTrigger) {
      return buildOverlayTriggerHandlerMap(
        'click',
        { toggle: handleToggle, show: handleShow, hide: handleHide },
        'vue'
      )
    }
    return buildOverlayTriggerHandlerMap(
      effectiveTrigger.value,
      { toggle: handleToggle, show: handleShow, hide: handleHide },
      'vue'
    )
  })

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
