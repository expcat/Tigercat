import { defineComponent, h, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  imageCropperContainerClasses,
  imageCropperImgClasses,
  imageCropperMaskClasses,
  imageCropperSelectionClasses,
  imageCropperGuideClasses,
  imageCropperDragAreaClasses,
  getCropperHandleClasses,
  CROP_HANDLES,
  getInitialCropRect,
  constrainCropRect,
  resizeCropRect,
  moveCropRect,
  cropCanvas,
  type CropRect,
  type CropResult,
  type CropHandle,
  type ImageCropperProps as CoreImageCropperProps
} from '@expcat/tigercat-core'

export interface VueImageCropperProps {
  src: string
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
  guides?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const ImageCropper = defineComponent({
  name: 'TigerImageCropper',
  inheritAttrs: false,
  props: {
    src: { type: String, required: true },
    aspectRatio: { type: Number, default: undefined },
    minWidth: { type: Number, default: 20 },
    minHeight: { type: Number, default: 20 },
    outputType: {
      type: String as PropType<'image/png' | 'image/jpeg' | 'image/webp'>,
      default: 'image/png'
    },
    quality: { type: Number, default: 0.92 },
    guides: { type: Boolean, default: true },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['crop-change', 'ready'],
  setup(props, { emit, attrs, expose }) {
    const containerRef = ref<HTMLElement | null>(null)
    const imageRef = ref<HTMLImageElement | null>(null)
    const imageLoaded = ref(false)
    const displayWidth = ref(0)
    const displayHeight = ref(0)
    const cropRect = ref<CropRect>({ x: 0, y: 0, width: 0, height: 0 })

    // Drag state
    const dragMode = ref<'none' | 'move' | 'resize'>('none')
    const activeHandle = ref<CropHandle | null>(null)
    const dragStartPos = ref({ x: 0, y: 0 })
    const dragStartRect = ref<CropRect>({ x: 0, y: 0, width: 0, height: 0 })

    const loadImage = () => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.value = img

        // Calculate display dimensions to fit container
        if (containerRef.value) {
          const containerW = containerRef.value.clientWidth
          const containerH = containerRef.value.clientHeight || 400
          const ratio = Math.min(containerW / img.naturalWidth, containerH / img.naturalHeight, 1)
          displayWidth.value = img.naturalWidth * ratio
          displayHeight.value = img.naturalHeight * ratio
        } else {
          displayWidth.value = img.naturalWidth
          displayHeight.value = img.naturalHeight
        }

        cropRect.value = getInitialCropRect(
          displayWidth.value,
          displayHeight.value,
          props.aspectRatio
        )

        imageLoaded.value = true
        emit('ready')
      }
      img.src = props.src
    }

    watch(
      () => props.src,
      () => {
        imageLoaded.value = false
        loadImage()
      }
    )

    onMounted(() => {
      loadImage()
    })

    // Dragging handlers
    const handleMouseDown = (e: MouseEvent, mode: 'move' | 'resize', handle?: CropHandle) => {
      e.preventDefault()
      e.stopPropagation()
      dragMode.value = mode
      activeHandle.value = handle || null
      dragStartPos.value = { x: e.clientX, y: e.clientY }
      dragStartRect.value = { ...cropRect.value }

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragStartPos.value.x
        const dy = ev.clientY - dragStartPos.value.y

        if (dragMode.value === 'move') {
          cropRect.value = moveCropRect(
            dragStartRect.value,
            dx,
            dy,
            displayWidth.value,
            displayHeight.value
          )
        } else if (dragMode.value === 'resize' && activeHandle.value) {
          cropRect.value = resizeCropRect(
            dragStartRect.value,
            activeHandle.value,
            dx,
            dy,
            displayWidth.value,
            displayHeight.value,
            props.aspectRatio,
            props.minWidth,
            props.minHeight
          )
        }
        emit('crop-change', cropRect.value)
      }

      const onMouseUp = () => {
        dragMode.value = 'none'
        activeHandle.value = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    // Touch support
    const handleTouchStart = (e: TouchEvent, mode: 'move' | 'resize', handle?: CropHandle) => {
      if (e.touches.length !== 1) return
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      dragMode.value = mode
      activeHandle.value = handle || null
      dragStartPos.value = { x: touch.clientX, y: touch.clientY }
      dragStartRect.value = { ...cropRect.value }

      const onTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length !== 1) return
        const t = ev.touches[0]
        const dx = t.clientX - dragStartPos.value.x
        const dy = t.clientY - dragStartPos.value.y

        if (dragMode.value === 'move') {
          cropRect.value = moveCropRect(
            dragStartRect.value,
            dx,
            dy,
            displayWidth.value,
            displayHeight.value
          )
        } else if (dragMode.value === 'resize' && activeHandle.value) {
          cropRect.value = resizeCropRect(
            dragStartRect.value,
            activeHandle.value,
            dx,
            dy,
            displayWidth.value,
            displayHeight.value,
            props.aspectRatio,
            props.minWidth,
            props.minHeight
          )
        }
        emit('crop-change', cropRect.value)
      }

      const onTouchEnd = () => {
        dragMode.value = 'none'
        activeHandle.value = null
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
      }

      document.addEventListener('touchmove', onTouchMove, { passive: false })
      document.addEventListener('touchend', onTouchEnd)
    }

    // Expose getCropResult method
    const getCropResult = (): Promise<CropResult> => {
      return new Promise((resolve, reject) => {
        if (!imageRef.value) {
          reject(new Error('Image not loaded'))
          return
        }

        const { canvas, dataUrl } = cropCanvas(
          imageRef.value,
          cropRect.value,
          displayWidth.value,
          displayHeight.value,
          props.outputType,
          props.quality
        )

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ canvas, blob, dataUrl, cropRect: { ...cropRect.value } })
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          props.outputType,
          props.quality
        )
      })
    }

    expose({ getCropResult })

    const containerClasses = computed(() =>
      classNames(
        imageCropperContainerClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const containerStyle = computed(() =>
      mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
    )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      if (!imageLoaded.value) {
        return h(
          'div',
          {
            ...forwardedAttrs,
            ref: containerRef,
            class: classNames(containerClasses.value, 'flex items-center justify-center'),
            style: Object.assign({}, containerStyle.value as Record<string, unknown>, {
              minHeight: '200px'
            }),
            role: 'img',
            'aria-label': 'Loading image for cropping'
          },
          [
            h('div', {
              class: 'w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin'
            })
          ]
        )
      }

      const cr = cropRect.value

      // Source image
      const img = h('img', {
        src: props.src,
        class: imageCropperImgClasses,
        style: {
          width: `${displayWidth.value}px`,
          height: `${displayHeight.value}px`
        },
        draggable: false,
        alt: 'Image to crop'
      })

      // Semi-transparent mask with SVG cutout
      const mask = h(
        'svg',
        {
          class: imageCropperMaskClasses,
          width: displayWidth.value,
          height: displayHeight.value,
          xmlns: 'http://www.w3.org/2000/svg'
        },
        [
          h('defs', null, [
            h('mask', { id: 'crop-mask' }, [
              h('rect', {
                width: displayWidth.value,
                height: displayHeight.value,
                fill: 'white'
              }),
              h('rect', {
                x: cr.x,
                y: cr.y,
                width: cr.width,
                height: cr.height,
                fill: 'black'
              })
            ])
          ]),
          h('rect', {
            width: displayWidth.value,
            height: displayHeight.value,
            fill: 'var(--tiger-image-cropper-mask, rgba(0,0,0,0.55))',
            mask: 'url(#crop-mask)'
          })
        ]
      )

      // Selection box
      const selection = h('div', {
        class: imageCropperSelectionClasses,
        style: {
          left: `${cr.x}px`,
          top: `${cr.y}px`,
          width: `${cr.width}px`,
          height: `${cr.height}px`
        }
      })

      // Drag area (move crop box)
      const dragArea = h('div', {
        class: imageCropperDragAreaClasses,
        style: {
          left: `${cr.x}px`,
          top: `${cr.y}px`,
          width: `${cr.width}px`,
          height: `${cr.height}px`
        },
        onMousedown: (e: MouseEvent) => handleMouseDown(e, 'move'),
        onTouchstart: (e: TouchEvent) => handleTouchStart(e, 'move')
      })

      // Guide lines (rule of thirds)
      const guideLines = props.guides
        ? [
            // Horizontal lines
            h('div', {
              class: imageCropperGuideClasses,
              style: {
                left: `${cr.x}px`,
                top: `${cr.y + cr.height / 3}px`,
                width: `${cr.width}px`,
                height: '0px',
                borderTopWidth: '1px',
                borderTopStyle: 'dashed'
              }
            }),
            h('div', {
              class: imageCropperGuideClasses,
              style: {
                left: `${cr.x}px`,
                top: `${cr.y + (cr.height * 2) / 3}px`,
                width: `${cr.width}px`,
                height: '0px',
                borderTopWidth: '1px',
                borderTopStyle: 'dashed'
              }
            }),
            // Vertical lines
            h('div', {
              class: imageCropperGuideClasses,
              style: {
                left: `${cr.x + cr.width / 3}px`,
                top: `${cr.y}px`,
                width: '0px',
                height: `${cr.height}px`,
                borderLeftWidth: '1px',
                borderLeftStyle: 'dashed'
              }
            }),
            h('div', {
              class: imageCropperGuideClasses,
              style: {
                left: `${cr.x + (cr.width * 2) / 3}px`,
                top: `${cr.y}px`,
                width: '0px',
                height: `${cr.height}px`,
                borderLeftWidth: '1px',
                borderLeftStyle: 'dashed'
              }
            })
          ]
        : []

      // Resize handles
      const handles = CROP_HANDLES.map((handle) => {
        const pos: Record<string, string> = {}

        // Position relative to crop box
        if (handle.includes('n')) pos.top = `${cr.y}px`
        if (handle.includes('s')) pos.top = `${cr.y + cr.height}px`
        if (handle === 'e' || handle === 'w') pos.top = `${cr.y + cr.height / 2}px`
        if (handle.includes('w')) pos.left = `${cr.x}px`
        if (handle.includes('e')) pos.left = `${cr.x + cr.width}px`
        if (handle === 'n' || handle === 's') pos.left = `${cr.x + cr.width / 2}px`

        return h('div', {
          class: getCropperHandleClasses(handle),
          style: pos,
          onMousedown: (e: MouseEvent) => handleMouseDown(e, 'resize', handle),
          onTouchstart: (e: TouchEvent) => handleTouchStart(e, 'resize', handle)
        })
      })

      return h(
        'div',
        {
          ...forwardedAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: Object.assign({}, containerStyle.value as Record<string, unknown>, {
            width: `${displayWidth.value}px`,
            height: `${displayHeight.value}px`
          }),
          role: 'application',
          'aria-label': 'Image cropper',
          'aria-roledescription': 'image cropper'
        },
        [img, mask, selection, dragArea, ...guideLines, ...handles]
      )
    }
  }
})

export default ImageCropper
