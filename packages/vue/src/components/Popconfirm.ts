import { defineComponent, computed, h, nextTick, PropType, ref, useId, watch } from 'vue'
import { usePopup } from '../utils/use-popup'
import { renderVueOverlayTeleport, useVueFocusTrap } from '../utils/overlay'
import {
  assignOverlayTriggerRef,
  renderOverlayTrigger,
  resolveOverlayTriggerElement
} from '../utils/overlay-trigger'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import {
  classNames,
  coerceClassValue,
  getArrowStyles,
  getOverlayTriggerAria,
  getPopconfirmIconPath,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmArrowClasses,
  getPopconfirmButtonsClasses,
  mergeStyleValues,
  popconfirmIconPathStrokeLinecap,
  popconfirmIconPathStrokeLinejoin,
  popconfirmIconStrokeWidth,
  popconfirmIconViewBox,
  resolveLocaleText,
  type PopconfirmIconType,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

const renderPopconfirmIcon = (iconType: PopconfirmIconType) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: popconfirmIconViewBox,
      'stroke-width': String(popconfirmIconStrokeWidth),
      stroke: 'currentColor'
    },
    [
      h('path', {
        'stroke-linecap': popconfirmIconPathStrokeLinecap,
        'stroke-linejoin': popconfirmIconPathStrokeLinejoin,
        d: getPopconfirmIconPath(iconType)
      })
    ]
  )

export interface VuePopconfirmProps {
  open?: boolean
  defaultOpen?: boolean
  title?: string
  description?: string
  icon?: PopconfirmIconType
  showIcon?: boolean
  okText?: string
  cancelText?: string
  okType?: 'primary' | 'danger'
  placement?: FloatingPlacement
  offset?: number
  disabled?: boolean
  asChild?: boolean
  className?: string
  style?: StyleValue
}

export type PopconfirmProps = VuePopconfirmProps

export const Popconfirm = defineComponent({
  name: 'TigerPopconfirm',
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    icon: {
      type: String as PropType<PopconfirmIconType>,
      default: 'warning' as PopconfirmIconType
    },
    showIcon: { type: Boolean, default: true },
    okText: { type: String, default: undefined },
    cancelText: { type: String, default: undefined },
    okType: { type: String as PropType<'primary' | 'danger'>, default: 'primary' as const },
    placement: { type: String as PropType<FloatingPlacement>, default: 'top' as FloatingPlacement },
    offset: { type: Number, default: 8 },
    disabled: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    style: { type: [String, Object, Array] as PropType<StyleValue>, default: undefined }
  },
  emits: ['update:open', 'open-change', 'confirm', 'cancel'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const arrowRef = ref<HTMLElement | null>(null)
    const cancelRef = ref<HTMLElement | null>(null)
    const confirming = ref(false)

    const {
      currentVisible,
      setVisible,
      containerRef,
      triggerRef,
      floatingRef,
      closeAndRestoreFocus,
      floatingStyles,
      floatingClasses,
      positioned,
      overlayTarget,
      actualPlacement,
      arrowX,
      arrowY
    } = usePopup({ props, emit, multiTrigger: false, arrowRef })

    useVueFocusTrap({ enabled: currentVisible, containerRef: floatingRef })

    watch(currentVisible, (visible) => {
      if (!visible) {
        confirming.value = false
        return
      }
      nextTick(() => {
        resolveOverlayTriggerElement(cancelRef.value)?.focus()
      })
    })

    const popconfirmId = `tiger-popconfirm-${useId()}`
    const titleId = `${popconfirmId}-title`
    const descriptionId = `${popconfirmId}-description`

    const resolvedTitle = computed(() =>
      resolveLocaleText(
        'Are you sure you want to continue?',
        props.title,
        config.value.locale?.common?.confirmTitle
      )
    )
    const resolvedOkText = computed(() =>
      resolveLocaleText('OK', props.okText, config.value.locale?.common?.okText)
    )
    const resolvedCancelText = computed(() =>
      resolveLocaleText('Cancel', props.cancelText, config.value.locale?.common?.cancelText)
    )

    const handleConfirm = () => {
      emit('confirm')
      closeAndRestoreFocus()
    }

    const handleCancel = () => {
      if (confirming.value) return
      emit('cancel')
      closeAndRestoreFocus()
    }

    const containerClasses = computed(() =>
      classNames(
        getPopconfirmContainerClasses(),
        props.className,
        coerceClassValue((attrs as { class?: unknown }).class)
      )
    )
    const triggerClasses = computed(() => getPopconfirmTriggerClasses(props.disabled))
    const iconClasses = computed(() => getPopconfirmIconClasses(props.icon))
    const arrowClasses = getPopconfirmArrowClasses()
    const contentClasses = getPopconfirmContentClasses()
    const titleClasses = getPopconfirmTitleClasses()
    const descriptionClasses = getPopconfirmDescriptionClasses()
    const buttonsClasses = getPopconfirmButtonsClasses()
    const arrowStyle = computed(() =>
      getArrowStyles(actualPlacement.value, { x: arrowX.value, y: arrowY.value })
    )

    return () => {
      const triggerSlot = slots.trigger?.({ open: currentVisible.value })
      const defaultSlot = triggerSlot ?? slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) return null

      const {
        class: _class,
        style: _style,
        title: _title,
        onConfirm: _onConfirm,
        ...restAttrs
      } = attrs as {
        class?: unknown
        style?: unknown
        title?: unknown
        onConfirm?: unknown
      } & Record<string, unknown>

      const describedBy = props.description || slots.description ? descriptionId : undefined
      const triggerAria = getOverlayTriggerAria({
        kind: 'dialog',
        open: currentVisible.value,
        controlsId: popconfirmId,
        disabled: props.disabled
      })

      const trigger = renderOverlayTrigger({
        asChild: props.asChild,
        child: defaultSlot.length === 1 ? defaultSlot[0] : defaultSlot,
        setTriggerRef: (el) => assignOverlayTriggerRef(triggerRef, el),
        className: props.asChild ? undefined : triggerClasses.value,
        disabled: props.disabled,
        preventDefaultOnClick: true,
        aria: triggerAria,
        handlers: {
          onClick: () => {
            if (props.disabled) return
            setVisible(!currentVisible.value)
          }
        }
      })

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: mergeStyleValues(props.style)
        },
        [
          trigger,
          renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: floatingRef,
                class: floatingClasses.value,
                style: floatingStyles.value,
                'data-positioned': positioned.value,
                hidden: !currentVisible.value,
                'aria-hidden': !currentVisible.value
              },
              [
                h('div', { class: 'relative' }, [
                  h('div', {
                    ref: arrowRef,
                    class: arrowClasses,
                    style: arrowStyle.value,
                    'aria-hidden': 'true'
                  }),
                  h(
                    'div',
                    {
                      id: popconfirmId,
                      role: 'dialog',
                      'aria-modal': 'false',
                      tabindex: -1,
                      'aria-labelledby': titleId,
                      'aria-describedby': describedBy,
                      class: contentClasses
                    },
                    [
                      h('div', { class: 'flex items-start' }, [
                        props.showIcon
                          ? h('div', { class: iconClasses.value, 'aria-hidden': 'true' }, [
                              renderPopconfirmIcon(props.icon)
                            ])
                          : null,
                        h('div', { class: 'flex-1' }, [
                          h(
                            'div',
                            { id: titleId, class: titleClasses },
                            slots.title ? slots.title() : resolvedTitle.value
                          ),
                          props.description || slots.description
                            ? h(
                                'div',
                                { id: descriptionId, class: descriptionClasses },
                                slots.description ? slots.description() : props.description
                              )
                            : null
                        ])
                      ]),
                      h('div', { class: buttonsClasses }, [
                        h(
                          Button,
                          {
                            ref: cancelRef,
                            size: 'sm',
                            variant: 'outline',
                            onClick: handleCancel
                          },
                          { default: () => resolvedCancelText.value }
                        ),
                        h(
                          Button,
                          {
                            size: 'sm',
                            variant: 'primary',
                            danger: props.okType === 'danger',
                            loading: confirming.value,
                            onClick: () => void handleConfirm()
                          },
                          { default: () => resolvedOkText.value }
                        )
                      ])
                    ]
                  )
                ])
              ]
            ),
            overlayTarget.value
          )
        ]
      )
    }
  }
})

export default Popconfirm
