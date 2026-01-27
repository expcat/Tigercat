import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  onBeforeUnmount,
  VNode,
  watch
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getTransformOrigin,
  type DropdownTrigger,
  type FloatingPlacement
} from '@expcat/tigercat-core'

import type { DropdownProps as CoreDropdownProps } from '@expcat/tigercat-core'
import { DropdownMenu } from './DropdownMenu'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'

// Dropdown context key
export const DropdownContextKey = Symbol('DropdownContext')

// Dropdown context interface
export interface DropdownContext {
  closeOnClick: boolean
  handleItemClick: () => void
}

export interface VueDropdownProps extends Omit<CoreDropdownProps, 'placement'> {
  /**
   * Dropdown placement relative to trigger
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * Offset distance from trigger element
   * @default 4
   */
  offset?: number
}

export const Dropdown = defineComponent({
  name: 'TigerDropdown',
  inheritAttrs: false,
  props: {
    /**
     * Trigger mode - click or hover
     * @default 'hover'
     */
    trigger: {
      type: String as PropType<DropdownTrigger>,
      default: 'hover' as DropdownTrigger
    },
    /**
     * Dropdown placement relative to trigger
     * @default 'bottom-start'
     */
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'bottom-start' as FloatingPlacement
    },
    /**
     * Offset distance from trigger element
     * @default 4
     */
    offset: {
      type: Number,
      default: 4
    },
    /**
     * Whether the dropdown is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the dropdown is visible (controlled mode)
     */
    visible: {
      type: Boolean,
      default: undefined
    },
    /**
     * Default visibility (uncontrolled mode)
     * @default false
     */
    defaultVisible: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to close dropdown on menu item click
     * @default true
     */
    closeOnClick: {
      type: Boolean,
      default: true
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:visible', 'visible-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    // Internal state for uncontrolled mode
    const internalVisible = ref(props.defaultVisible)

    // Computed visible state (controlled or uncontrolled)
    const currentVisible = computed(() => {
      return props.visible !== undefined ? props.visible : internalVisible.value
    })

    // Refs for Floating UI positioning
    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)

    // Handle visibility change
    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return

      // Update internal state if uncontrolled
      if (props.visible === undefined) {
        internalVisible.value = visible
      }

      // Emit events
      emit('update:visible', visible)
      emit('visible-change', visible)
    }

    // Handle item click (close dropdown)
    const handleItemClick = () => {
      if (props.closeOnClick) {
        setVisible(false)
      }
    }

    // Hover timer for delayed open/close
    let hoverTimer: ReturnType<typeof setTimeout> | null = null

    // Handle mouse enter (for hover trigger)
    const handleMouseEnter = () => {
      if (props.trigger !== 'hover') return

      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }

      hoverTimer = setTimeout(() => {
        setVisible(true)
      }, 100)
    }

    // Handle mouse leave (for hover trigger)
    const handleMouseLeave = () => {
      if (props.trigger !== 'hover') return

      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }

      hoverTimer = setTimeout(() => {
        setVisible(false)
      }, 150)
    }

    // Handle click (for click trigger)
    const handleClick = () => {
      if (props.trigger !== 'click') return
      setVisible(!currentVisible.value)
    }

    // Floating UI positioning
    const {
      x,
      y,
      placement: currentPlacement
    } = useVueFloating({
      referenceRef: triggerRef,
      floatingRef,
      enabled: currentVisible,
      placement: props.placement,
      offset: props.offset
    })

    // Computed for whether click outside should be enabled
    const clickOutsideEnabled = computed(() => currentVisible.value && props.trigger === 'click')

    // Handle click outside for click trigger mode
    let cleanupClickOutside: (() => void) | null = null
    watch(
      clickOutsideEnabled,
      (enabled) => {
        if (cleanupClickOutside) {
          cleanupClickOutside()
          cleanupClickOutside = null
        }
        if (enabled) {
          cleanupClickOutside = useVueClickOutside({
            enabled: currentVisible,
            containerRef,
            onOutsideClick: () => setVisible(false),
            defer: true
          })
        }
      },
      { immediate: true }
    )

    // Handle escape key
    let cleanupEscapeKey: (() => void) | null = null
    watch(
      currentVisible,
      (visible) => {
        if (cleanupEscapeKey) {
          cleanupEscapeKey()
          cleanupEscapeKey = null
        }
        if (visible) {
          cleanupEscapeKey = useVueEscapeKey({
            enabled: currentVisible,
            onEscape: () => setVisible(false)
          })
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
      if (cleanupClickOutside) {
        cleanupClickOutside()
      }
      if (cleanupEscapeKey) {
        cleanupEscapeKey()
      }
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getDropdownContainerClasses(),
        'tiger-dropdown-container',
        props.className,
        coerceClassValue(attrsClass)
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    // Trigger classes
    const triggerClasses = computed(() => {
      return getDropdownTriggerClasses(props.disabled)
    })

    // Menu wrapper classes using Floating UI positioning
    const menuWrapperClasses = computed(() => 'absolute z-50')

    // Menu wrapper styles using Floating UI positioning
    const menuWrapperStyles = computed(() => ({
      position: 'absolute' as const,
      left: `${x.value}px`,
      top: `${y.value}px`,
      transformOrigin: getTransformOrigin(currentPlacement.value)
    }))

    // Provide dropdown context
    provide<DropdownContext>(DropdownContextKey, {
      closeOnClick: props.closeOnClick,
      handleItemClick
    })

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) {
        return null
      }

      // Find trigger and menu from slots
      let triggerNode: VNode | null = null
      let menuNode: VNode | null = null

      defaultSlot.forEach((node: VNode) => {
        if (node.type === DropdownMenu) {
          menuNode = node
          return
        }

        // Default to trigger if not DropdownMenu
        triggerNode = node
      })

      // Trigger element with event handlers and ref
      const trigger = triggerNode
        ? h(
            'div',
            {
              ref: triggerRef,
              class: triggerClasses.value,
              onClick: handleClick,
              onMouseenter: handleMouseEnter,
              onMouseleave: handleMouseLeave,
              'aria-haspopup': 'menu',
              'aria-expanded': currentVisible.value
            },
            triggerNode
          )
        : null

      // Dropdown menu with Floating UI positioning
      const menu = menuNode
        ? h(
            'div',
            {
              ref: floatingRef,
              class: menuWrapperClasses.value,
              style: menuWrapperStyles.value,
              onMouseenter: handleMouseEnter,
              onMouseleave: handleMouseLeave,
              hidden: !currentVisible.value
            },
            menuNode
          )
        : null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: mergedStyle.value
        },
        [trigger, menu]
      )
    }
  }
})

export default Dropdown
