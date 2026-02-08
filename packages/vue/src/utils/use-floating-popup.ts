/**
 * Shared Vue composable for floating-popup components
 * (Tooltip, Popover, Popconfirm).
 *
 * Extracts the common pattern: controlled/uncontrolled visibility,
 * Floating UI positioning, click-outside dismiss, escape-key dismiss,
 * trigger → event-handler mapping, floating styles.
 */
import { computed, ref, watch, onBeforeUnmount, type Ref, type PropType } from 'vue'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from './overlay'
import {
  classNames,
  getTransformOrigin,
  buildTriggerHandlerMap,
  type FloatingPlacement,
  type FloatingTrigger
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
export interface UseFloatingPopupOptions {
  /** Vue reactive props object — must contain at least visible / disabled */
  props: {
    visible?: boolean
    defaultVisible?: boolean
    disabled?: boolean
    trigger?: FloatingTrigger
    placement?: FloatingPlacement
    offset?: number
  }
  /** Vue emit function (accepts any overloaded emit signature) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (...args: any[]) => void
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
  /**
   * Build trigger event handlers for the current trigger type.
   * Returns a plain object ready to spread onto the trigger element.
   */
  triggerHandlers: Ref<Record<string, unknown>>
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
export function useFloatingPopup(options: UseFloatingPopupOptions): UseFloatingPopupReturn {
  const { props, emit, multiTrigger = true } = options

  // ─── Visibility ──────────────────────────────────────────────────────
  const internalVisible = ref(props.visible ?? props.defaultVisible ?? false)
  const isControlled = computed(() => props.visible !== undefined)

  // Sync external controlled → internal
  watch(
    () => props.visible,
    (next) => {
      if (next !== undefined) internalVisible.value = next
    }
  )

  const currentVisible = computed(() =>
    isControlled.value ? Boolean(props.visible) : internalVisible.value
  )

  const setVisible = (next: boolean) => {
    if (props.disabled && next) return
    if (!isControlled.value) internalVisible.value = next
    emit('update:visible', next)
    emit('visible-change', next)
  }

  // ─── Element refs ────────────────────────────────────────────────────
  const containerRef = ref<HTMLElement | null>(null)
  const triggerRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  // ─── Floating positioning ────────────────────────────────────────────
  const {
    x,
    y,
    placement: actualPlacement
  } = useVueFloating({
    referenceRef: triggerRef,
    floatingRef,
    enabled: currentVisible,
    placement: (props.placement ?? 'top') as FloatingPlacement,
    offset: props.offset ?? 8
  })

  // ─── Overlay dismiss ─────────────────────────────────────────────────
  let outsideClickCleanup: (() => void) | undefined
  let escapeKeyCleanup: (() => void) | undefined

  const effectiveTrigger = computed<FloatingTrigger>(() =>
    multiTrigger ? (props.trigger ?? 'click') : 'click'
  )

  watch(
    [currentVisible, effectiveTrigger],
    ([visible, trigger]) => {
      outsideClickCleanup?.()
      escapeKeyCleanup?.()
      outsideClickCleanup = undefined
      escapeKeyCleanup = undefined

      if (visible && trigger === 'click') {
        outsideClickCleanup = useVueClickOutside({
          enabled: currentVisible,
          containerRef,
          onOutsideClick: () => setVisible(false),
          defer: true
        })
      }
      if (visible && trigger !== 'manual') {
        escapeKeyCleanup = useVueEscapeKey({
          enabled: currentVisible,
          onEscape: () => setVisible(false)
        })
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    outsideClickCleanup?.()
    escapeKeyCleanup?.()
  })

  // ─── Floating styles ─────────────────────────────────────────────────
  const floatingStyles = computed(() => ({
    position: 'absolute' as const,
    left: `${x.value}px`,
    top: `${y.value}px`,
    transformOrigin: getTransformOrigin(actualPlacement.value),
    zIndex: 1000
  }))

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
    actualPlacement,
    floatingStyles,
    triggerHandlers
  }
}
