import { defineComponent, computed, ref, h, onBeforeUnmount, watch, PropType } from 'vue'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'
import {
  classNames,
  coerceClassValue,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  getTransformOrigin,
  type TooltipTrigger,
  type FloatingPlacement,
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
      type: String as PropType<FloatingPlacement>,
      default: 'top' as FloatingPlacement
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
     * Offset distance from trigger (in pixels)
     * @default 8
     */
    offset: {
      type: Number,
      default: 8
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

    // Internal state for uncontrolled mode
    const internalVisible = ref(props.visible ?? props.defaultVisible)
    const isControlled = computed(() => props.visible !== undefined)

    watch(
      () => props.visible,
      (next) => {
        if (next !== undefined) internalVisible.value = next
      }
    )

    // Element refs
    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)

    const tooltipId = createTooltipId()

    // Floating UI positioning
    const {
      x,
      y,
      placement: actualPlacement
    } = useVueFloating({
      referenceRef: triggerRef,
      floatingRef: floatingRef,
      enabled: internalVisible,
      placement: props.placement as FloatingPlacement,
      offset: props.offset
    })

    // Handle visibility change
    const setVisible = (nextVisible: boolean) => {
      if (props.disabled && nextVisible) return

      if (!isControlled.value) {
        internalVisible.value = nextVisible
      }

      emit('update:visible', nextVisible)
      emit('visible-change', nextVisible)
    }

    // Trigger event handlers
    const handleTriggerClick = () => {
      if (!props.disabled && props.trigger === 'click') setVisible(!internalVisible.value)
    }

    const handleMouseEnter = () => {
      if (!props.disabled && props.trigger === 'hover') setVisible(true)
    }

    const handleMouseLeave = () => {
      if (!props.disabled && props.trigger === 'hover') setVisible(false)
    }

    const handleFocus = () => {
      if (!props.disabled && props.trigger === 'focus') setVisible(true)
    }

    const handleBlur = () => {
      if (!props.disabled && props.trigger === 'focus') setVisible(false)
    }

    // Overlay dismiss (click outside + escape) — single watcher like Popover
    let outsideClickCleanup: (() => void) | undefined
    let escapeKeyCleanup: (() => void) | undefined

    watch([internalVisible, () => props.trigger], ([visible, trigger]) => {
      outsideClickCleanup?.()
      escapeKeyCleanup?.()
      outsideClickCleanup = undefined
      escapeKeyCleanup = undefined

      if (visible && trigger === 'click') {
        outsideClickCleanup = useVueClickOutside({
          enabled: internalVisible,
          containerRef,
          onOutsideClick: () => setVisible(false),
          defer: true
        })
      }
      if (visible && trigger !== 'manual') {
        escapeKeyCleanup = useVueEscapeKey({
          enabled: internalVisible,
          onEscape: () => setVisible(false)
        })
      }
    })

    onBeforeUnmount(() => {
      outsideClickCleanup?.()
      escapeKeyCleanup?.()
    })

    // Memoized classes
    const containerClasses = computed(() =>
      classNames(getTooltipContainerClasses(), props.className, coerceClassValue(attrsRecord.class))
    )
    const triggerClasses = computed(() => getTooltipTriggerClasses(props.disabled))
    const contentClasses = computed(() => getTooltipContentClasses())

    // Floating content styles
    const floatingStyles = computed(() => ({
      position: 'absolute' as const,
      left: `${x.value}px`,
      top: `${y.value}px`,
      transformOrigin: getTransformOrigin(actualPlacement.value),
      zIndex: 1000
    }))

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) return null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

      const hasTooltipContent = Boolean(props.content || slots.content)

      // Build trigger event handlers
      const triggerHandlers: Record<string, unknown> =
        props.trigger === 'click'
          ? { onClick: handleTriggerClick }
          : props.trigger === 'hover'
            ? { onMouseenter: handleMouseEnter, onMouseleave: handleMouseLeave }
            : props.trigger === 'focus'
              ? { onFocus: handleFocus, onBlur: handleBlur }
              : {}

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: props.style
        },
        [
          // Trigger element
          h(
            'div',
            {
              ref: triggerRef,
              class: triggerClasses.value,
              'aria-describedby': hasTooltipContent ? tooltipId : undefined,
              ...triggerHandlers
            },
            defaultSlot
          ),
          // Tooltip content (positioned with Floating UI)
          internalVisible.value
            ? h(
                'div',
                {
                  ref: floatingRef,
                  style: floatingStyles.value,
                  'aria-hidden': false
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
            : null
        ]
      )
    }
  }
})

export default Tooltip
