import { ref, computed, watch, onBeforeUnmount, type Ref, type ComputedRef } from 'vue'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'
import type { FloatingPlacement } from '@expcat/tigercat-core'

export type PopupTrigger = 'click' | 'hover' | 'focus'

export interface UsePopupOptions {
  /**
   * Controlled visible state
   */
  visible?: Ref<boolean | undefined>
  /**
   * Default visible state (uncontrolled mode)
   */
  defaultVisible?: boolean
  /**
   * Trigger type
   */
  trigger?: Ref<PopupTrigger>
  /**
   * Placement relative to trigger
   */
  placement?: Ref<FloatingPlacement>
  /**
   * Whether the popup is disabled
   */
  disabled?: Ref<boolean>
  /**
   * Offset distance from trigger (in pixels)
   */
  offset?: Ref<number>
  /**
   * Callback when visible changes
   */
  onVisibleChange?: (visible: boolean) => void
}

export interface UsePopupReturn {
  /**
   * Container element ref
   */
  containerRef: Ref<HTMLElement | null>
  /**
   * Trigger element ref
   */
  triggerRef: Ref<HTMLElement | null>
  /**
   * Floating element ref
   */
  floatingRef: Ref<HTMLElement | null>
  /**
   * Current visible state
   */
  currentVisible: ComputedRef<boolean>
  /**
   * Set visible state
   */
  setVisible: (visible: boolean) => void
  /**
   * Floating X position
   */
  x: Ref<number | null>
  /**
   * Floating Y position
   */
  y: Ref<number | null>
  /**
   * Actual placement after flip
   */
  actualPlacement: Ref<FloatingPlacement>
  /**
   * Trigger event handlers
   */
  triggerHandlers: {
    onClick: () => void
    onMouseenter: () => void
    onMouseleave: () => void
    onFocus: () => void
    onBlur: () => void
  }
}

/**
 * Shared composable for popup components (Tooltip, Popover, etc.)
 * Handles visible state, floating positioning, and trigger events
 */
export function usePopup(options: UsePopupOptions): UsePopupReturn {
  const {
    visible,
    defaultVisible = false,
    trigger = ref('click' as PopupTrigger),
    placement = ref('top' as FloatingPlacement),
    disabled = ref(false),
    offset = ref(8),
    onVisibleChange
  } = options

  // Coerce boolean value
  const coerceBoolean = (val: unknown): boolean => {
    if (val === '') return true
    return Boolean(val)
  }

  // Internal state for uncontrolled mode
  const internalVisible = ref(
    visible?.value !== undefined ? coerceBoolean(visible.value) : defaultVisible
  )

  const isControlled = computed(() => visible?.value !== undefined)

  // Sync with controlled visible prop
  watch(
    () => visible?.value,
    (next) => {
      if (next === undefined) return
      internalVisible.value = coerceBoolean(next)
    }
  )

  const currentVisible = computed(() => internalVisible.value)

  // Element refs
  const containerRef = ref<HTMLElement | null>(null)
  const triggerRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  // Floating UI positioning
  const {
    x,
    y,
    placement: actualPlacement
  } = useVueFloating({
    referenceRef: triggerRef,
    floatingRef: floatingRef,
    enabled: currentVisible,
    placement: placement.value,
    offset: offset.value
  })

  // Update floating position when placement/offset changes
  watch([placement, offset], () => {
    // Floating UI will auto-update
  })

  // Handle visibility change
  const setVisible = (nextVisible: boolean) => {
    if (disabled.value && nextVisible) return

    // Update internal state if uncontrolled
    if (!isControlled.value) {
      internalVisible.value = nextVisible
    }

    // Emit callback
    onVisibleChange?.(nextVisible)
  }

  // Trigger event handlers
  const triggerHandlers = {
    onClick: () => {
      if (disabled.value || trigger.value !== 'click') return
      setVisible(!currentVisible.value)
    },
    onMouseenter: () => {
      if (disabled.value || trigger.value !== 'hover') return
      setVisible(true)
    },
    onMouseleave: () => {
      if (disabled.value || trigger.value !== 'hover') return
      setVisible(false)
    },
    onFocus: () => {
      if (disabled.value || trigger.value !== 'focus') return
      setVisible(true)
    },
    onBlur: () => {
      if (disabled.value || trigger.value !== 'focus') return
      setVisible(false)
    }
  }

  // Click outside handler (only for click trigger)
  const shouldHandleClickOutside = computed(() => currentVisible.value && trigger.value === 'click')

  let cleanupClickOutside: (() => void) | null = null
  let cleanupEscapeKey: (() => void) | null = null

  watch(
    shouldHandleClickOutside,
    (shouldHandle) => {
      if (cleanupClickOutside) {
        cleanupClickOutside()
        cleanupClickOutside = null
      }

      if (shouldHandle) {
        cleanupClickOutside = useVueClickOutside({
          enabled: currentVisible,
          containerRef: containerRef,
          onOutsideClick: () => setVisible(false),
          defer: true
        })
      }
    },
    { immediate: true }
  )

  // Escape key handler
  watch(
    currentVisible,
    (isVisible) => {
      if (cleanupEscapeKey) {
        cleanupEscapeKey()
        cleanupEscapeKey = null
      }

      if (isVisible) {
        cleanupEscapeKey = useVueEscapeKey({
          enabled: currentVisible,
          onEscape: () => setVisible(false)
        })
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onBeforeUnmount(() => {
    cleanupClickOutside?.()
    cleanupEscapeKey?.()
  })

  return {
    containerRef,
    triggerRef,
    floatingRef,
    currentVisible,
    setVisible,
    x,
    y,
    actualPlacement,
    triggerHandlers
  }
}
