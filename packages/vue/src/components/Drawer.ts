import {
  defineComponent,
  computed,
  ref,
  watch,
  PropType,
  h,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'
import {
  ANIMATION_DURATION_MS,
  captureActiveElement,
  classNames,
  coerceClassValue,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  focusFirst,
  resolveLocaleText,
  mergeTigerLocale,
  mergeStyleValues,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  type TigerLocale,
  type TigerLocaleDrawer,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  getGestureTouchPoint,
  isDrawerSwipeCloseGesture,
  restoreFocus,
  resolveSwipeGesture,
  shouldCloseOnMaskClick,
  type GesturePoint,
  type DrawerPlacement,
  type DrawerSize,
  type StyleValue
} from '@expcat/tigercat-core'
import {
  renderVueBodyTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap
} from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

let drawerIdCounter = 0
const createDrawerId = () => `tiger-drawer-${++drawerIdCounter}`

export interface VueDrawerProps {
  open?: boolean
  placement?: DrawerPlacement
  size?: DrawerSize
  width?: string | number
  title?: string
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  zIndex?: number
  className?: string
  bodyClassName?: string
  bodyPadding?: boolean | string
  destroyOnClose?: boolean
  destroyOnCloseAfterLeave?: boolean
  fullscreenOnMobile?: boolean
  panelClassName?: string
  panelStyle?: StyleValue
  style?: Record<string, unknown>
  closeAriaLabel?: string
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleDrawer>
}

export const Drawer = defineComponent({
  name: 'TigerDrawer',
  inheritAttrs: false,
  props: {
    /**
     * Whether the drawer is open
     * @default false
     */
    open: {
      type: Boolean,
      default: false
    },
    /**
     * Drawer placement
     * @default 'right'
     */
    placement: {
      type: String as PropType<DrawerPlacement>,
      default: 'right' as DrawerPlacement
    },
    /**
     * Drawer size
     * @default 'md'
     */
    size: {
      type: String as PropType<DrawerSize>,
      default: 'md' as DrawerSize
    },
    /**
     * Custom width/height (overrides size)
     */
    width: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /**
     * Drawer title
     */
    title: {
      type: String,
      default: undefined
    },
    /**
     * Whether to show close button
     * @default true
     */
    closable: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to show mask/backdrop
     * @default true
     */
    mask: {
      type: Boolean,
      default: true
    },
    /**
     * Whether clicking mask closes the drawer
     * @default true
     */
    maskClosable: {
      type: Boolean,
      default: true
    },
    /**
     * z-index of the drawer
     * @default 1000
     */
    zIndex: {
      type: Number,
      default: 1000
    },
    /**
     * Additional CSS class for the drawer container
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Additional CSS class for the drawer body
     */
    bodyClassName: {
      type: String,
      default: undefined
    },
    /**
     * Padding override for the drawer body. `false` removes the built-in
     * padding; a string supplies a custom padding utility class.
     */
    bodyPadding: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: undefined
    },
    /**
     * Whether to destroy content on close
     * @default false
     */
    destroyOnClose: {
      type: Boolean,
      default: false
    },

    /**
     * When destroyOnClose is true, wait for leave animation before unmounting.
     * @default false
     */
    destroyOnCloseAfterLeave: {
      type: Boolean,
      default: false
    },

    /**
     * Whether the drawer panel should become fullscreen on mobile viewports.
     * @default true
     */
    fullscreenOnMobile: {
      type: Boolean,
      default: true
    },

    /**
     * Additional CSS class for drawer panel.
     */
    panelClassName: {
      type: String,
      default: undefined
    },

    /**
     * Custom inline style for drawer panel
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },

    /**
     * Custom inline style for drawer panel.
     */
    panelStyle: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined
    },

    /**
     * Close button aria-label
     * @default 'Close drawer'
     */
    closeAriaLabel: {
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
      type: Object as PropType<Partial<TigerLocaleDrawer>>,
      default: undefined
    },

    /**
     * Disable teleport (useful for testing)
     * @default false
     * @internal
     */
    disableTeleport: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'close', 'after-enter', 'after-leave'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))

    const instanceId = ref<string>(createDrawerId())
    const hasBeenOpened = ref(false)
    const deferredRendered = ref(props.open)

    const dialogRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    const previousActiveElement = ref<HTMLElement | null>(null)
    let touchStartPoint: GesturePoint | null = null
    let touchCurrentPoint: GesturePoint | null = null

    const titleId = computed(() => `${instanceId.value}-title`)

    const shouldRender = computed(() => {
      if (props.open) {
        hasBeenOpened.value = true
        return true
      }

      if (props.destroyOnClose) {
        return props.destroyOnCloseAfterLeave ? deferredRendered.value : false
      }
      return hasBeenOpened.value
    })

    const handleClose = () => {
      emit('update:open', false)
      emit('close')
    }

    const handleMaskClick = (event: MouseEvent) => {
      if (shouldCloseOnMaskClick(event, props.maskClosable)) {
        handleClose()
      }
    }

    const resetTouchGesture = () => {
      touchStartPoint = null
      touchCurrentPoint = null
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (!props.open) return
      const point = getGestureTouchPoint(event.touches)
      touchStartPoint = point
      touchCurrentPoint = point
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartPoint) return

      const point = getGestureTouchPoint(event.touches)
      if (point) {
        touchCurrentPoint = point
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      const gesture = resolveSwipeGesture(
        touchStartPoint,
        getGestureTouchPoint(event.changedTouches) ?? touchCurrentPoint,
        { minDistance: 48, minVelocity: 0.15 }
      )

      resetTouchGesture()

      if (isDrawerSwipeCloseGesture(props.placement, gesture)) {
        handleClose()
      }
    }

    const escapeEnabled = computed(() => props.open)
    let cleanupEscape: (() => void) | undefined

    useVueBodyScrollLock(escapeEnabled)
    useVueFocusTrap({ enabled: escapeEnabled, containerRef: dialogRef })

    onMounted(() => {
      cleanupEscape = useVueEscapeKey({
        enabled: escapeEnabled,
        onEscape: handleClose
      })
    })

    onBeforeUnmount(() => {
      cleanupEscape?.()
    })

    watch(
      () => props.open,
      async (nextVisible) => {
        if (nextVisible) {
          deferredRendered.value = true
          previousActiveElement.value = captureActiveElement()

          await nextTick()
          focusFirst([closeButtonRef.value, dialogRef.value])
          return
        }

        if (props.destroyOnClose && !props.destroyOnCloseAfterLeave) {
          deferredRendered.value = false
        }
        restoreFocus(previousActiveElement.value)
      }
    )

    watch(
      () => props.open,
      (nextVisible, prevVisible, onCleanup) => {
        // Skip initial mount when closed, or no actual change
        if (nextVisible === prevVisible || (typeof prevVisible === 'undefined' && !nextVisible))
          return

        const timer = window.setTimeout(() => {
          emit(nextVisible ? 'after-enter' : 'after-leave')
          if (!nextVisible && props.destroyOnClose && props.destroyOnCloseAfterLeave) {
            deferredRendered.value = false
          }
        }, ANIMATION_DURATION_MS)

        onCleanup(() => window.clearTimeout(timer))
      },
      { immediate: true }
    )

    return () => {
      if (!shouldRender.value) return null

      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      const ariaLabelledbyFromAttrs =
        typeof attrs['aria-labelledby'] === 'string'
          ? (attrs['aria-labelledby'] as string)
          : undefined

      const ariaLabelledby =
        ariaLabelledbyFromAttrs ?? (props.title || slots.header ? titleId.value : undefined)

      const containerClasses = classNames(
        getDrawerContainerClasses(),
        !props.open && 'pointer-events-none'
      )

      const maskClasses = getDrawerMaskClasses(props.open)

      const panelClasses = classNames(
        getDrawerPanelClasses(props.placement, props.open, props.size, props.fullscreenOnMobile),
        'flex flex-col',
        props.className,
        props.panelClassName,
        coerceClassValue(attrs.class)
      )

      const isHorizontal = props.placement === 'left' || props.placement === 'right'
      const widthStyle = props.width
        ? {
            [isHorizontal ? 'width' : 'height']:
              typeof props.width === 'number' ? `${props.width}px` : props.width
          }
        : undefined
      const mergedStyle = mergeStyleValues(attrs.style, props.panelStyle, props.style, widthStyle)

      const headerClasses = getDrawerHeaderClasses()
      const bodyClasses = getDrawerBodyClasses(props.bodyClassName, props.bodyPadding)
      const footerClasses = getDrawerFooterClasses()
      const closeButtonClasses = getDrawerCloseButtonClasses()
      const titleClasses = getDrawerTitleClasses()

      const resolvedCloseAriaLabel = resolveLocaleText(
        'Close drawer',
        props.closeAriaLabel,
        props.labels?.closeAriaLabel,
        mergedLocale.value?.drawer?.closeAriaLabel,
        mergedLocale.value?.common?.closeText
      )

      const closeIcon = h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: closeIconViewBox,
          xmlns: 'http://www.w3.org/2000/svg'
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

      const header =
        props.title || slots.header || props.closable
          ? h('div', { class: headerClasses }, [
              props.title || slots.header
                ? h(
                    'h3',
                    {
                      id: titleId.value,
                      class: titleClasses
                    },
                    slots.header ? slots.header() : props.title
                  )
                : null,
              props.closable
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: closeButtonClasses,
                      onClick: handleClose,
                      'aria-label': resolvedCloseAriaLabel,
                      ref: closeButtonRef
                    },
                    closeIcon
                  )
                : null
            ])
          : null

      const body = slots.default ? h('div', { class: bodyClasses }, slots.default()) : null

      const footer = slots.footer ? h('div', { class: footerClasses }, slots.footer()) : null

      const mask = props.mask
        ? h('div', {
            class: maskClasses,
            onClick: handleMaskClick,
            'aria-hidden': 'true',
            'data-tiger-drawer-mask': ''
          })
        : null

      const panel = h(
        'div',
        {
          ...(forwardedAttrs as Record<string, unknown>),
          class: panelClasses,
          style: mergedStyle,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': ariaLabelledby,
          tabindex: -1,
          ref: dialogRef,
          onTouchstart: handleTouchStart,
          onTouchmove: handleTouchMove,
          onTouchend: handleTouchEnd,
          onTouchcancel: resetTouchGesture,
          'data-tiger-drawer': ''
        },
        [header, body, footer]
      )

      const root = h(
        'div',
        {
          class: containerClasses,
          style: { zIndex: props.zIndex },
          hidden: !props.open && !(props.destroyOnClose && props.destroyOnCloseAfterLeave),
          'aria-hidden': !props.open ? 'true' : undefined,
          'data-tiger-drawer-root': ''
        },
        [mask, panel]
      )

      return renderVueBodyTeleport([root], props.disableTeleport)
    }
  }
})

export default Drawer
