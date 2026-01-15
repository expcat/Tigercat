import { defineComponent, computed, ref, h, onBeforeUnmount, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  getDropdownMenuWrapperClasses,
  type TooltipTrigger,
  type DropdownPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

export interface VueTooltipProps {
  className?: string
  style?: StyleValue
}

let tooltipIdCounter = 0

const createTooltipId = () => `tiger-tooltip-${++tooltipIdCounter}`

export const Tooltip = defineComponent({
  name: 'TigerTooltip',
  inheritAttrs: false,
  props: {
    /**
     * Whether the tooltip is visible (controlled mode)
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
     * Tooltip content text
     */
    content: {
      type: String,
      default: undefined
    },
    /**
     * Trigger type for showing/hiding tooltip
     * @default 'hover'
     */
    trigger: {
      type: String as PropType<TooltipTrigger>,
      default: 'hover' as TooltipTrigger
    },
    /**
     * Tooltip placement relative to trigger
     * @default 'top'
     */
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'top' as DropdownPlacement
    },
    /**
     * Whether the tooltip is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined
    }
  },
  emits: ['update:visible', 'visible-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>

    const coerceBoolean = (val: unknown) => {
      if (val === '') return true
      return Boolean(val)
    }

    // Internal state for uncontrolled mode
    const internalVisible = ref(
      props.visible !== undefined ? coerceBoolean(props.visible) : props.defaultVisible
    )

    const isControlled = computed(() => props.visible !== undefined)

    watch(
      () => props.visible,
      (next) => {
        if (next === undefined) return
        internalVisible.value = coerceBoolean(next)
      }
    )

    const currentVisible = computed(() => internalVisible.value)

    // Ref to the container element
    const containerRef = ref<HTMLElement | null>(null)

    const tooltipId = createTooltipId()

    // Handle visibility change
    const setVisible = (nextVisible: boolean) => {
      if (props.disabled && nextVisible) return

      // Update internal state if uncontrolled
      if (!isControlled.value) {
        internalVisible.value = nextVisible
      }

      // Emit events
      emit('update:visible', nextVisible)
      emit('visible-change', nextVisible)
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

    // Handle outside click to close tooltip (only for click trigger)
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target
      if (!target) return
      if (containerRef.value?.contains(target as Node)) return
      setVisible(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setVisible(false)
    }

    let outsideClickTimeoutId: number | undefined

    // Setup and cleanup event listeners based on visibility and trigger
    watch([currentVisible, () => props.trigger], ([visible, trigger]) => {
      if (outsideClickTimeoutId !== undefined) {
        clearTimeout(outsideClickTimeoutId)
        outsideClickTimeoutId = undefined
      }

      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)

      if (visible && trigger === 'click') {
        // Use setTimeout to avoid immediate triggering on the same click that opened it
        outsideClickTimeoutId = window.setTimeout(() => {
          document.addEventListener('click', handleClickOutside)
        }, 0)
      }

      if (visible) {
        document.addEventListener('keydown', handleKeyDown)
      }
    })

    onBeforeUnmount(() => {
      if (outsideClickTimeoutId !== undefined) {
        clearTimeout(outsideClickTimeoutId)
      }
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getTooltipContainerClasses(),
        props.className,
        coerceClassValue(attrsRecord.class)
      )
    })

    // Trigger classes
    const triggerClasses = computed(() => {
      return getTooltipTriggerClasses(props.disabled)
    })

    // Content wrapper classes
    const contentWrapperClasses = computed(() => {
      return getDropdownMenuWrapperClasses(currentVisible.value, props.placement)
    })

    // Content classes
    const contentClasses = computed(() => {
      return getTooltipContentClasses()
    })

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) {
        return null
      }

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

      const hasTooltipContent = Boolean(props.content || slots.content)

      // Build trigger event handlers
      const triggerHandlers: Record<string, unknown> = {}

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
          class: triggerClasses.value,
          'aria-describedby': hasTooltipContent ? tooltipId : undefined,
          ...triggerHandlers
        },
        defaultSlot
      )

      // Tooltip content
      const content = h(
        'div',
        {
          class: contentWrapperClasses.value,
          hidden: !currentVisible.value,
          'aria-hidden': !currentVisible.value
        },
        [
          h(
            'div',
            {
              id: tooltipId,
              role: 'tooltip',
              class: contentClasses.value
            },
            slots.content ? slots.content() : props.content
          )
        ]
      )

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: props.style
        },
        [trigger, content]
      )
    }
  }
})

export default Tooltip
