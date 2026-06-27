import { defineComponent, h, ref, computed, PropType, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  classNames,
  coerceClassValue,
  imageViewerBackdropClasses,
  imageViewerImgClasses,
  imageViewerToolbarClasses,
  imageViewerToolbarBtnClasses,
  imageViewerNavBtnClasses,
  imageViewerCloseBtnClasses,
  imageViewerCounterClasses,
  imageViewerIcons,
  clampZoom,
  normalizeRotation,
  createDefaultTransform,
  getImageTransformStyle,
  applyWheelZoom,
  createPanState,
  startPan,
  movePan,
  createPinchState,
  startPinch,
  movePinch,
  getImageViewerLabels,
  mergeTigerLocale,
  type GestureTransform,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueImageViewerProps {
  images: string[]
  open?: boolean
  currentIndex?: number
  zoomable?: boolean
  rotatable?: boolean
  showNav?: boolean
  showCounter?: boolean
  maskClosable?: boolean
  minZoom?: number
  maxZoom?: number
  className?: string
  locale?: Partial<TigerLocale>
}

function createSvgIcon(pathD: string, label: string) {
  return h(
    'svg',
    {
      class: 'w-5 h-5',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-label': label
    },
    [h('path', { d: pathD })]
  )
}

export const ImageViewer = defineComponent({
  name: 'TigerImageViewer',
  inheritAttrs: false,
  props: {
    images: {
      type: Array as PropType<string[]>,
      required: true
    },
    open: {
      type: Boolean,
      default: false
    },
    currentIndex: {
      type: Number,
      default: 0
    },
    zoomable: {
      type: Boolean,
      default: true
    },
    rotatable: {
      type: Boolean,
      default: true
    },
    showNav: {
      type: Boolean,
      default: true
    },
    showCounter: {
      type: Boolean,
      default: true
    },
    maskClosable: {
      type: Boolean,
      default: true
    },
    minZoom: {
      type: Number,
      default: 0.5
    },
    maxZoom: {
      type: Number,
      default: 3
    },
    className: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:open', 'update:currentIndex', 'close'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageViewerLabels(mergedLocale.value))
    const index = ref(props.currentIndex)
    const transform = ref<GestureTransform>(createDefaultTransform())
    let panState = createPanState()
    let pinchState = createPinchState()

    watch(
      () => props.currentIndex,
      (val) => {
        index.value = val
      }
    )

    function resetTransform() {
      transform.value = createDefaultTransform()
      panState = createPanState()
      pinchState = createPinchState()
    }

    const handleClose = () => {
      emit('update:open', false)
      emit('close')
    }

    const handlePrev = () => {
      index.value = (index.value - 1 + props.images.length) % props.images.length
      resetTransform()
      emit('update:currentIndex', index.value)
    }

    const handleNext = () => {
      index.value = (index.value + 1) % props.images.length
      resetTransform()
      emit('update:currentIndex', index.value)
    }

    const handleZoomIn = () => {
      transform.value = {
        ...transform.value,
        scale: clampZoom(transform.value.scale + 0.25, props.minZoom, props.maxZoom)
      }
    }

    const handleZoomOut = () => {
      transform.value = {
        ...transform.value,
        scale: clampZoom(transform.value.scale - 0.25, props.minZoom, props.maxZoom)
      }
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

    // Wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (!props.zoomable) return
      e.preventDefault()
      const newScale = applyWheelZoom(transform.value.scale, e.deltaY, {
        minZoom: props.minZoom,
        maxZoom: props.maxZoom
      })
      transform.value = { ...transform.value, scale: newScale }
    }

    // Mouse pan
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      panState = startPan(
        e.clientX,
        e.clientY,
        transform.value.translateX,
        transform.value.translateY
      )
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!panState.isPanning) return
      const result = movePan(panState, e.clientX, e.clientY)
      transform.value = { ...transform.value, ...result }
    }

    const handleMouseUp = () => {
      panState = createPanState()
    }

    // Touch pinch + pan
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2 && props.zoomable) {
        e.preventDefault()
        pinchState = startPinch(e.touches[0], e.touches[1], transform.value.scale)
      } else if (e.touches.length === 1) {
        panState = startPan(
          e.touches[0].clientX,
          e.touches[0].clientY,
          transform.value.translateX,
          transform.value.translateY
        )
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchState.isPinching) {
        e.preventDefault()
        const newScale = movePinch(
          pinchState,
          e.touches[0],
          e.touches[1],
          props.minZoom,
          props.maxZoom
        )
        transform.value = { ...transform.value, scale: newScale }
      } else if (e.touches.length === 1 && panState.isPanning) {
        const result = movePan(panState, e.touches[0].clientX, e.touches[0].clientY)
        transform.value = { ...transform.value, ...result }
      }
    }

    const handleTouchEnd = () => {
      pinchState = createPinchState()
      panState = createPanState()
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (!props.open) return
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
      document.addEventListener('keydown', handleKeydown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    return () => {
      if (!props.open || props.images.length === 0) return null

      const children = []

      // Counter
      if (props.showCounter && props.images.length > 1) {
        children.push(
          h(
            'div',
            { class: imageViewerCounterClasses },
            `${index.value + 1} / ${props.images.length}`
          )
        )
      }

      // Close button
      children.push(
        h(
          'button',
          {
            class: imageViewerCloseBtnClasses,
            onClick: handleClose,
            'aria-label': labels.value.closeAriaLabel,
            type: 'button'
          },
          createSvgIcon(imageViewerIcons.close, labels.value.closeAriaLabel)
        )
      )

      // Navigation
      if (props.showNav && props.images.length > 1) {
        children.push(
          h(
            'button',
            {
              class: classNames(imageViewerNavBtnClasses, 'left-4'),
              onClick: handlePrev,
              'aria-label': labels.value.previousImageAriaLabel,
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.prev, labels.value.previousImageAriaLabel)
          ),
          h(
            'button',
            {
              class: classNames(imageViewerNavBtnClasses, 'right-4'),
              onClick: handleNext,
              'aria-label': labels.value.nextImageAriaLabel,
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.next, labels.value.nextImageAriaLabel)
          )
        )
      }

      // Image
      children.push(
        h('img', {
          class: imageViewerImgClasses,
          src: props.images[index.value],
          alt: `Image ${index.value + 1}`,
          style: {
            transform: getImageTransformStyle(transform.value)
          },
          draggable: false,
          onWheel: handleWheel,
          onMousedown: handleMouseDown,
          onMousemove: handleMouseMove,
          onMouseup: handleMouseUp,
          onMouseleave: handleMouseUp,
          onTouchstart: handleTouchStart,
          onTouchmove: handleTouchMove,
          onTouchend: handleTouchEnd,
          onTouchcancel: handleTouchEnd
        })
      )

      // Toolbar
      const toolbarButtons = []
      if (props.zoomable) {
        toolbarButtons.push(
          h(
            'button',
            {
              class: imageViewerToolbarBtnClasses,
              onClick: handleZoomOut,
              'aria-label': labels.value.zoomOutAriaLabel,
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.zoomOut, labels.value.zoomOutAriaLabel)
          ),
          h(
            'button',
            {
              class: imageViewerToolbarBtnClasses,
              onClick: handleZoomIn,
              'aria-label': labels.value.zoomInAriaLabel,
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.zoomIn, labels.value.zoomInAriaLabel)
          )
        )
      }
      if (props.rotatable) {
        toolbarButtons.push(
          h(
            'button',
            {
              class: imageViewerToolbarBtnClasses,
              onClick: handleRotateLeft,
              'aria-label': labels.value.rotateLeftAriaLabel,
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.rotateLeft, labels.value.rotateLeftAriaLabel)
          ),
          h(
            'button',
            {
              class: imageViewerToolbarBtnClasses,
              onClick: handleRotateRight,
              'aria-label': labels.value.rotateRightAriaLabel,
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.rotateRight, labels.value.rotateRightAriaLabel)
          )
        )
      }
      if (toolbarButtons.length > 0) {
        children.push(h('div', { class: imageViewerToolbarClasses }, toolbarButtons))
      }

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            imageViewerBackdropClasses,
            props.className,
            coerceClassValue(attrs.class)
          ),
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': labels.value.dialogAriaLabel,
          onClick: (e: MouseEvent) => {
            if (props.maskClosable && e.target === e.currentTarget) {
              handleClose()
            }
          }
        },
        children
      )
    }
  }
})

export default ImageViewer
