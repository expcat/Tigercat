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
} from 'vue'
import {
  classNames,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownMenuWrapperClasses,
  type DropdownTrigger,
  type DropdownPlacement,
} from '@tigercat/core'

// Dropdown context key
export const DropdownContextKey = Symbol('DropdownContext')

// Dropdown context interface
export interface DropdownContext {
  closeOnClick: boolean
  handleItemClick: () => void
}

export const Dropdown = defineComponent({
  name: 'TigerDropdown',
  props: {
    /**
     * Trigger mode - click or hover
     * @default 'hover'
     */
    trigger: {
      type: String as PropType<DropdownTrigger>,
      default: 'hover' as DropdownTrigger,
    },
    /**
     * Dropdown placement relative to trigger
     * @default 'bottom-start'
     */
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'bottom-start' as DropdownPlacement,
    },
    /**
     * Whether the dropdown is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the dropdown is visible (controlled mode)
     */
    visible: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Default visibility (uncontrolled mode)
     * @default false
     */
    defaultVisible: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to close dropdown on menu item click
     * @default true
     */
    closeOnClick: {
      type: Boolean,
      default: true,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:visible', 'visible-change'],
  setup(props, { slots, emit }) {
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
      if (props.disabled) return

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

    // Setup and cleanup event listeners
    onMounted(() => {
      if (props.trigger === 'click') {
        document.addEventListener('click', handleClickOutside)
      }
    })

    onBeforeUnmount(() => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
      document.removeEventListener('click', handleClickOutside)
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getDropdownContainerClasses(),
        'tiger-dropdown-container',
        props.className
      )
    })

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
      handleItemClick,
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
        if (node.type && typeof node.type === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const typeName = (node.type as any).name
          if (typeName === 'TigerDropdownMenu') {
            menuNode = node
          } else {
            triggerNode = node
          }
        } else {
          // Default to trigger if not DropdownMenu
          triggerNode = node
        }
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
            },
            menuNode
          )
        : null

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
        },
        [trigger, menu]
      )
    }
  },
})

export default Dropdown
