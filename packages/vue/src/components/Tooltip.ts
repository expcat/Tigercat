import { defineComponent, computed, h, PropType } from 'vue'
import { useFloatingPopup } from '../utils/use-floating-popup'
import {
  classNames,
  coerceClassValue,
  createFloatingIdFactory,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  type TooltipTrigger,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

export interface VueTooltipProps {
  className?: string
  style?: StyleValue
}

const createTooltipId = createFloatingIdFactory('tooltip')

export const Tooltip = defineComponent({
  name: 'TigerTooltip',
  inheritAttrs: false,
  props: {
    /** Whether the tooltip is visible (controlled mode) */
    visible: { type: Boolean, default: undefined },
    /** Default visibility (uncontrolled mode) @default false */
    defaultVisible: { type: Boolean, default: false },
    /** Tooltip content text */
    content: { type: String, default: undefined },
    /** Trigger type @default 'hover' */
    trigger: { type: String as PropType<TooltipTrigger>, default: 'hover' as TooltipTrigger },
    /** Placement @default 'top' */
    placement: { type: String as PropType<FloatingPlacement>, default: 'top' as FloatingPlacement },
    /** Disabled state @default false */
    disabled: { type: Boolean, default: false },
    /** Offset in pixels @default 8 */
    offset: { type: Number, default: 8 },
    /** Additional CSS classes */
    className: { type: String, default: undefined },
    style: { type: [String, Object, Array] as PropType<StyleValue>, default: undefined }
  },
  emits: ['update:visible', 'visible-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>

    // Shared floating-popup logic
    const {
      currentVisible,
      containerRef,
      triggerRef,
      floatingRef,
      floatingStyles,
      triggerHandlers
    } = useFloatingPopup({ props, emit })

    const tooltipId = createTooltipId()

    // Memoized classes
    const containerClasses = computed(() =>
      classNames(getTooltipContainerClasses(), props.className, coerceClassValue(attrsRecord.class))
    )
    const triggerClasses = computed(() => getTooltipTriggerClasses(props.disabled))
    const contentClasses = computed(() => getTooltipContentClasses())

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) return null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

      const hasTooltipContent = Boolean(props.content || slots.content)

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
              ...triggerHandlers.value
            },
            defaultSlot
          ),
          // Tooltip content (positioned with Floating UI)
          currentVisible.value
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
