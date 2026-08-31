import { defineComponent, computed, h, PropType, useId } from 'vue'
import { usePopup } from '../utils/use-popup'
import { renderVueOverlayTeleport } from '../utils/overlay'
import { assignOverlayTriggerRef, renderOverlayTrigger } from '../utils/overlay-trigger'
import {
  classNames,
  coerceClassValue,
  getOverlayTriggerAria,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  type TooltipTrigger,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

export interface VueTooltipProps {
  open?: boolean
  defaultOpen?: boolean
  content?: string
  trigger?: TooltipTrigger
  placement?: FloatingPlacement
  disabled?: boolean
  offset?: number
  asChild?: boolean
  className?: string
  style?: StyleValue
}

export type TooltipProps = VueTooltipProps

export const Tooltip = defineComponent({
  name: 'TigerTooltip',
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    content: { type: String, default: undefined },
    trigger: { type: String as PropType<TooltipTrigger>, default: 'hover' as TooltipTrigger },
    placement: { type: String as PropType<FloatingPlacement>, default: 'top' as FloatingPlacement },
    disabled: { type: Boolean, default: false },
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

    const tooltipId = `tiger-tooltip-${useId()}`

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
        title: _title,
        ...restAttrs
      } = attrsRecord as { class?: unknown; style?: unknown; title?: unknown } & Record<
        string,
        unknown
      >

      const triggerAria = getOverlayTriggerAria({
        kind: 'tooltip',
        open: currentVisible.value,
        describedBy: tooltipId,
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
            child: defaultSlot.length === 1 ? defaultSlot[0] : defaultSlot,
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
                      { id: tooltipId, role: 'tooltip', class: contentClasses.value },
                      slots.content ? slots.content() : props.content
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

export default Tooltip
