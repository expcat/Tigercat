/**
 * Shared Vue composable for floating-popup components
 * (Tooltip, Popover, Popconfirm).
 *
 * Extracts the common pattern: controlled/uncontrolled visibility,
 * Floating UI positioning, click-outside dismiss, escape-key dismiss,
 * trigger → event-handler mapping, floating styles.
 */
import { computed, ref, watch, type Ref } from 'vue'
import { useVueAnchoredOverlay } from './overlay'
import {
  buildTriggerHandlerMap,
  restoreFocus,
  type FloatingPlacement,
  type FloatingTrigger
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
export interface UseFloatingPopupOptions {
  /** Vue reactive props object — must contain at least open / disabled */
  props: {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    trigger?: FloatingTrigger
    placement?: FloatingPlacement
    offset?: number
  }
  /** Vue emit function (accepts any overloaded emit signature) */
  emit(event: string, ...args: unknown[]): void
  /**
   * Whether the component supports multi-trigger-type (click/hover/focus/manual).
   * Popconfirm is click-only so this should be false for it.
   * @default true
   */
  multiTrigger?: boolean
  /**
   * Extra emits to fire after visibility change (e.g. 'confirm', 'cancel').
   * Called via the returned setVisible helper.
   */
  extraVisibleEmits?: string[]
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------
export interface UseFloatingPopupReturn {
  /** Resolved current visibility (works for both controlled & uncontrolled) */
  currentVisible: Ref<boolean>
  /** Toggle / set visibility — honours disabled & controlled */
  setVisible: (next: boolean) => void
  /** Ref for the outermost container element */
  containerRef: Ref<HTMLElement | null>
  /** Ref for the trigger wrapper element */
  triggerRef: Ref<HTMLElement | null>
  /** Ref for the floating content element */
  floatingRef: Ref<HTMLElement | null>
  /** Floating x position */
  x: Ref<number>
  /** Floating y position */
  y: Ref<number>
  /** Actual placement after flip/shift */
  actualPlacement: Ref<FloatingPlacement>
  /** Computed floating wrapper styles (position + transform-origin + zIndex) */
  floatingStyles: Ref<Record<string, unknown>>
  floatingClasses: Ref<string>
  positioned: Ref<boolean>
  overlayTarget: Ref<HTMLElement | null>
  /**
   * Build trigger event handlers for the current trigger type.
   * Returns a plain object ready to spread onto the trigger element.
   */
  triggerHandlers: Ref<Record<string, unknown>>
  /** Close the popup and restore focus to the trigger. */
  closeAndRestoreFocus: () => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
export function useFloatingPopup(options: UseFloatingPopupOptions): UseFloatingPopupReturn {
  const { props, emit, multiTrigger = true } = options

  // ─── Visibility ──────────────────────────────────────────────────────
  const internalVisible = ref(props.open ?? props.defaultOpen ?? false)
  const isControlled = computed(() => props.open !== undefined)

  // Sync external controlled → internal
  watch(
    () => props.open,
    (next) => {
      if (next !== undefined) internalVisible.value = next
    }
  )

  const currentVisible = computed(() =>
    isControlled.value ? Boolean(props.open) : internalVisible.value
  )

  const setVisible = (next: boolean) => {
    if (props.disabled && next) return
    if (!isControlled.value) internalVisible.value = next
    emit('update:open', next)
    emit('open-change', next)
  }

  // ─── Element refs ────────────────────────────────────────────────────
  const containerRef = ref<HTMLElement | null>(null)
  const triggerRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  const restoreTriggerFocus = () => {
    const trigger = triggerRef.value
    const target =
      trigger?.querySelector<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ) ?? trigger

    window.setTimeout(() => {
      restoreFocus(target, { preventScroll: true })
    }, 0)
  }

  const closeAndRestoreFocus = () => {
    setVisible(false)
    restoreTriggerFocus()
  }

  const effectiveTrigger = computed<FloatingTrigger>(() =>
    multiTrigger ? (props.trigger ?? 'click') : 'click'
  )

  const overlay = useVueAnchoredOverlay({
    enabled: currentVisible,
    referenceRef: triggerRef,
    floatingRef,
    containerRef,
    placement: (props.placement ?? 'top') as FloatingPlacement,
    offset: props.offset ?? 8,
    dismissOnOutside: computed(() => effectiveTrigger.value === 'click'),
    dismissOnEscape: computed(() => effectiveTrigger.value !== 'manual'),
    onDismiss: (reason) => {
      if (reason === 'escape') {
        closeAndRestoreFocus()
      } else {
        setVisible(false)
      }
    }
  })

  const x = overlay.x
  const y = overlay.y

  // ─── Trigger handlers ────────────────────────────────────────────────
  const handleToggle = () => {
    if (!props.disabled) setVisible(!currentVisible.value)
  }
  const handleShow = () => {
    if (!props.disabled) setVisible(true)
  }
  const handleHide = () => {
    if (!props.disabled) setVisible(false)
  }

  const triggerHandlers = computed<Record<string, unknown>>(() => {
    if (!multiTrigger) {
      // Click-only (Popconfirm)
      return { onClick: handleToggle }
    }
    return buildTriggerHandlerMap(
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
    x,
    y,
    actualPlacement: overlay.placement,
    floatingStyles: overlay.floatingStyles,
    floatingClasses: overlay.floatingClasses,
    positioned: overlay.positioned,
    overlayTarget: overlay.target,
    triggerHandlers,
    closeAndRestoreFocus
  }
}
