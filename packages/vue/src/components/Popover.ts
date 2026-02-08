import { defineComponent, computed, h, PropType } from 'vue'
import { useFloatingPopup } from '../utils/use-floating-popup'
import {
  classNames,
  coerceClassValue,
  createFloatingIdFactory,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  type PopoverTrigger,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

export interface VuePopoverProps {
  className?: string
  style?: StyleValue
}

const createPopoverId = createFloatingIdFactory('popover')

export const Popover = defineComponent({
  name: 'TigerPopover',
  inheritAttrs: false,
  props: {
    /** Whether the popover is visible (controlled mode) */
    visible: { type: Boolean, default: undefined },
    /** Default visibility (uncontrolled mode) */
    defaultVisible: { type: Boolean, default: false },
    /** Popover title text */
    title: { type: String, default: undefined },
    /** Popover content text */
    content: { type: String, default: undefined },
    /** Trigger type @default 'click' */
    trigger: { type: String as PropType<PopoverTrigger>, default: 'click' as PopoverTrigger },
    /** Placement @default 'top' */
    placement: { type: String as PropType<FloatingPlacement>, default: 'top' as FloatingPlacement },
    /** Disabled state */
    disabled: { type: Boolean, default: false },
    /** Width (pixel number or Tailwind class) */
    width: { type: [String, Number], default: undefined },
    /** Offset distance in pixels @default 8 */
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

    const popoverId = createPopoverId()
    const titleId = `${popoverId}-title`
    const contentId = `${popoverId}-content`

    // Classes (only reactive ones use computed)
    const containerClasses = computed(() =>
      classNames(getPopoverContainerClasses(), props.className, coerceClassValue(attrsRecord.class))
    )
    const triggerClasses = computed(() => getPopoverTriggerClasses(props.disabled))
    const contentClasses = computed(() => getPopoverContentClasses(props.width))

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) return null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

      const hasTitle = Boolean(props.title || slots.title)
      const hasContent = Boolean(props.content || slots.content)

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: props.style
        },
        [
          // Trigger
          h(
            'div',
            {
              ref: triggerRef,
              class: triggerClasses.value,
              'aria-haspopup': 'dialog',
              'aria-disabled': props.disabled ? 'true' : undefined,
              ...triggerHandlers.value
            },
            defaultSlot
          ),
          // Floating content
          currentVisible.value
            ? h(
                'div',
                { ref: floatingRef, style: floatingStyles.value, 'aria-hidden': false },
                [
                  h(
                    'div',
                    {
                      id: popoverId,
                      role: 'dialog',
                      'aria-modal': 'false',
                      'aria-labelledby': hasTitle ? titleId : undefined,
                      'aria-describedby': hasContent ? contentId : undefined,
                      class: contentClasses.value
                    },
                    [
                      hasTitle &&
                        h(
                          'div',
                          { id: titleId, class: POPOVER_TITLE_CLASSES },
                          slots.title ? slots.title() : props.title
                        ),
                      hasContent &&
                        h(
                          'div',
                          { id: contentId, class: POPOVER_TEXT_CLASSES },
                          slots.content ? slots.content() : props.content
                        )
                    ].filter(Boolean)
                  )
                ]
              )
            : null
        ]
      )
    }
  }
})

export default Popover
