import { defineComponent, computed, ref, h, onBeforeUnmount, watch, PropType } from 'vue'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'
import {
  classNames,
  coerceClassValue,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  getTransformOrigin,
  type PopoverTrigger,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

export interface VuePopoverProps {
  className?: string
  style?: StyleValue
}

let popoverIdCounter = 0
const createPopoverId = () => `tiger-popover-${++popoverIdCounter}`

export const Popover = defineComponent({
  name: 'TigerPopover',
  inheritAttrs: false,
  props: {
    /** Whether the popover is visible (controlled mode) */
    visible: {
      type: Boolean,
      default: undefined
    },
    /** Default visibility (uncontrolled mode) */
    defaultVisible: {
      type: Boolean,
      default: false
    },
    /** Popover title text */
    title: {
      type: String,
      default: undefined
    },
    /** Popover content text */
    content: {
      type: String,
      default: undefined
    },
    /** Trigger type @default 'click' */
    trigger: {
      type: String as PropType<PopoverTrigger>,
      default: 'click' as PopoverTrigger
    },
    /** Placement @default 'top' */
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'top' as FloatingPlacement
    },
    /** Disabled state */
    disabled: {
      type: Boolean,
      default: false
    },
    /** Width (pixel number or Tailwind class) */
    width: {
      type: [String, Number],
      default: undefined
    },
    /** Offset distance in pixels @default 8 */
    offset: {
      type: Number,
      default: 8
    },
    /** Additional CSS classes */
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

    const internalVisible = ref(
      props.visible !== undefined ? Boolean(props.visible) : props.defaultVisible
    )
    const isControlled = computed(() => props.visible !== undefined)

    watch(
      () => props.visible,
      (next) => {
        if (next !== undefined) internalVisible.value = Boolean(next)
      }
    )

    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)

    const popoverId = createPopoverId()
    const titleId = `${popoverId}-title`
    const contentId = `${popoverId}-content`

    const {
      x,
      y,
      placement: actualPlacement
    } = useVueFloating({
      referenceRef: triggerRef,
      floatingRef,
      enabled: internalVisible,
      placement: props.placement as FloatingPlacement,
      offset: props.offset
    })

    const setVisible = (nextVisible: boolean) => {
      if (props.disabled && nextVisible) return
      if (!isControlled.value) internalVisible.value = nextVisible
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
    const handleFocusIn = () => {
      if (!props.disabled && props.trigger === 'focus') setVisible(true)
    }
    const handleFocusOut = () => {
      if (!props.disabled && props.trigger === 'focus') setVisible(false)
    }

    // Overlay dismiss (click outside + escape)
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

    // Classes (only reactive ones use computed)
    const containerClasses = computed(() =>
      classNames(getPopoverContainerClasses(), props.className, coerceClassValue(attrsRecord.class))
    )
    const triggerClasses = computed(() => getPopoverTriggerClasses(props.disabled))
    const contentClasses = computed(() => getPopoverContentClasses(props.width))

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

      const hasTitle = Boolean(props.title || slots.title)
      const hasContent = Boolean(props.content || slots.content)

      // Build trigger event handlers based on trigger type
      const triggerHandlers: Record<string, unknown> =
        props.trigger === 'click'
          ? { onClick: handleTriggerClick }
          : props.trigger === 'hover'
            ? { onMouseenter: handleMouseEnter, onMouseleave: handleMouseLeave }
            : props.trigger === 'focus'
              ? { onFocusin: handleFocusIn, onFocusout: handleFocusOut }
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
          // Trigger
          h(
            'div',
            {
              ref: triggerRef,
              class: triggerClasses.value,
              'aria-haspopup': 'dialog',
              'aria-disabled': props.disabled ? 'true' : undefined,
              ...triggerHandlers
            },
            defaultSlot
          ),
          // Floating content
          internalVisible.value
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
