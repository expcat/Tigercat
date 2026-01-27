import {
  defineComponent,
  computed,
  ref,
  h,
  cloneVNode,
  isVNode,
  onBeforeUnmount,
  watch,
  PropType
} from 'vue'
import { useVueFloating, useVueClickOutside, useVueEscapeKey } from '../utils/overlay'
import {
  classNames,
  coerceClassValue,
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
  getTransformOrigin,
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

let popconfirmIdCounter = 0
const createPopconfirmId = () => `tiger-popconfirm-${++popconfirmIdCounter}`

export interface VuePopconfirmProps {
  className?: string
  style?: StyleValue
}

export const Popconfirm = defineComponent({
  name: 'TigerPopconfirm',
  inheritAttrs: false,
  props: {
    /**
     * Whether the popconfirm is visible (controlled mode)
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
     * Popconfirm title/question text
     */
    title: {
      type: String,
      default: '确定要执行此操作吗？'
    },
    /**
     * Popconfirm description text
     */
    description: {
      type: String,
      default: undefined
    },
    /**
     * Icon type to display
     * @default 'warning'
     */
    icon: {
      type: String as PropType<PopconfirmIconType>,
      default: 'warning' as PopconfirmIconType
    },
    /**
     * Whether to show icon
     * @default true
     */
    showIcon: {
      type: Boolean,
      default: true
    },
    /**
     * Confirm button text
     * @default '确定'
     */
    okText: {
      type: String,
      default: '确定'
    },
    /**
     * Cancel button text
     * @default '取消'
     */
    cancelText: {
      type: String,
      default: '取消'
    },
    /**
     * Confirm button type
     * @default 'primary'
     */
    okType: {
      type: String as PropType<'primary' | 'danger'>,
      default: 'primary' as const
    },
    /**
     * Popconfirm placement relative to trigger
     * @default 'top'
     */
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'top' as FloatingPlacement
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
     * Whether the popconfirm is disabled
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
  emits: ['update:visible', 'visible-change', 'confirm', 'cancel'],
  setup(props, { slots, emit, attrs }) {
    // Internal state for uncontrolled mode
    const internalVisible = ref(props.defaultVisible)

    // Computed visible state (controlled or uncontrolled)
    const currentVisible = computed(() => {
      return props.visible !== undefined ? props.visible : internalVisible.value
    })

    // Element refs
    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const floatingRef = ref<HTMLElement | null>(null)

    const popconfirmId = createPopconfirmId()
    const titleId = `${popconfirmId}-title`
    const descriptionId = `${popconfirmId}-description`

    // Floating UI positioning
    const {
      x,
      y,
      placement: actualPlacement
    } = useVueFloating({
      referenceRef: triggerRef,
      floatingRef: floatingRef,
      enabled: currentVisible,
      placement: props.placement as FloatingPlacement,
      offset: props.offset
    })

    // Handle visibility change
    const setVisible = (visible: boolean) => {
      if (props.disabled && visible) return

      // Update internal state if uncontrolled
      if (props.visible === undefined) {
        internalVisible.value = visible
      }

      // Emit events
      emit('update:visible', visible)
      emit('visible-change', visible)
    }

    // Handle confirm
    const handleConfirm = () => {
      setVisible(false)
      emit('confirm')
    }

    // Handle cancel
    const handleCancel = () => {
      setVisible(false)
      emit('cancel')
    }

    // Handle trigger click
    const handleTriggerClick = () => {
      if (props.disabled) return
      setVisible(!currentVisible.value)
    }

    // Click outside handler (close when clicking outside)
    // Click outside handler (close when clicking outside)
    let cleanupClickOutside: (() => void) | null = null

    watch(
      currentVisible,
      (visible) => {
        if (cleanupClickOutside) {
          cleanupClickOutside()
          cleanupClickOutside = null
        }

        if (visible) {
          cleanupClickOutside = useVueClickOutside({
            enabled: currentVisible,
            containerRef,
            onOutsideClick: () => setVisible(false),
            defer: true
          })
        }
      },
      { immediate: true }
    )

    // Escape key handler
    let cleanupEscapeKey: (() => void) | null = null

    watch(
      currentVisible,
      (visible) => {
        if (cleanupEscapeKey) {
          cleanupEscapeKey()
          cleanupEscapeKey = null
        }

        if (visible) {
          cleanupEscapeKey = useVueEscapeKey({
            enabled: currentVisible,
            onEscape: () => setVisible(false)
          })
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      cleanupClickOutside?.()
      cleanupEscapeKey?.()
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getPopconfirmContainerClasses(),
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    // Trigger classes
    const triggerClasses = computed(() => {
      return getPopconfirmTriggerClasses(props.disabled)
    })

    // Content wrapper classes (using Floating UI positioning)
    const contentWrapperClasses = computed(() => {
      return classNames('absolute z-50', currentVisible.value ? 'block' : 'hidden')
    })

    // Content wrapper styles (positioned by Floating UI)
    const contentWrapperStyles = computed(() => ({
      position: 'absolute' as const,
      left: `${x.value}px`,
      top: `${y.value}px`,
      transformOrigin: getTransformOrigin(actualPlacement.value)
    }))

    const arrowClasses = computed(() => {
      return getPopconfirmArrowClasses(actualPlacement.value)
    })

    // Content classes
    const contentClasses = computed(() => {
      return getPopconfirmContentClasses()
    })

    // Title classes
    const titleClasses = computed(() => {
      return getPopconfirmTitleClasses()
    })

    // Description classes
    const descriptionClasses = computed(() => {
      return getPopconfirmDescriptionClasses()
    })

    // Icon classes
    const iconClasses = computed(() => {
      return getPopconfirmIconClasses(props.icon)
    })

    // Buttons classes
    const buttonsClasses = computed(() => {
      return getPopconfirmButtonsClasses()
    })

    // Cancel button classes
    const cancelButtonClasses = computed(() => {
      return getPopconfirmCancelButtonClasses()
    })

    // OK button classes
    const okButtonClasses = computed(() => {
      return getPopconfirmOkButtonClasses(props.okType)
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
          style: contentWrapperStyles.value,
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
                class: contentClasses.value
              },
              [
                // Title section with icon
                h(
                  'div',
                  {
                    class: 'flex items-start'
                  },
                  [
                    // Icon
                    props.showIcon &&
                      h(
                        'div',
                        {
                          class: iconClasses.value,
                          'aria-hidden': 'true'
                        },
                        renderPopconfirmIcon(props.icon)
                      ),
                    // Title and description
                    h(
                      'div',
                      {
                        class: 'flex-1'
                      },
                      [
                        // Title
                        slots.title
                          ? h('div', { id: titleId, class: titleClasses.value }, slots.title())
                          : h('div', { id: titleId, class: titleClasses.value }, props.title),
                        // Description
                        hasDescription &&
                          h(
                            'div',
                            {
                              id: descriptionId,
                              class: descriptionClasses.value
                            },
                            slots.description ? slots.description() : props.description
                          )
                      ]
                    )
                  ]
                ),
                // Buttons
                h(
                  'div',
                  {
                    class: buttonsClasses.value
                  },
                  [
                    // Cancel button
                    h(
                      'button',
                      {
                        type: 'button',
                        class: cancelButtonClasses.value,
                        onClick: handleCancel
                      },
                      props.cancelText
                    ),
                    // OK button
                    h(
                      'button',
                      {
                        type: 'button',
                        class: okButtonClasses.value,
                        onClick: handleConfirm
                      },
                      props.okText
                    )
                  ]
                )
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
