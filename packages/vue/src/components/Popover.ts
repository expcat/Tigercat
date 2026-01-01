import { 
  defineComponent, 
  computed, 
  ref, 
  h,
  onBeforeUnmount,
  watch,
  PropType,
} from 'vue'
import {
  classNames,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  getPopoverTitleClasses,
  getPopoverContentTextClasses,
  getDropdownMenuWrapperClasses,
  type PopoverTrigger,
  type DropdownPlacement,
} from '@tigercat/core'

export const Popover = defineComponent({
  name: 'TigerPopover',
  props: {
    /**
     * Whether the popover is visible (controlled mode)
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
     * Popover title text
     */
    title: {
      type: String,
      default: undefined,
    },
    /**
     * Popover content text
     */
    content: {
      type: String,
      default: undefined,
    },
    /**
     * Trigger type for showing/hiding popover
     * @default 'click'
     */
    trigger: {
      type: String as PropType<PopoverTrigger>,
      default: 'click' as PopoverTrigger,
    },
    /**
     * Popover placement relative to trigger
     * @default 'top'
     */
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'top' as DropdownPlacement,
    },
    /**
     * Whether the popover is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Popover width (CSS value)
     * @default 'auto'
     */
    width: {
      type: [String, Number],
      default: undefined,
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
    
    // Ref to the trigger element
    const triggerRef = ref<HTMLElement | null>(null)

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

    // Handle trigger click
    const handleTriggerClick = () => {
      if (props.disabled || props.trigger !== 'click') return
      setVisible(!currentVisible.value)
    }

    // Handle trigger mouse enter
    const handleTriggerMouseEnter = () => {
      if (props.disabled || props.trigger !== 'hover') return
      setVisible(true)
    }

    // Handle trigger mouse leave
    const handleTriggerMouseLeave = () => {
      if (props.disabled || props.trigger !== 'hover') return
      setVisible(false)
    }

    // Handle trigger focus
    const handleTriggerFocus = () => {
      if (props.disabled || props.trigger !== 'focus') return
      setVisible(true)
    }

    // Handle trigger blur
    const handleTriggerBlur = () => {
      if (props.disabled || props.trigger !== 'focus') return
      setVisible(false)
    }

    // Handle outside click to close popover (only for click trigger)
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (containerRef.value && !containerRef.value.contains(target)) {
        setVisible(false)
      }
    }

    // Setup and cleanup event listeners based on visibility and trigger
    watch([currentVisible, () => props.trigger], ([visible, trigger]) => {
      if (visible && trigger === 'click') {
        // Use setTimeout to avoid immediate triggering on the same click that opened it
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside)
        }, 0)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getPopoverContainerClasses(),
        props.className
      )
    })

    // Trigger classes
    const triggerClasses = computed(() => {
      return getPopoverTriggerClasses(props.disabled)
    })

    // Content wrapper classes
    const contentWrapperClasses = computed(() => {
      return getDropdownMenuWrapperClasses(currentVisible.value, props.placement)
    })

    // Content classes
    const contentClasses = computed(() => {
      return getPopoverContentClasses(props.width)
    })

    // Title classes
    const titleClasses = computed(() => {
      return getPopoverTitleClasses()
    })

    // Content text classes
    const contentTextClasses = computed(() => {
      return getPopoverContentTextClasses()
    })

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) {
        return null
      }

      // Build trigger event handlers
      const triggerHandlers: Record<string, any> = {}
      
      if (props.trigger === 'click') {
        triggerHandlers.onClick = handleTriggerClick
      } else if (props.trigger === 'hover') {
        triggerHandlers.onMouseenter = handleTriggerMouseEnter
        triggerHandlers.onMouseleave = handleTriggerMouseLeave
      } else if (props.trigger === 'focus') {
        triggerHandlers.onFocus = handleTriggerFocus
        triggerHandlers.onBlur = handleTriggerBlur
      }

      // Trigger element
      const trigger = h(
        'div',
        {
          ref: triggerRef,
          class: triggerClasses.value,
          ...triggerHandlers,
        },
        defaultSlot
      )

      // Popover content
      const content = h(
        'div',
        {
          class: contentWrapperClasses.value,
        },
        [
          h(
            'div',
            {
              class: contentClasses.value,
            },
            [
              // Title
              (props.title || slots.title) &&
                h(
                  'div',
                  {
                    class: titleClasses.value,
                  },
                  slots.title ? slots.title() : props.title
                ),
              // Content
              (props.content || slots.content) &&
                h(
                  'div',
                  {
                    class: contentTextClasses.value,
                  },
                  slots.content ? slots.content() : props.content
                ),
            ].filter(Boolean)
          ),
        ]
      )

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
        },
        [trigger, content]
      )
    }
  },
})

export default Popover
