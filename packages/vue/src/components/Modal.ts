import {
  defineComponent,
  h,
  Teleport,
  ref,
  PropType,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  getModalContentClasses,
  modalWrapperClasses,
  modalMaskClasses,
  getModalContainerClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalFooterClasses,
  resolveLocaleText,
  getFocusableElements,
  getFocusTrapNavigation,
  type TigerLocale,
  type ModalSize
} from '@expcat/tigercat-core'

import { Button } from './Button'

let modalIdCounter = 0
const createModalId = () => `tiger-modal-${++modalIdCounter}`

export interface VueModalProps {
  open?: boolean
  size?: ModalSize
  title?: string
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  centered?: boolean
  destroyOnClose?: boolean
  zIndex?: number
  className?: string
  style?: Record<string, unknown>
  closeAriaLabel?: string
  okText?: string
  cancelText?: string
  locale?: Partial<TigerLocale>
}

export const Modal = defineComponent({
  name: 'TigerModal',
  inheritAttrs: false,
  props: {
    /**
     * Whether the modal is open
     * @default false
     */
    open: {
      type: Boolean,
      default: false
    },
    /**
     * Modal size
     * @default 'md'
     */
    size: {
      type: String as PropType<ModalSize>,
      default: 'md' as ModalSize
    },
    /**
     * Custom width (overrides size)
     */
    width: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /**
     * Modal title
     */
    title: {
      type: String,
      default: undefined
    },
    /**
     * Whether to show the close button
     * @default true
     */
    closable: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to show the mask (overlay)
     * @default true
     */
    mask: {
      type: Boolean,
      default: true
    },
    /**
     * Whether clicking the mask should close the modal
     * @default true
     */
    maskClosable: {
      type: Boolean,
      default: true
    },
    /**
     * Whether the modal should be centered vertically
     * @default false
     */
    centered: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to destroy the modal content when closed
     * @default false
     */
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    /**
     * z-index of the modal
     * @default 1000
     */
    zIndex: {
      type: Number,
      default: 1000
    },
    /**
     * Custom class name
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom inline style
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },

    /**
     * Close button aria-label
     * @default 'Close'
     */
    closeAriaLabel: {
      type: String,
      default: undefined
    },

    /**
     * Default OK button text (used in default footer)
     * @default '确定'
     */
    okText: {
      type: String,
      default: undefined
    },

    /**
     * Default Cancel button text (used in default footer)
     * @default '取消'
     */
    cancelText: {
      type: String,
      default: undefined
    },

    /**
     * Locale overrides for common texts
     */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },

    /**
     * Whether to render a default footer when no `footer` slot is provided
     * @default false
     */
    showDefaultFooter: {
      type: Boolean,
      default: false
    },
    /**
     * Disable teleport (useful for testing)
     * @default false
     * @internal
     */
    disableTeleport: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the modal is draggable by its header
     * @default false
     */
    draggable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'close', 'cancel', 'ok'],
  setup(props, { slots, emit, attrs }) {
    const instanceId = ref<string>(createModalId())
    const hasBeenOpened = ref(props.open)

    const dialogRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    const previousActiveElement = ref<HTMLElement | null>(null)

    // Drag state
    const dragOffset = ref({ x: 0, y: 0 })
    const isDragging = ref(false)
    const dragStart = ref({ x: 0, y: 0 })

    const handleDragMouseDown = (e: MouseEvent) => {
      if (!props.draggable) return
      isDragging.value = true
      dragStart.value = { x: e.clientX - dragOffset.value.x, y: e.clientY - dragOffset.value.y }
      const onMouseMove = (ev: MouseEvent) => {
        dragOffset.value = { x: ev.clientX - dragStart.value.x, y: ev.clientY - dragStart.value.y }
      }
      const onMouseUp = () => {
        isDragging.value = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const titleId = computed(() => `${instanceId.value}-title`)

    const shouldRender = computed(() => {
      if (props.open) return true
      if (props.destroyOnClose) return false
      return hasBeenOpened.value
    })

    const handleClose = () => {
      emit('update:open', false)
      emit('cancel')
    }

    const handleOk = () => {
      emit('ok')
      emit('update:open', false)
    }

    const handleMaskClick = (event: MouseEvent) => {
      if (props.maskClosable && event.target === event.currentTarget) {
        handleClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && props.open) {
        handleClose()
        return
      }

      // Handle Tab key for focus trap
      if (event.key === 'Tab' && props.open && dialogRef.value) {
        const focusables = getFocusableElements(dialogRef.value)
        const result = getFocusTrapNavigation(event, focusables, document.activeElement)

        if (result.shouldHandle && result.next) {
          event.preventDefault()
          result.next.focus()
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown)
    })

    watch(
      () => props.open,
      async (nextVisible) => {
        if (nextVisible) {
          hasBeenOpened.value = true

          const active = document.activeElement
          previousActiveElement.value = active instanceof HTMLElement ? active : null

          await nextTick()
          const el = closeButtonRef.value ?? dialogRef.value
          el?.focus?.()
        } else {
          emit('close')
          previousActiveElement.value?.focus?.()
          dragOffset.value = { x: 0, y: 0 }
        }
      }
    )

    const contentClasses = computed(() => {
      return getModalContentClasses(props.size, props.className)
    })

    const containerClasses = computed(() => {
      return getModalContainerClasses(props.centered)
    })

    const CloseIcon = h(
      'svg',
      {
        class: 'h-5 w-5',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: closeIconViewBox,
        stroke: 'currentColor'
      },
      [
        h('path', {
          'stroke-linecap': closeIconPathStrokeLinecap,
          'stroke-linejoin': closeIconPathStrokeLinejoin,
          'stroke-width': closeIconPathStrokeWidth,
          d: closeIconPathD
        })
      ]
    )

    return () => {
      if (!shouldRender.value) {
        return null
      }

      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      const ariaLabelledbyFromAttrs =
        typeof attrs['aria-labelledby'] === 'string'
          ? (attrs['aria-labelledby'] as string)
          : undefined

      const ariaLabelledby =
        ariaLabelledbyFromAttrs ?? (props.title || slots.title ? titleId.value : undefined)

      const mergedClass = classNames(contentClasses.value, coerceClassValue(attrs.class))

      const widthStyle = props.width
        ? {
            width: typeof props.width === 'number' ? `${props.width}px` : props.width,
            maxWidth: '100%'
          }
        : undefined
      const mergedStyle = mergeStyleValues(attrs.style, props.style, widthStyle)
      const dragStyle =
        props.draggable && (dragOffset.value.x !== 0 || dragOffset.value.y !== 0)
          ? { transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)` }
          : undefined
      const finalStyle = mergeStyleValues(mergedStyle, dragStyle)

      const header =
        props.title || slots.title || props.closable
          ? h(
              'div',
              {
                class: modalHeaderClasses,
                onMousedown: props.draggable ? handleDragMouseDown : undefined,
                style: props.draggable ? 'cursor: grab; user-select: none' : undefined
              },
              [
                props.title || slots.title
                  ? h(
                      'h3',
                      {
                        id: titleId.value,
                        class: modalTitleClasses
                      },
                      slots.title ? slots.title() : props.title
                    )
                  : null,
                props.closable
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: modalCloseButtonClasses,
                        onClick: handleClose,
                        'aria-label': resolveLocaleText(
                          'Close',
                          props.closeAriaLabel,
                          props.locale?.modal?.closeAriaLabel,
                          props.locale?.common?.closeText
                        ),
                        ref: closeButtonRef
                      },
                      CloseIcon
                    )
                  : null
              ]
            )
          : null

      const body = slots.default ? h('div', { class: modalBodyClasses }, slots.default()) : null

      const footer = slots.footer
        ? h(
            'div',
            { class: modalFooterClasses, 'data-tiger-modal-footer': '' },
            slots.footer({ ok: handleOk, cancel: handleClose })
          )
        : props.showDefaultFooter
          ? h('div', { class: modalFooterClasses, 'data-tiger-modal-footer': '' }, [
              h(
                Button,
                { variant: 'secondary', onClick: handleClose },
                {
                  default: () =>
                    resolveLocaleText(
                      '取消',
                      props.cancelText,
                      props.locale?.modal?.cancelText,
                      props.locale?.common?.cancelText
                    )
                }
              ),
              h(
                Button,
                { onClick: handleOk },
                {
                  default: () =>
                    resolveLocaleText(
                      '确定',
                      props.okText,
                      props.locale?.modal?.okText,
                      props.locale?.common?.okText
                    )
                }
              )
            ])
          : null

      const renderedWrapper = h(
        'div',
        {
          class: modalWrapperClasses,
          style: { zIndex: props.zIndex },
          hidden: !props.open,
          'aria-hidden': !props.open ? 'true' : undefined,
          'data-tiger-modal-root': ''
        },
        [
          props.mask &&
            h('div', {
              class: modalMaskClasses,
              'aria-hidden': 'true',
              'data-tiger-modal-mask': ''
            }),
          h(
            'div',
            {
              class: containerClasses.value,
              onClick: handleMaskClick
            },
            [
              h(
                'div',
                {
                  ...(forwardedAttrs as Record<string, unknown>),
                  class: mergedClass,
                  style: finalStyle,
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-labelledby': ariaLabelledby,
                  tabindex: -1,
                  ref: dialogRef,
                  'data-tiger-modal': ''
                },
                [header, body, footer]
              )
            ]
          )
        ]
      )

      return h(Teleport, { to: 'body', disabled: props.disableTeleport }, [renderedWrapper])
    }
  }
})

export default Modal
