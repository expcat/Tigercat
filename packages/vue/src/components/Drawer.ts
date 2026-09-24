import {
  defineComponent,
  computed,
  ref,
  watch,
  PropType,
  h,
  onMounted,
  onBeforeUnmount,
  useId
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getDrawerLabels,
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
  resolveSwipeGesture,
  shouldRenderOverlay,
  isOverlayVisuallyHidden,
  whenOverlayTransitionEnds,
  isDrawerMobileFullscreen,
  canStartOverlaySwipeClose,
  OVERLAY_SWIPE_HANDLE_ATTR,
  resolveDrawerPlacement,
  getDrawerSwipeCloseDirection,
  shouldCloseOnMaskClick,
  type GesturePoint,
  type DrawerPlacement,
  type DrawerSize,
  type StyleValue,
  OVERLAY_Z_INDEX
} from '@expcat/tigercat-core'
import {
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth
} from '@expcat/tigercat-core/icons/common'
import { renderVueOverlayOutlet } from '../utils/overlay-outlet'
import {
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap,
  useVueOverlayPortalTarget
} from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

export interface VueDrawerProps {
  open?: boolean
  placement?: DrawerPlacement
  size?: DrawerSize
  width?: string | number
  title?: string
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  zIndex?: number
  className?: string
  bodyClassName?: string
  bodyPadding?: boolean
  destroyOnClose?: boolean
  fullscreenOnMobile?: boolean
  panelStyle?: StyleValue
  closeAriaLabel?: string
  initialFocus?: string
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleDrawer>
}

export type DrawerProps = VueDrawerProps

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
     * Whether Escape closes the drawer
     * @default true
     */
    keyboard: {
      type: Boolean,
      default: true
    },
    /**
     * z-index of the drawer
     * @default 1000
     */
    zIndex: {
      type: Number,
      default: OVERLAY_Z_INDEX.modal
    },
    /**
     * Additional CSS class for the drawer panel.
     */
    className: {
      type: String,
      default: undefined
    },
    initialFocus: {
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
     * `false` removes the default body padding.
     */
    bodyPadding: {
      type: Boolean,
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
     * Whether the drawer panel should become fullscreen on mobile viewports.
     * @default true
     */
    fullscreenOnMobile: {
      type: Boolean,
      default: true
    },

    /**
     * Custom inline style for drawer panel.
     */
    panelStyle: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined
    },

    /**
     * Close button aria-label. Defaults to locale.drawer.closeAriaLabel (en-US Close).
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
    }
  },
  emits: ['update:open', 'close', 'after-enter', 'after-close'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const drawerLabels = computed(() =>
      getDrawerLabels(mergedLocale.value, {
        ...props.labels,
        ...(props.closeAriaLabel ? { closeAriaLabel: props.closeAriaLabel } : {})
      })
    )

    const instanceId = ref(`tiger-drawer-${useId()}`)
    const hasOpened = ref(props.open)
    const leaving = ref(false)

    const { anchorRef, target: portalTarget } = useVueOverlayPortalTarget()
    const dialogRef = ref<HTMLElement | null>(null)
    const rootRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    const bodyRef = ref<HTMLElement | null>(null)
    let touchStartPoint: GesturePoint | null = null
    let touchCurrentPoint: GesturePoint | null = null
    let swipeAllowed = false
    const writingDirection = computed<'ltr' | 'rtl'>(() =>
      mergedLocale.value?.direction === 'rtl' ? 'rtl' : 'ltr'
    )
    const resolvedPlacement = computed(() =>
      resolveDrawerPlacement(props.placement, writingDirection.value)
    )

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
      if (!props.open) return
      swipeAllowed = canStartOverlaySwipeClose({
        target: event.target,
        scrollContainer: bodyRef.value,
        closeDirection: getDrawerSwipeCloseDirection({
          placement: resolvedPlacement.value,
          direction: writingDirection.value,
          fullscreen: isDrawerMobileFullscreen({
            fullscreenOnMobile: props.fullscreenOnMobile,
            viewportWidth: window.innerWidth
          })
        })
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

      if (
        allowed &&
        isDrawerSwipeCloseGesture(
          {
            placement: resolvedPlacement.value,
            direction: writingDirection.value,
            fullscreen: isDrawerMobileFullscreen({
              fullscreenOnMobile: props.fullscreenOnMobile,
              viewportWidth: window.innerWidth
            })
          },
          gesture
        )
      ) {
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
    const focusTarget = ref<HTMLElement | null>(null)
    watch(
      [() => props.open, () => props.initialFocus, dialogRef],
      () => {
        const root = dialogRef.value
        const found = props.initialFocus && root ? root.querySelector(props.initialFocus) : null
        focusTarget.value = found instanceof HTMLElement ? found : root
      },
      { flush: 'post', immediate: true }
    )
    useVueFocusTrap({
      enabled: overlayOpen,
      containerRef: rootRef,
      inert: true,
      autoFocus: true,
      initialFocusRef: focusTarget
    })

    onMounted(() => {
      cleanupEscape = useVueEscapeKey({
        enabled: escapeEnabled,
        onEscape: handleClose,
        layerRef: rootRef
      })
    })

    onBeforeUnmount(() => {
      cleanupEscape?.()
    })

    watch(
      () => props.open,
      (nextVisible, prevVisible, onCleanup) => {
        if (nextVisible) {
          hasOpened.value = true
          leaving.value = false
          onCleanup(
            whenOverlayTransitionEnds(dialogRef.value, () => emit('after-enter'))
          )
          return
        }
        if (prevVisible !== true) return
        leaving.value = true
        onCleanup(
          whenOverlayTransitionEnds(dialogRef.value, () => {
            leaving.value = false
            emit('after-close')
          })
        )
      },
      { immediate: true }
    )

    return () => {
      const anchor = h('span', { ref: anchorRef, hidden: true })
      if (!shouldRender.value) return anchor

      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      const ariaLabelledbyFromAttrs =
        typeof attrs['aria-labelledby'] === 'string'
          ? (attrs['aria-labelledby'] as string)
          : undefined

      const hasTitle = Boolean(props.title || slots.header)
      const ariaLabelledby = ariaLabelledbyFromAttrs ?? (hasTitle ? titleId.value : undefined)
      const ariaLabelFromAttrs =
        typeof attrs['aria-label'] === 'string' ? (attrs['aria-label'] as string) : undefined
      const ariaLabel =
        ariaLabelFromAttrs ?? (hasTitle ? undefined : drawerLabels.value.dialogAriaLabel)
      const bodyId = `${instanceId.value}-body`
      const overlayHostId = `${instanceId.value}-overlay-host`

      const containerClasses = getDrawerContainerClasses()

      const maskClasses = getDrawerMaskClasses(props.open)

      const panelClasses = classNames(
        getDrawerPanelClasses(
          resolvedPlacement.value,
          props.open,
          props.size,
          props.fullscreenOnMobile
        ),
        'flex flex-col',
        props.className,

        coerceClassValue(attrs.class)
      )

      const isHorizontal = resolvedPlacement.value === 'left' || resolvedPlacement.value === 'right'
      const widthStyle = props.width
        ? {
            [isHorizontal ? 'width' : 'height']:
              typeof props.width === 'number' ? `${props.width}px` : props.width
          }
        : undefined
      const mergedStyle = mergeStyleValues(attrs.style, props.panelStyle, widthStyle)

      const headerClasses = getDrawerHeaderClasses()
      const bodyClasses = getDrawerBodyClasses(props.bodyClassName, props.bodyPadding)
      const footerClasses = getDrawerFooterClasses()
      const closeButtonClasses = getDrawerCloseButtonClasses()
      const titleClasses = getDrawerTitleClasses()

      const resolvedCloseAriaLabel = drawerLabels.value.closeAriaLabel

      const closeIcon = h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: closeIconViewBox,
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-hidden': 'true',
          focusable: 'false'
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
          ? h('div', { class: headerClasses, [OVERLAY_SWIPE_HANDLE_ATTR]: '' }, [
              slots.header
                ? h('div', { id: titleId.value, class: titleClasses }, slots.header())
                : props.title
                  ? h('h3', { id: titleId.value, class: titleClasses }, props.title)
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

      const body = slots.default
        ? h(
            'div',
            { class: bodyClasses, ref: bodyRef, id: bodyId, 'data-tiger-drawer-body': '' },
            slots.default()
          )
        : null

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
          'aria-label': ariaLabel,
          'aria-describedby': slots.default ? bodyId : undefined,
          'aria-owns': overlayHostId,
          tabindex: -1,
          ref: dialogRef,
          onTouchstart: handleTouchStart,
          onTouchmove: handleTouchMove,
          onTouchend: handleTouchEnd,
          onTouchcancel: handleTouchCancel,
          'data-tiger-drawer': ''
        },
        [header, body, footer]
      )

      const root = h(
        'div',
        {
          class: containerClasses,
          ref: rootRef,
          style: { zIndex: props.zIndex },
          hidden: isOverlayVisuallyHidden(props.open, leaving.value),
          'aria-hidden': !props.open ? 'true' : undefined,
          'data-tiger-overlay-layer': '',
          'data-tiger-drawer-root': ''
        },
        [
          mask,
          panel,
          h('div', {
            id: overlayHostId,
            class: 'contents',
            'data-tiger-overlay-host': ''
          })
        ]
      )

      return [anchor, renderVueOverlayOutlet(instanceId.value, root, portalTarget.value)]
    }
  }
})

export default Drawer
