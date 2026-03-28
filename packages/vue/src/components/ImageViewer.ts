import { defineComponent, h, ref, PropType, watch, onMounted, onBeforeUnmount } from 'vue'
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
  normalizeRotation
} from '@expcat/tigercat-core'

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
    }
  },
  emits: ['update:open', 'update:currentIndex', 'close'],
  setup(props, { emit, attrs }) {
    const index = ref(props.currentIndex)
    const zoom = ref(1)
    const rotation = ref(0)

    watch(
      () => props.currentIndex,
      (val) => {
        index.value = val
      }
    )

    const handleClose = () => {
      emit('update:open', false)
      emit('close')
    }

    const handlePrev = () => {
      index.value = (index.value - 1 + props.images.length) % props.images.length
      zoom.value = 1
      rotation.value = 0
      emit('update:currentIndex', index.value)
    }

    const handleNext = () => {
      index.value = (index.value + 1) % props.images.length
      zoom.value = 1
      rotation.value = 0
      emit('update:currentIndex', index.value)
    }

    const handleZoomIn = () => {
      zoom.value = clampZoom(zoom.value + 0.25, props.minZoom, props.maxZoom)
    }

    const handleZoomOut = () => {
      zoom.value = clampZoom(zoom.value - 0.25, props.minZoom, props.maxZoom)
    }

    const handleRotateLeft = () => {
      rotation.value = normalizeRotation(rotation.value - 90)
    }

    const handleRotateRight = () => {
      rotation.value = normalizeRotation(rotation.value + 90)
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
            'aria-label': 'Close',
            type: 'button'
          },
          createSvgIcon(imageViewerIcons.close, 'Close')
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
              'aria-label': 'Previous image',
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.prev, 'Previous')
          ),
          h(
            'button',
            {
              class: classNames(imageViewerNavBtnClasses, 'right-4'),
              onClick: handleNext,
              'aria-label': 'Next image',
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.next, 'Next')
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
            transform: `scale(${zoom.value}) rotate(${rotation.value}deg)`
          },
          draggable: false
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
              'aria-label': 'Zoom out',
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.zoomOut, 'Zoom out')
          ),
          h(
            'button',
            {
              class: imageViewerToolbarBtnClasses,
              onClick: handleZoomIn,
              'aria-label': 'Zoom in',
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.zoomIn, 'Zoom in')
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
              'aria-label': 'Rotate left',
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.rotateLeft, 'Rotate left')
          ),
          h(
            'button',
            {
              class: imageViewerToolbarBtnClasses,
              onClick: handleRotateRight,
              'aria-label': 'Rotate right',
              type: 'button'
            },
            createSvgIcon(imageViewerIcons.rotateRight, 'Rotate right')
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
          'aria-label': 'Image viewer',
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
