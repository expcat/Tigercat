import {
  defineComponent,
  computed,
  h,
  cloneVNode,
  isVNode,
  PropType
} from 'vue'
import { useFloatingPopup } from '../utils/use-floating-popup'
import {
  classNames,
  coerceClassValue,
  createFloatingIdFactory,
  getPopconfirmIconPath,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmArrowClasses,
  getPopconfirmButtonsClasses,
  getPopconfirmCancelButtonClasses,
  getPopconfirmOkButtonClasses,
  mergeStyleValues,
  popconfirmIconPathStrokeLinecap,
  popconfirmIconPathStrokeLinejoin,
  popconfirmIconStrokeWidth,
  popconfirmIconViewBox,
  type PopconfirmIconType,
  type FloatingPlacement,
  type StyleValue
} from '@expcat/tigercat-core'

const renderPopconfirmIcon = (iconType: PopconfirmIconType) => {
  return h(
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
}

const createPopconfirmId = createFloatingIdFactory('popconfirm')

export interface VuePopconfirmProps {
  className?: string
  style?: StyleValue
}

export const Popconfirm = defineComponent({
  name: 'TigerPopconfirm',
  inheritAttrs: false,
  props: {
    /** Whether the popconfirm is visible (controlled mode) */
    visible: { type: Boolean, default: undefined },
    /** Default visibility (uncontrolled mode) @default false */
    defaultVisible: { type: Boolean, default: false },
    /** Popconfirm title/question text */
    title: { type: String, default: '确定要执行此操作吗？' },
    /** Popconfirm description text */
    description: { type: String, default: undefined },
    /** Icon type to display @default 'warning' */
    icon: {
      type: String as PropType<PopconfirmIconType>,
      default: 'warning' as PopconfirmIconType
    },
    /** Whether to show icon @default true */
    showIcon: { type: Boolean, default: true },
    /** Confirm button text @default '确定' */
    okText: { type: String, default: '确定' },
    /** Cancel button text @default '取消' */
    cancelText: { type: String, default: '取消' },
    /** Confirm button type @default 'primary' */
    okType: { type: String as PropType<'primary' | 'danger'>, default: 'primary' as const },
    /** Placement @default 'top' */
    placement: { type: String as PropType<FloatingPlacement>, default: 'top' as FloatingPlacement },
    /** Offset in pixels @default 8 */
    offset: { type: Number, default: 8 },
    /** Disabled state @default false */
    disabled: { type: Boolean, default: false },
    /** Additional CSS classes */
    className: { type: String, default: undefined },
    style: { type: [String, Object, Array] as PropType<StyleValue>, default: undefined }
  },
  emits: ['update:visible', 'visible-change', 'confirm', 'cancel'],
  setup(props, { slots, emit, attrs }) {
    // Shared floating-popup logic (click-only, multiTrigger=false)
    const {
      currentVisible,
      setVisible,
      containerRef,
      triggerRef,
      floatingRef,
      floatingStyles,
      actualPlacement
    } = useFloatingPopup({ props, emit, multiTrigger: false })

    const popconfirmId = createPopconfirmId()
    const titleId = `${popconfirmId}-title`
    const descriptionId = `${popconfirmId}-description`

    // Handle confirm / cancel
    const handleConfirm = () => {
      emit('confirm')
      setVisible(false)
    }
    const handleCancel = () => {
      emit('cancel')
      setVisible(false)
    }
    const handleTriggerClick = () => {
      if (props.disabled) return
      setVisible(!currentVisible.value)
    }

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getPopconfirmContainerClasses(),
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const triggerClasses = computed(() => getPopconfirmTriggerClasses(props.disabled))

    const contentWrapperClasses = computed(() =>
      classNames('absolute z-50', currentVisible.value ? 'block' : 'hidden')
    )

    const arrowClasses = computed(() => getPopconfirmArrowClasses(actualPlacement.value))

    // Static class strings (no reactive deps)
    const contentClasses = getPopconfirmContentClasses()
    const titleClasses = getPopconfirmTitleClasses()
    const descriptionClasses = getPopconfirmDescriptionClasses()
    const buttonsClasses = getPopconfirmButtonsClasses()
    const cancelButtonClasses = getPopconfirmCancelButtonClasses()

    // Dynamic class strings
    const iconClasses = computed(() => getPopconfirmIconClasses(props.icon))
    const okButtonClasses = computed(() => getPopconfirmOkButtonClasses(props.okType))

    return () => {
      const defaultSlot = slots.default?.()
      if (!defaultSlot || defaultSlot.length === 0) return null

      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrs as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      const triggerA11yProps = {
        'aria-haspopup': 'dialog',
        'aria-expanded': Boolean(currentVisible.value),
        'aria-controls': currentVisible.value ? popconfirmId : undefined,
        'aria-disabled': props.disabled ? 'true' : undefined
      } as const

      const trigger = (() => {
        if (defaultSlot.length === 1) {
          const only = defaultSlot[0]
          if (isVNode(only)) {
            const existingProps = (only.props ?? {}) as {
              class?: unknown
              onClick?: unknown
            }

            const existingOnClick = existingProps.onClick
            const onClick = (event: MouseEvent) => {
              if (typeof existingOnClick === 'function') {
                ;(existingOnClick as (e: MouseEvent) => void)(event)
              } else if (Array.isArray(existingOnClick)) {
                for (const handler of existingOnClick) {
                  if (typeof handler === 'function') {
                    ;(handler as (e: MouseEvent) => void)(event)
                  }
                }
              }

              if (event.defaultPrevented) return
              handleTriggerClick()
            }

            return h(
              'div',
              {
                ref: triggerRef,
                class: 'inline-block'
              },
              [
                cloneVNode(
                  only,
                  {
                    ...triggerA11yProps,
                    class: classNames(coerceClassValue(existingProps.class), triggerClasses.value),
                    onClick
                  },
                  true
                )
              ]
            )
          }
        }

        return h(
          'div',
          {
            ref: triggerRef,
            class: triggerClasses.value,
            onClick: handleTriggerClick,
            role: 'button',
            tabindex: props.disabled ? -1 : 0,
            onKeydown: (event: KeyboardEvent) => {
              if (props.disabled) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleTriggerClick()
              }
            },
            ...triggerA11yProps
          },
          defaultSlot
        )
      })()

      const hasDescription = Boolean(props.description || slots.description)

      const content = h(
        'div',
        {
          ref: floatingRef,
          class: contentWrapperClasses.value,
          style: floatingStyles.value,
          hidden: !currentVisible.value,
          'aria-hidden': !currentVisible.value
        },
        [
          h('div', { class: 'relative' }, [
            h('div', { class: arrowClasses.value, 'aria-hidden': 'true' }),
            h(
              'div',
              {
                id: popconfirmId,
                role: 'dialog',
                'aria-modal': 'false',
                'aria-labelledby': titleId,
                'aria-describedby': hasDescription ? descriptionId : undefined,
                class: contentClasses
              },
              [
                // Title section with icon
                h('div', { class: 'flex items-start' }, [
                  props.showIcon &&
                    h(
                      'div',
                      { class: iconClasses.value, 'aria-hidden': 'true' },
                      renderPopconfirmIcon(props.icon)
                    ),
                  h('div', { class: 'flex-1' }, [
                    slots.title
                      ? h('div', { id: titleId, class: titleClasses }, slots.title())
                      : h('div', { id: titleId, class: titleClasses }, props.title),
                    hasDescription &&
                      h(
                        'div',
                        { id: descriptionId, class: descriptionClasses },
                        slots.description ? slots.description() : props.description
                      )
                  ])
                ]),
                // Buttons
                h('div', { class: buttonsClasses }, [
                  h(
                    'button',
                    { type: 'button', class: cancelButtonClasses, onClick: handleCancel },
                    props.cancelText
                  ),
                  h(
                    'button',
                    { type: 'button', class: okButtonClasses.value, onClick: handleConfirm },
                    props.okText
                  )
                ])
              ]
            )
          ])
        ]
      )

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
        },
        [trigger, content]
      )
    }
  }
})

export default Popconfirm
