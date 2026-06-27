import {
  defineComponent,
  h,
  Teleport,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  PropType
} from 'vue'
import {
  classNames,
  imagePreviewMaskClasses,
  imagePreviewWrapperClasses,
  imagePreviewImgClasses,
  imagePreviewToolbarClasses,
  imagePreviewToolbarBtnClasses,
  imagePreviewNavBtnClasses,
  imagePreviewCloseBtnClasses,
  imagePreviewCounterClasses,
  zoomInIconPath,
  zoomOutIconPath,
  resetIconPath,
  prevIconPath,
  nextIconPath,
  previewCloseIconPath,
  imageViewerIcons,
  clampScale,
  calculateTransform,
  getPreviewNavState,
  normalizeRotation,
  createPanState,
  startPan,
  movePan,
  createPinchState,
  startPinch,
  movePinch,
  getImageViewerLabels,
  mergeTigerLocale,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueImagePreviewProps {
  open?: boolean
  images?: string[]
  currentIndex?: number
  zIndex?: number
  maskClosable?: boolean
  scaleStep?: number
  minScale?: number
  maxScale?: number
  locale?: Partial<TigerLocale>
}

const svgIcon = (d: string, cls = 'w-5 h-5') =>
  h(
    'svg',
    {
      class: cls,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor'
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
    images: { type: Array as PropType<string[]>, default: () => [] },
    currentIndex: { type: Number, default: 0 },
    zIndex: { type: Number, default: 1050 },
    maskClosable: { type: Boolean, default: true },
    scaleStep: { type: Number, default: 0.5 },
    minScale: { type: Number, default: 0.25 },
    maxScale: { type: Number, default: 5 },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:open', 'update:currentIndex', 'scale-change'],
  setup(props, { emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageViewerLabels(mergedLocale.value))
    const scale = ref(1)
    const rotation = ref(0)
    const offsetX = ref(0)
    const offsetY = ref(0)
    const index = ref(props.currentIndex)
    const dragging = ref(false)
    const dragStart = ref({ x: 0, y: 0, ox: 0, oy: 0 })
    let panState = createPanState()
    let pinchState = createPinchState()

    const resetTransform = () => {
      scale.value = 1
      rotation.value = 0
      offsetX.value = 0
      offsetY.value = 0
      panState = createPanState()
      pinchState = createPinchState()
    }

    watch(
      () => props.currentIndex,
      (val) => {
        index.value = val
        resetTransform()
      }
    )

    const isOpen = computed(() => props.open ?? false)

    watch(
      () => isOpen.value,
      (val) => {
        if (val) {
          resetTransform()
          index.value = props.currentIndex
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = ''
        }
      }
    )

    const navState = computed(() => getPreviewNavState(index.value, props.images.length))

    const handleClose = () => {
      emit('update:open', false)
    }

    const handleZoomIn = () => {
      scale.value = clampScale(scale.value + props.scaleStep, props.minScale, props.maxScale)
      emit('scale-change', scale.value)
    }

    const handleZoomOut = () => {
      scale.value = clampScale(scale.value - props.scaleStep, props.minScale, props.maxScale)
      emit('scale-change', scale.value)
    }

    const handleReset = () => {
      resetTransform()
      emit('scale-change', 1)
    }

    const handleRotateLeft = () => {
      rotation.value = normalizeRotation(rotation.value - 90)
    }

    const handleRotateRight = () => {
      rotation.value = normalizeRotation(rotation.value + 90)
    }

    const handlePrev = () => {
      if (navState.value.hasPrev) {
        index.value--
        resetTransform()
        emit('update:currentIndex', index.value)
      }
    }

    const handleNext = () => {
      if (navState.value.hasNext) {
        index.value++
        resetTransform()
        emit('update:currentIndex', index.value)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -props.scaleStep : props.scaleStep
      scale.value = clampScale(scale.value + delta, props.minScale, props.maxScale)
      emit('scale-change', scale.value)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      dragging.value = true
      dragStart.value = {
        x: e.clientX,
        y: e.clientY,
        ox: offsetX.value,
        oy: offsetY.value
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.value) return
      offsetX.value = dragStart.value.ox + (e.clientX - dragStart.value.x)
      offsetY.value = dragStart.value.oy + (e.clientY - dragStart.value.y)
    }

    const handleMouseUp = () => {
      dragging.value = false
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        pinchState = startPinch(e.touches[0], e.touches[1], scale.value)
        return
      }

      if (e.touches.length === 1) {
        panState = startPan(
          e.touches[0].clientX,
          e.touches[0].clientY,
          offsetX.value,
          offsetY.value
        )
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchState.isPinching) {
        e.preventDefault()
        scale.value = movePinch(
          pinchState,
          e.touches[0],
          e.touches[1],
          props.minScale,
          props.maxScale
        )
        emit('scale-change', scale.value)
        return
      }

      if (e.touches.length === 1 && panState.isPanning) {
        const next = movePan(panState, e.touches[0].clientX, e.touches[0].clientY)
        offsetX.value = next.translateX
        offsetY.value = next.translateY
      }
    }

    const handleTouchEnd = () => {
      panState = createPanState()
      pinchState = createPinchState()
    }

    const handleMaskClick = (e: MouseEvent) => {
      if (props.maskClosable && e.target === e.currentTarget) {
        handleClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen.value) return
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    })

    const transform = computed(
      () =>
        `${calculateTransform(scale.value, offsetX.value, offsetY.value)} rotate(${rotation.value}deg)`
    )

    return () => {
      if (!isOpen.value || !props.images.length) return null

      const currentSrc = props.images[index.value] || props.images[0]

      const mask = h('div', {
        class: imagePreviewMaskClasses,
        'aria-hidden': 'true'
      })

      const img = h('img', {
        src: currentSrc,
        class: imagePreviewImgClasses,
        style: { transform: transform.value },
        alt: `Preview image ${index.value + 1}`,
        draggable: false,
        onMousedown: handleMouseDown,
        onMousemove: handleMouseMove,
        onMouseup: handleMouseUp,
        onMouseleave: handleMouseUp,
        onTouchstart: handleTouchStart,
        onTouchmove: handleTouchMove,
        onTouchend: handleTouchEnd,
        onTouchcancel: handleTouchEnd
      })

      const closeBtn = h(
        'button',
        {
          class: imagePreviewCloseBtnClasses,
          onClick: handleClose,
          'aria-label': labels.value.closePreviewAriaLabel,
          type: 'button'
        },
        [svgIcon(previewCloseIconPath)]
      )

      const toolbar = h('div', { class: imagePreviewToolbarClasses }, [
        h(
          'button',
          {
            class: imagePreviewToolbarBtnClasses,
            onClick: handleZoomOut,
            'aria-label': labels.value.zoomOutAriaLabel,
            type: 'button'
          },
          [svgIcon(zoomOutIconPath)]
        ),
        h(
          'button',
          {
            class: imagePreviewToolbarBtnClasses,
            onClick: handleReset,
            'aria-label': labels.value.resetAriaLabel,
            type: 'button'
          },
          [svgIcon(resetIconPath)]
        ),
        h(
          'button',
          {
            class: imagePreviewToolbarBtnClasses,
            onClick: handleZoomIn,
            'aria-label': labels.value.zoomInAriaLabel,
            type: 'button'
          },
          [svgIcon(zoomInIconPath)]
        ),
        h(
          'button',
          {
            class: imagePreviewToolbarBtnClasses,
            onClick: handleRotateLeft,
            'aria-label': labels.value.rotateLeftAriaLabel,
            type: 'button'
          },
          [svgIcon(imageViewerIcons.rotateLeft)]
        ),
        h(
          'button',
          {
            class: imagePreviewToolbarBtnClasses,
            onClick: handleRotateRight,
            'aria-label': labels.value.rotateRightAriaLabel,
            type: 'button'
          },
          [svgIcon(imageViewerIcons.rotateRight)]
        ),
        navState.value.counter
          ? h('span', { class: imagePreviewCounterClasses }, navState.value.counter)
          : null
      ])

      const prevBtn =
        props.images.length > 1
          ? h(
              'button',
              {
                class: classNames(imagePreviewNavBtnClasses, 'left-4'),
                onClick: handlePrev,
                disabled: !navState.value.hasPrev,
                'aria-label': labels.value.previousImageAriaLabel,
                type: 'button'
              },
              [svgIcon(prevIconPath)]
            )
          : null

      const nextBtn =
        props.images.length > 1
          ? h(
              'button',
              {
                class: classNames(imagePreviewNavBtnClasses, 'right-4'),
                onClick: handleNext,
                disabled: !navState.value.hasNext,
                'aria-label': labels.value.nextImageAriaLabel,
                type: 'button'
              },
              [svgIcon(nextIconPath)]
            )
          : null

      const wrapper = h(
        'div',
        {
          class: imagePreviewWrapperClasses,
          style: { zIndex: props.zIndex },
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': labels.value.previewDialogAriaLabel,
          onClick: handleMaskClick,
          onWheel: handleWheel
        },
        [mask, img, closeBtn, prevBtn, nextBtn, toolbar]
      )

      return h(Teleport, { to: 'body' }, [wrapper])
    }
  }
})

export default ImagePreview
