import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  onMounted,
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
  getDropdownMenuWrapperClasses,
  type DropdownTrigger,
  type DropdownPlacement
} from '@tigercat/core'

import type { DropdownProps as CoreDropdownProps } from '@tigercat/core'
import { DropdownMenu } from './DropdownMenu'

// Dropdown context key
export const DropdownContextKey = Symbol('DropdownContext')

// Dropdown context interface
export interface DropdownContext {
  closeOnClick: boolean
  handleItemClick: () => void
}

export interface VueDropdownProps extends CoreDropdownProps {}

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
      type: String as PropType<DropdownPlacement>,
      default: 'bottom-start' as DropdownPlacement
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

    // Ref to the container element
    const containerRef = ref<HTMLElement | null>(null)

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

    // Handle outside click to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (containerRef.value && !containerRef.value.contains(target)) {
        setVisible(false)
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVisible(false)
      }
    }

    // Setup and cleanup event listeners
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })

    watch(
      () => props.trigger,
      (next, prev) => {
        if (prev === 'click') {
          document.removeEventListener('click', handleClickOutside)
        }
        if (next === 'click') {
          document.addEventListener('click', handleClickOutside)
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
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

    // Menu wrapper classes
    const menuWrapperClasses = computed(() => {
      return getDropdownMenuWrapperClasses(currentVisible.value, props.placement)
    })

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

      // Trigger element with event handlers
      const trigger = triggerNode
        ? h(
            'div',
            {
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

      // Dropdown menu
      const menu = menuNode
        ? h(
            'div',
            {
              class: menuWrapperClasses.value,
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
