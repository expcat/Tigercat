import { defineComponent, computed, h, nextTick, PropType, useId, watch } from 'vue'
import { usePopup } from '../utils/use-popup'
import { renderVueOverlayTeleport, useVueFocusTrap } from '../utils/overlay'
import { assignOverlayTriggerRef, renderOverlayTrigger } from '../utils/overlay-trigger'
import {
  classNames,
  coerceClassValue,
  getFocusableElements,
  getOverlayTriggerAria,
  getPopoverContainerClasses,
  getPopoverContentClasses,
  getPopoverContentStyle,
  getPopoverTriggerClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  type PopoverTrigger,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

export interface VuePopoverProps {
  open?: boolean
  defaultOpen?: boolean
  title?: string
  content?: string
  trigger?: PopoverTrigger
  placement?: FloatingPlacement
  disabled?: boolean
  width?: number | string
  offset?: number
  asChild?: boolean
  className?: string
  style?: StyleValue
}

export type PopoverProps = VuePopoverProps

export const Popover = defineComponent({
  name: 'TigerPopover',
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    content: { type: String, default: undefined },
    trigger: { type: String as PropType<PopoverTrigger>, default: 'click' as PopoverTrigger },
    placement: { type: String as PropType<FloatingPlacement>, default: 'top' as FloatingPlacement },
    disabled: { type: Boolean, default: false },
    width: { type: [Number, String], default: undefined },
    offset: { type: Number, default: 8 },
    asChild: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    style: { type: [String, Object, Array] as PropType<StyleValue>, default: undefined }
  },
  emits: ['update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>

    const {
      currentVisible,
      containerRef,
      triggerRef,
      floatingRef,
      floatingStyles,
      floatingClasses,
      positioned,
      overlayTarget,
      triggerHandlers
    } = usePopup({ props, emit })

    const trapEnabled = computed(() => currentVisible.value && props.trigger === 'click')
    useVueFocusTrap({ enabled: trapEnabled, containerRef: floatingRef })

    watch(currentVisible, (visible) => {
      if (!visible || props.trigger !== 'click') return
      nextTick(() => {
        const root = floatingRef.value
        if (!root) return
        const dialog = root.querySelector<HTMLElement>('[role="dialog"]') ?? root
        const first = getFocusableElements(dialog)[0] ?? dialog
        first.focus()
      })
    })

    const popoverId = `tiger-popover-${useId()}`
    const titleId = `${popoverId}-title`
    const contentId = `${popoverId}-content`

    const containerClasses = computed(() =>
      classNames(getPopoverContainerClasses(), props.className, coerceClassValue(attrsRecord.class))
    )
    const triggerClasses = computed(() => getPopoverTriggerClasses(props.disabled))
    const hasCustomWidth = computed(() => Boolean(getPopoverContentStyle(props.width)))
    const contentClasses = computed(() => getPopoverContentClasses(hasCustomWidth.value))
    const contentStyle = computed(() => getPopoverContentStyle(props.width))

    return () => {
      const triggerSlotContent = slots.trigger
        ? slots.trigger({ open: currentVisible.value })
        : slots.default?.()
      if (!triggerSlotContent || triggerSlotContent.length === 0) return null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown } & Record<string, unknown>

      const hasTitle = Boolean(props.title || slots.title)
      const hasContent = Boolean(props.content || slots.content)
      const triggerAria = getOverlayTriggerAria({
        kind: 'dialog',
        open: currentVisible.value,
        controlsId: popoverId,
        disabled: props.disabled
      })

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: props.style
        },
        [
          renderOverlayTrigger({
            asChild: props.asChild,
            child: triggerSlotContent.length === 1 ? triggerSlotContent[0] : triggerSlotContent,
            setTriggerRef: (el) => assignOverlayTriggerRef(triggerRef, el),
            className: props.asChild ? undefined : triggerClasses.value,
            disabled: props.disabled,
            aria: triggerAria,
            handlers: triggerHandlers.value
          }),
          currentVisible.value
            ? renderVueOverlayTeleport(
                h(
                  'div',
                  {
                    ref: floatingRef,
                    class: floatingClasses.value,
                    style: floatingStyles.value,
                    'data-positioned': positioned.value,
                    'aria-hidden': false
                  },
                  [
                    h(
                      'div',
                      {
                        id: popoverId,
                        role: 'dialog',
                        'aria-modal': 'false',
                        tabindex: -1,
                        'aria-label': hasTitle ? undefined : props.title || props.content,
                        'aria-labelledby': hasTitle ? titleId : undefined,
                        'aria-describedby': hasContent ? contentId : undefined,
                        class: contentClasses.value,
                        style: contentStyle.value
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
                ),
                overlayTarget.value
              )
            : null
        ]
      )
    }
  }
})

export default Popover
