import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onBeforeUnmount,
  nextTick,
  type PropType
} from 'vue'
import {
  applyWheelZoom,

  clampLightboxIndex,
  classNames,
  coerceClassValue,
  basicLabel,
  createDefaultTransform,
  createLightboxGestureSession,
  downloadCurrentImageUrl,
  downloadIconPath,
  flipHorizontalIconPath,
  focusFirst,
  formatLightboxImageAlt,
  getImageTransformStyle,
  getImageViewerLabels,
  getLightboxNavState,
  imagePreviewCloseBtnClasses,
  imagePreviewCounterClasses,
  imagePreviewImgClasses,
  imagePreviewImgMotionClasses,
  imagePreviewMaskClasses,
  imagePreviewNavNextClasses,
  imagePreviewNavPrevClasses,
  imagePreviewToolbarBtnClasses,
  imagePreviewToolbarClasses,
  imagePreviewWrapperClasses,
  imageViewerIcons,
  isBrowser,
  LIGHTBOX_SCALE_STEP,
  lightboxShouldClose,
  mergeTigerLocale,
  nextIconPath,
  normalizeRotation,
  OVERLAY_Z_INDEX,
  previewCloseIconPath,
  prevIconPath,
  resetIconPath,
  resolveLightboxImages,
  resolveLightboxKeyAction,
  resolveLightboxNavIndex,
  resolveLightboxScaleRange,

  zoomInIconPath,
  zoomOutIconPath,
  type GestureTransform,
  type ImageLightboxItem,
  type ImagePreviewToolbarItemContext,
  type ImagePreviewProps as CoreImagePreviewProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import {
  renderVueBodyTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap
} from '../utils/overlay'

export interface VueImagePreviewProps extends CoreImagePreviewProps {
  images: ImageLightboxItem[]
}

const svgIcon = (d: string, cls = 'w-5 h-5') =>
  h(
    'svg',
    {
      class: cls,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      'aria-hidden': 'true'
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d
      })
    ]
  )

export const ImagePreview = defineComponent({
  name: 'TigerImagePreview',
  inheritAttrs: false,
  props: {
    open: { type: Boolean, default: undefined },
    images: { type: Array as PropType<ImageLightboxItem[]>, required: true },
    currentIndex: { type: Number, default: 0 },
    zIndex: { type: Number, default: undefined },
    maskClosable: { type: Boolean, default: true },
    scaleStep: { type: Number, default: LIGHTBOX_SCALE_STEP },
    minScale: { type: Number, default: undefined },
    maxScale: { type: Number, default: undefined },
    touchSwipeable: { type: Boolean, default: true },
    touchSwipeThreshold: { type: Number, default: 48 },
    zoomable: { type: Boolean, default: true },
    rotatable: { type: Boolean, default: true },
    showNav: { type: Boolean, default: true },
    showCounter: { type: Boolean, default: true },
    className: { type: String, default: undefined },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:open', 'update:currentIndex', 'scale-change'],
  setup(props, { emit, attrs, slots }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageViewerLabels(mergedLocale.value))
    const scaleRange = computed(() =>
      resolveLightboxScaleRange({ minScale: props.minScale, maxScale: props.maxScale })
    )
    const resolved = computed(() => resolveLightboxImages(props.images))
    const isOpen = computed(() => props.open ?? false)
    const shouldRender = computed(() => isOpen.value && resolved.value.length > 0)

    const transform = ref<GestureTransform>(createDefaultTransform())
    const index = ref(props.currentIndex)
    const dragging = ref(false)
    const rootRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    let gestureSession: ReturnType<typeof createLightboxGestureSession> | null = null
    let detachWheel: (() => void) | undefined

    const resetTransform = () => {
      transform.value = createDefaultTransform()
      dragging.value = false
    }

    watch(
      () => [isOpen.value, resolved.value.length] as const,
      ([open, length]) => {
        if (lightboxShouldClose(open, length)) {
          emit('update:open', false)
        }
      }
    )

    watch(
      () => [isOpen.value, props.currentIndex, resolved.value.length] as const,
      ([open, current, length]) => {
        if (!open) return
        index.value = clampLightboxIndex(current, length)
        resetTransform()
      },
      { immediate: true }
    )

    useVueBodyScrollLock(shouldRender)
    useVueFocusTrap({ enabled: shouldRender, containerRef: rootRef, inert: true, autoFocus: true })

    const handleClose = () => {
      emit('update:open', false)
    }

    useVueEscapeKey({
      enabled: shouldRender,
      onEscape: handleClose,
      layerRef: rootRef
    })

    const applyIndex = (next: number) => {
      index.value = next
      resetTransform()
      emit('update:currentIndex', next)
    }

    const handlePrev = () => {
      const next = resolveLightboxNavIndex(index.value, resolved.value.length, 'prev', true)
      if (next === null) return
      applyIndex(next)
    }

    const handleNext = () => {
      const next = resolveLightboxNavIndex(index.value, resolved.value.length, 'next', true)
      if (next === null) return
      applyIndex(next)
    }

    const setScale = (next: number) => {
      transform.value = { ...transform.value, scale: next }
      emit('scale-change', next)
    }

    const handleZoomIn = () => {
      setScale(Math.min(transform.value.scale + props.scaleStep, scaleRange.value.maxScale))
    }

    const handleZoomOut = () => {
      setScale(Math.max(transform.value.scale - props.scaleStep, scaleRange.value.minScale))
    }

    const handleReset = () => {
      resetTransform()
      emit('scale-change', 1)
    }

    const handleRotateLeft = () => {
      transform.value = {
        ...transform.value,
        rotation: normalizeRotation(transform.value.rotation - 90)
      }
    }

    const handleRotateRight = () => {
      transform.value = {
        ...transform.value,
        rotation: normalizeRotation(transform.value.rotation + 90)
      }
    }

    const handleFlip = () => {
      transform.value = { ...transform.value, flipX: !transform.value.flipX }
    }

    const handleDownload = () => {
      const current = resolved.value[clampLightboxIndex(index.value, resolved.value.length)]
      if (!current) return
      downloadCurrentImageUrl(current.src)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const action = resolveLightboxKeyAction(event.key, {
        canNavigate: props.showNav && resolved.value.length > 1,
        zoomable: props.zoomable,
        rotatable: props.rotatable,
        rtl: config.value.direction === 'rtl',
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey
      })
      if (!action) return
      event.preventDefault()
      switch (action) {
        case 'prev':
          handlePrev()
          break
        case 'next':
          handleNext()
          break
        case 'zoomIn':
          handleZoomIn()
          break
        case 'zoomOut':
          handleZoomOut()
          break
        case 'rotateLeft':
          handleRotateLeft()
          break
        case 'rotateRight':
          handleRotateRight()
          break
        case 'reset':
          handleReset()
          break
      }
    }

    const attachWheel = () => {
      detachWheel?.()
      const root = rootRef.value
      if (!root) return
      const handler = (event: WheelEvent) => {
        if (!props.zoomable) return
        const current = transform.value.scale
        const next = applyWheelZoom(current, event.deltaY, scaleRange.value)
        if (Math.abs(next - current) < 1e-6) return
        event.preventDefault()
        setScale(next)
      }
      root.addEventListener('wheel', handler, { passive: false })
      detachWheel = () => root.removeEventListener('wheel', handler)
    }

    const attachGesture = () => {
      gestureSession?.dispose()
      gestureSession = createLightboxGestureSession({
        getScale: () => transform.value.scale,
        getTranslate: () => ({
          x: transform.value.translateX,
          y: transform.value.translateY
        }),
        minScale: scaleRange.value.minScale,
        maxScale: scaleRange.value.maxScale,
        zoomable: props.zoomable,
        swipeable: props.touchSwipeable,
        swipeThreshold: props.touchSwipeThreshold,
        imageCount: resolved.value.length,
        rtl: config.value.direction === 'rtl',
        getPanLimits: () => {
          const img = rootRef.value?.querySelector('img')
          const root = rootRef.value
          if (!img || !root) return { maxX: 0, maxY: 0 }
          const scale = transform.value.scale
          return {
            maxX: Math.max(0, (img.offsetWidth * scale - root.clientWidth) / 2),
            maxY: Math.max(0, (img.offsetHeight * scale - root.clientHeight) / 2)
          }
        },
        onTransform: (next) => {
          transform.value = { ...transform.value, ...next }
          if (next.scale != null) emit('scale-change', next.scale)
        },
        onSwipe: (direction) => {
          if (direction === 'prev') handlePrev()
          else handleNext()
        },
        onDraggingChange: (next) => {
          dragging.value = next
        }
      })
    }

    watch(
      shouldRender,
      async (open) => {
        if (!isBrowser()) return
        if (!open) {
          detachWheel?.()
          detachWheel = undefined
          gestureSession?.dispose()
          gestureSession = null
          return
        }

        attachGesture()
        await nextTick()
        attachWheel()
      },
      { flush: 'post', immediate: true }
    )

    onBeforeUnmount(() => {
      detachWheel?.()
      gestureSession?.dispose()
    })

    return () => {
      if (!shouldRender.value) return null

      const items = resolved.value
      const displayIndex = clampLightboxIndex(index.value, items.length)
      const current = items[displayIndex]
      if (!current) return null

      const navState = getLightboxNavState(displayIndex, items.length, true)
      const currentAlt = formatLightboxImageAlt(
        current,
        displayIndex,
        items.length,
        labels.value.previewImageAriaLabel
      )
      const canZoomOut = transform.value.scale <= scaleRange.value.minScale + 1e-6
      const canZoomIn = transform.value.scale >= scaleRange.value.maxScale - 1e-6
      const showNavigation = props.showNav && items.length > 1
      const showCount = props.showCounter && items.length > 1

      const {
        class: attrClass,
        className: attrClassName,
        style: attrStyle,
        onClick: attrOnClick,
        onKeydown: attrOnKeydown,
        ...restAttrs
      } = attrs as Record<string, unknown> & {
        class?: unknown
        className?: unknown
        style?: Record<string, unknown>
        onClick?: (event: MouseEvent) => void
        onKeydown?: (event: KeyboardEvent) => void
      }

      const rootStyle: Record<string, unknown> = {
        ...(typeof attrStyle === 'object' && attrStyle ? attrStyle : {})
      }
      if (props.zIndex != null && props.zIndex !== OVERLAY_Z_INDEX.modal) {
        rootStyle.zIndex = props.zIndex
      }

      const children = [
        h('div', {
          class: imagePreviewMaskClasses,
          'aria-hidden': 'true',
          onClick: () => {
            if (props.maskClosable) handleClose()
          }
        }),
        h('img', {
          src: current.src,
          class: classNames(
            imagePreviewImgClasses,
            !dragging.value && imagePreviewImgMotionClasses
          ),
          style: { transform: getImageTransformStyle(transform.value) },
          alt: currentAlt,
          draggable: false,
          onPointerdown: (event: PointerEvent) => {
            gestureSession?.pointerDown(event)
          }
        }),
        h(
          'button',
          {
            ref: closeButtonRef,
            class: imagePreviewCloseBtnClasses,
            onClick: handleClose,
            'aria-label': labels.value.closePreviewAriaLabel,
            type: 'button'
          },
          [svgIcon(previewCloseIconPath)]
        )
      ]

      if (showNavigation) {
        children.push(
          h(
            'button',
            {
              class: imagePreviewNavPrevClasses,
              onClick: handlePrev,
              disabled: !navState.hasPrev,
              'aria-label': labels.value.previousImageAriaLabel,
              type: 'button'
            },
            [svgIcon(config.value.direction === 'rtl' ? nextIconPath : prevIconPath)]
          ),
          h(
            'button',
            {
              class: imagePreviewNavNextClasses,
              onClick: handleNext,
              disabled: !navState.hasNext,
              'aria-label': labels.value.nextImageAriaLabel,
              type: 'button'
            },
            [svgIcon(config.value.direction === 'rtl' ? prevIconPath : nextIconPath)]
          )
        )
      }

      const toolbarLabel = (key: 'flipHorizontal' | 'download' | 'resetScale') =>
        basicLabel(mergedLocale.value.locale, 'imagePreview', key)

      const toolbarButton = (
        item: ImagePreviewToolbarItemContext,
        icon: string,
        onClick: () => void
      ) => {
        const custom = slots.toolbarItem?.(item)
        if (custom && custom.length > 0) return custom
        return h(
          'button',
          {
            class: imagePreviewToolbarBtnClasses,
            onClick,
            disabled: item.disabled,
            'aria-label': item.label,
            type: 'button',
            'data-preview-action': item.action
          },
          [svgIcon(icon)]
        )
      }

      const toolbar: ReturnType<typeof h>[] = []
      if (props.zoomable) {
        toolbar.push(
          toolbarButton(
            { action: 'zoomOut', label: labels.value.zoomOutAriaLabel, disabled: canZoomOut },
            zoomOutIconPath,
            handleZoomOut
          ),
          toolbarButton(
            { action: 'reset', label: labels.value.resetAriaLabel, disabled: false },
            resetIconPath,
            handleReset
          ),
          toolbarButton(
            { action: 'zoomIn', label: labels.value.zoomInAriaLabel, disabled: canZoomIn },
            zoomInIconPath,
            handleZoomIn
          )
        )
      }
      if (props.rotatable) {
        toolbar.push(
          toolbarButton(
            { action: 'rotateLeft', label: labels.value.rotateLeftAriaLabel, disabled: false },
            imageViewerIcons.rotateLeft,
            handleRotateLeft
          ),
          toolbarButton(
            { action: 'rotateRight', label: labels.value.rotateRightAriaLabel, disabled: false },
            imageViewerIcons.rotateRight,
            handleRotateRight
          )
        )
      }
      toolbar.push(
        toolbarButton(
          { action: 'flip', label: toolbarLabel('flipHorizontal'), disabled: false },
          flipHorizontalIconPath,
          handleFlip
        ),
        toolbarButton(
          { action: 'download', label: toolbarLabel('download'), disabled: false },
          downloadIconPath,
          () => handleDownload()
        )
      )
      if (showCount && navState.counter) {
        toolbar.push(
          h('span', { class: imagePreviewCounterClasses, 'aria-live': 'polite' }, navState.counter)
        )
      }
      children.push(h('div', { class: imagePreviewToolbarClasses }, toolbar))

      return renderVueBodyTeleport(
        h(
          'div',
          {
            ...restAttrs,
            ref: rootRef,
            class: classNames(
              imagePreviewWrapperClasses,
              props.className,
              coerceClassValue(attrClass),
              coerceClassValue(attrClassName)
            ),
            style: rootStyle,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': labels.value.previewDialogAriaLabel,
            tabindex: -1,
            'data-tiger-overlay-host': '',
            'data-tiger-image-preview': '',
            onClick: attrOnClick,
            onKeydown: (event: KeyboardEvent) => {
              attrOnKeydown?.(event)
              if (!event.defaultPrevented) handleKeyDown(event)
            }
          },
          children
        )
      )
    }
  }
})

export default ImagePreview
