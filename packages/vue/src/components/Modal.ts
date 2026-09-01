import {
  defineComponent,
  h,
  ref,
  PropType,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  useId
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
  getGestureTouchPoint,
  isModalSheetSwipeCloseGesture,
  modalWrapperClasses,
  modalMaskClasses,
  getModalContainerClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalFooterClasses,
  resolveLocaleText,
  mergeTigerLocale,
  shouldCloseOnMaskClick,
  resolveSwipeGesture,
  shouldRenderOverlay,
  isOverlayVisuallyHidden,
  scheduleOverlayLeave,
  canStartOverlaySwipeClose,
  isOverlayDragHandleEvent,
  clampOverlayDragOffset,
  OVERLAY_SWIPE_HANDLE_ATTR,
  createDocumentDragSession,
  type DocumentDragSession,
  type GesturePoint,
  type TigerLocale,
  type TigerLocaleModal,
  type ModalSize,
  OVERLAY_Z_INDEX
} from '@expcat/tigercat-core'

import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import {
  renderVueBodyTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap
} from '../utils/overlay'

export interface VueModalProps {
  open?: boolean
  size?: ModalSize
  width?: string | number
  title?: string
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  mobileSheet?: boolean
  destroyOnClose?: boolean
  zIndex?: number
  className?: string
  style?: Record<string, unknown>
  closeAriaLabel?: string
  okText?: string
  cancelText?: string
  showDefaultFooter?: boolean
  draggable?: boolean
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleModal>
}

export type ModalProps = VueModalProps

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
     * Whether Escape closes the modal
     * @default true
     */
    keyboard: {
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
     * Whether to render as a mobile bottom sheet below the md breakpoint
     * @default false
     */
    mobileSheet: {
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
      default: OVERLAY_Z_INDEX.modal
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
     * Flat custom-text overrides for single-language use (no i18n needed).
     */
    labels: {
      type: Object as PropType<Partial<TigerLocaleModal>>,
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
     * Whether the modal is draggable by its header
     * @default false
     */
    draggable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'close', 'cancel', 'ok', 'after-close'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))

    const instanceId = ref(`tiger-modal-${useId()}`)
    const hasOpened = ref(props.open)
    const leaving = ref(false)

    const dialogRef = ref<HTMLElement | null>(null)
    const rootRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    const bodyRef = ref<HTMLElement | null>(null)
    let touchStartPoint: GesturePoint | null = null
    let touchCurrentPoint: GesturePoint | null = null
    let swipeAllowed = false

    const dragOffset = ref({ x: 0, y: 0 })
    const dragging = ref(false)
    let dragSession: DocumentDragSession | null = null

    const cleanupDragSession = () => {
      dragSession?.dispose()
      dragSession = null
    }

    const handleDragPointerDown = (e: PointerEvent) => {
      if (!props.draggable || e.button !== 0 || !isOverlayDragHandleEvent(e)) return
      e.preventDefault()
      const originX = dragOffset.value.x
      const originY = dragOffset.value.y
      const startRect = (
        dialogRef.value ?? (e.currentTarget as HTMLElement)
      ).getBoundingClientRect()
      const view = (e.currentTarget as HTMLElement | null)?.ownerDocument.defaultView
      const viewport = {
        width: view?.innerWidth ?? startRect.width,
        height: view?.innerHeight ?? startRect.height
      }
      cleanupDragSession()
      dragging.value = true
      dragSession = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: (e.currentTarget as HTMLElement | null)?.ownerDocument,
        pointerId: e.pointerId,
        pointerTarget: e.currentTarget instanceof Element ? e.currentTarget : null,
        onMove: ({ deltaX, deltaY }) => {
          dragOffset.value = clampOverlayDragOffset(
            { x: originX, y: originY },
            { x: deltaX, y: deltaY },
            startRect,
            viewport
          )
        },
        onEnd: () => {
          dragSession = null
          dragging.value = false
        }
      })
    }

    const titleId = computed(() => `${instanceId.value}-title`)

    const shouldRender = computed(() =>
      shouldRenderOverlay({
        open: props.open,
        hasOpened: hasOpened.value,
        leaving: leaving.value,
        destroyOnClose: props.destroyOnClose
      })
    )

    const handleClose = () => {
      emit('update:open', false)
      emit('cancel')
      emit('close')
    }

    const handleOk = () => {
      emit('ok')
      emit('update:open', false)
      emit('close')
    }

    const handleMaskClick = (event: MouseEvent) => {
      if (shouldCloseOnMaskClick(event, props.maskClosable)) {
        handleClose()
      }
    }

    const callAttrHandler = (name: string, event: TouchEvent) => {
      const handler = attrs[name]
      if (typeof handler === 'function') handler(event)
    }

    const resetTouchGesture = () => {
      touchStartPoint = null
      touchCurrentPoint = null
      swipeAllowed = false
    }

    const handleTouchStart = (event: TouchEvent) => {
      callAttrHandler('onTouchstart', event)
      if (!props.open || !props.mobileSheet) return
      swipeAllowed = canStartOverlaySwipeClose({
        target: event.target,
        scrollContainer: bodyRef.value,
        closeDirection: 'down'
      })
      const point = getGestureTouchPoint(event.touches)
      touchStartPoint = point
      touchCurrentPoint = point
    }

    const handleTouchMove = (event: TouchEvent) => {
      callAttrHandler('onTouchmove', event)
      if (!touchStartPoint) return

      const point = getGestureTouchPoint(event.touches)
      if (point) {
        touchCurrentPoint = point
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      callAttrHandler('onTouchend', event)
      const gesture = resolveSwipeGesture(
        touchStartPoint,
        getGestureTouchPoint(event.changedTouches) ?? touchCurrentPoint,
        { minDistance: 48, minVelocity: 0.15 }
      )

      const allowed = swipeAllowed
      resetTouchGesture()

      if (allowed && props.mobileSheet && isModalSheetSwipeCloseGesture(gesture)) {
        handleClose()
      }
    }

    const handleTouchCancel = (event: TouchEvent) => {
      callAttrHandler('onTouchcancel', event)
      resetTouchGesture()
    }

    const overlayOpen = computed(() => props.open)
    const escapeEnabled = computed(() => props.open && props.keyboard)
    let cleanupEscape: (() => void) | undefined

    useVueBodyScrollLock(overlayOpen)
    useVueFocusTrap({ enabled: overlayOpen, containerRef: rootRef, inert: true, autoFocus: true })

    onMounted(() => {
      cleanupEscape = useVueEscapeKey({
        enabled: escapeEnabled,
        onEscape: handleClose,
        layerRef: rootRef
      })
    })

    onBeforeUnmount(() => {
      cleanupEscape?.()
      cleanupDragSession()
    })

    watch(
      () => props.open,
      (nextVisible, previousVisible, onCleanup) => {
        if (nextVisible) {
          hasOpened.value = true
          leaving.value = false
          return
        }
        cleanupDragSession()
        dragOffset.value = { x: 0, y: 0 }
        if (!previousVisible) return
        leaving.value = true
        onCleanup(
          scheduleOverlayLeave({
            onFinish: () => {
              leaving.value = false
              emit('after-close')
            }
          })
        )
      }
    )

    const contentClasses = computed(() => {
      return getModalContentClasses(props.size, props.className, props.mobileSheet)
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
      const overlayHostId = `${instanceId.value}-overlay-host`

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
                [OVERLAY_SWIPE_HANDLE_ATTR]: '',
                onPointerdown: props.draggable ? handleDragPointerDown : undefined,
                style: props.draggable
                  ? `cursor: ${dragging.value ? 'grabbing' : 'grab'}; user-select: none; touch-action: none`
                  : undefined
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
                          props.labels?.closeAriaLabel,
                          mergedLocale.value?.modal?.closeAriaLabel,
                          mergedLocale.value?.common?.closeText
                        ),
                        ref: closeButtonRef
                      },
                      CloseIcon
                    )
                  : null
              ]
            )
          : null

      const body = slots.default
        ? h(
            'div',
            { class: modalBodyClasses, ref: bodyRef, 'data-tiger-modal-body': '' },
            slots.default()
          )
        : null

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
                      props.labels?.cancelText,
                      mergedLocale.value?.modal?.cancelText,
                      mergedLocale.value?.common?.cancelText
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
                      props.labels?.okText,
                      mergedLocale.value?.modal?.okText,
                      mergedLocale.value?.common?.okText
                    )
                }
              )
            ])
          : null

      const renderedWrapper = h(
        'div',
        {
          class: modalWrapperClasses,
          ref: rootRef,
          style: { zIndex: props.zIndex },
          hidden: isOverlayVisuallyHidden(props.open, leaving.value),
          'aria-hidden': !props.open ? 'true' : undefined,
          'data-tiger-overlay-layer': '',
          'data-tiger-modal-root': ''
        },
        [
          props.mask &&
            h('div', {
              class: classNames(modalMaskClasses, props.open ? 'opacity-100' : 'opacity-0'),
              'aria-hidden': 'true',
              'data-tiger-modal-mask': '',
              onClick: handleMaskClick
            }),
          h(
            'div',
            {
              class: containerClasses.value
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
                  'aria-owns': overlayHostId,
                  tabindex: -1,
                  ref: dialogRef,
                  onTouchstart: handleTouchStart,
                  onTouchmove: handleTouchMove,
                  onTouchend: handleTouchEnd,
                  onTouchcancel: handleTouchCancel,
                  'data-tiger-modal': ''
                },
                [header, body, footer]
              )
            ]
          ),
          h('div', {
            id: overlayHostId,
            class: 'contents',
            'data-tiger-overlay-host': ''
          })
        ]
      )

      return renderVueBodyTeleport([renderedWrapper])
    }
  }
})

export default Modal
