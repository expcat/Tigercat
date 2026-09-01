import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  CROP_HANDLES,
  IMAGE_CROPPER_MASK_FILL,
  constrainCropRect,
  createCropperImageLoader,
  createDocumentDragSession,
  cropCanvas,
  formatCropperResizeAriaLabel,
  getCropperDisplaySize,
  getCropperHandleClasses,
  getCropperHandleName,
  getCropperHandleStyle,
  getImageEditorLabels,
  getInitialCropRect,
  imageCropperContainerClasses,
  imageCropperDragAreaClasses,
  imageCropperFrameClasses,
  imageCropperGuideClasses,
  imageCropperImgClasses,
  imageCropperMaskClasses,
  imageCropperSelectionClasses,
  imageErrorClasses,
  imageErrorIconPath,
  imageLoadingSpinnerClasses,
  imageLoadingSpinnerPath,
  injectImageCropperStyles,
  mergeTigerLocale,
  moveCropRect,
  remapCropRect,
  resizeCropRect,
  type CropHandle,
  type CropRect,
  type CropResult,
  type DocumentDragSession,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueImageCropperProps {
  locale?: Partial<TigerLocale>
  src: string
  cropRect?: CropRect
  defaultCropRect?: CropRect
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
  guides?: boolean
  className?: string
  style?: Record<string, string | number>
}

export interface ImageCropperRef {
  getCropResult: () => Promise<CropResult>
}

type CropperStatus = 'loading' | 'ready' | 'error'

export const ImageCropper = defineComponent({
  name: 'TigerImageCropper',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    src: { type: String, required: true },
    cropRect: {
      type: Object as PropType<CropRect>,
      default: undefined
    },
    defaultCropRect: {
      type: Object as PropType<CropRect>,
      default: undefined
    },
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
  emits: {
    'crop-change': (rect: CropRect) => Boolean(rect),
    'update:crop-rect': (rect: CropRect) => Boolean(rect),
    ready: () => true,
    error: (error: Error) => error instanceof Error
  },
  setup(props, { emit, attrs, expose }) {
    const instance = getCurrentInstance()
    const maskId = `tiger-crop-mask-${instance?.uid ?? '0'}`
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageEditorLabels(mergedLocale.value))
    const containerRef = ref<HTMLElement | null>(null)
    const imageRef = ref<HTMLImageElement | null>(null)
    const status = ref<CropperStatus>('loading')
    const displayWidth = ref(0)
    const displayHeight = ref(0)
    const internalCropRect = ref<CropRect>(
      props.defaultCropRect ?? { x: 0, y: 0, width: 0, height: 0 }
    )
    const loader = createCropperImageLoader()
    let dragSession: DocumentDragSession | null = null
    let resizeObserver: ResizeObserver | null = null
    let naturalWidth = 0
    let naturalHeight = 0
    let loadedAspect = props.aspectRatio

    const currentCropRect = (): CropRect =>
      props.cropRect !== undefined ? props.cropRect : internalCropRect.value

    const commitCropRect = (next: CropRect): void => {
      const resolved = constrainCropRect(
        next,
        displayWidth.value,
        displayHeight.value,
        props.aspectRatio,
        props.minWidth,
        props.minHeight
      )
      if (props.cropRect === undefined) {
        internalCropRect.value = resolved
      }
      emit('update:crop-rect', resolved)
      emit('crop-change', resolved)
    }

    watch(
      () => props.cropRect,
      (value) => {
        if (value !== undefined) internalCropRect.value = value
      }
    )

    const applyDisplaySize = (width: number, height: number, resetCrop: boolean): void => {
      displayWidth.value = width
      displayHeight.value = height
      if (resetCrop) {
        commitCropRect(
          props.defaultCropRect ??
            getInitialCropRect(width, height, props.aspectRatio, props.minWidth, props.minHeight)
        )
      }
    }

    const loadImage = (): void => {
      status.value = 'loading'
      imageRef.value = null
      loader.load(props.src, {
        onLoad: (img, nw, nh) => {
          const container = containerRef.value
          const size = getCropperDisplaySize(
            nw,
            nh,
            container?.clientWidth ?? 0,
            container?.clientHeight ?? 0
          )
          if (!size) {
            status.value = 'error'
            emit('error', new Error('Image not loaded'))
            return
          }
          imageRef.value = img
          naturalWidth = nw
          naturalHeight = nh
          loadedAspect = props.aspectRatio
          applyDisplaySize(size.width, size.height, true)
          status.value = 'ready'
          emit('ready')
        },
        onError: () => {
          imageRef.value = null
          status.value = 'error'
          emit('error', new Error('Image not loaded'))
        }
      })
    }

    const observeContainer = (): void => {
      resizeObserver?.disconnect()
      const container = containerRef.value
      if (!container || typeof ResizeObserver === 'undefined') return
      resizeObserver = new ResizeObserver(() => {
        if (status.value !== 'ready') return
        const next = getCropperDisplaySize(
          naturalWidth,
          naturalHeight,
          container.clientWidth,
          container.clientHeight
        )
        if (!next) return
        if (next.width === displayWidth.value && next.height === displayHeight.value) return
        const mapped = remapCropRect(
          currentCropRect(),
          displayWidth.value,
          displayHeight.value,
          next.width,
          next.height,
          props.aspectRatio,
          props.minWidth,
          props.minHeight
        )
        displayWidth.value = next.width
        displayHeight.value = next.height
        commitCropRect(mapped)
      })
      resizeObserver.observe(container)
    }

    watch(
      () => props.src,
      () => {
        loadImage()
      }
    )

    watch(
      () => props.aspectRatio,
      (value) => {
        if (status.value !== 'ready') {
          loadedAspect = value
          return
        }
        if (Object.is(loadedAspect, value)) return
        loadedAspect = value
        commitCropRect(
          getInitialCropRect(
            displayWidth.value,
            displayHeight.value,
            value,
            props.minWidth,
            props.minHeight
          )
        )
      }
    )

    onMounted(() => {
      injectImageCropperStyles()
      loadImage()
      observeContainer()
    })

    onBeforeUnmount(() => {
      loader.dispose()
      dragSession?.dispose()
      dragSession = null
      resizeObserver?.disconnect()
    })

    const startDrag = (event: PointerEvent, mode: 'move' | 'resize', handle?: CropHandle): void => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      event.preventDefault()
      const startRect = { ...currentCropRect() }
      dragSession?.dispose()
      dragSession = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        ownerDocument:
          event.currentTarget instanceof Node
            ? (event.currentTarget.ownerDocument ?? undefined)
            : undefined,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget instanceof Element ? event.currentTarget : null,
        onMove: ({ event: moveEvent, deltaX, deltaY }) => {
          if (moveEvent.cancelable) moveEvent.preventDefault()
          if (mode === 'move') {
            commitCropRect(
              moveCropRect(startRect, deltaX, deltaY, displayWidth.value, displayHeight.value)
            )
          } else if (handle) {
            commitCropRect(
              resizeCropRect(
                startRect,
                handle,
                deltaX,
                deltaY,
                displayWidth.value,
                displayHeight.value,
                props.aspectRatio,
                props.minWidth,
                props.minHeight
              )
            )
          }
        },
        onEnd: () => {
          dragSession = null
        }
      })
    }

    const getKeyboardDelta = (event: KeyboardEvent): { dx: number; dy: number } | null => {
      const step = event.shiftKey ? 10 : 1
      switch (event.key) {
        case 'ArrowLeft':
          return { dx: -step, dy: 0 }
        case 'ArrowRight':
          return { dx: step, dy: 0 }
        case 'ArrowUp':
          return { dx: 0, dy: -step }
        case 'ArrowDown':
          return { dx: 0, dy: step }
        default:
          return null
      }
    }

    const handleMoveKeyDown = (event: KeyboardEvent): void => {
      const delta = getKeyboardDelta(event)
      if (!delta) return
      event.preventDefault()
      commitCropRect(
        moveCropRect(currentCropRect(), delta.dx, delta.dy, displayWidth.value, displayHeight.value)
      )
    }

    const getCropResult = (): Promise<CropResult> => {
      return new Promise((resolve, reject) => {
        if (status.value !== 'ready' || !imageRef.value) {
          reject(new Error('Image not loaded'))
          return
        }
        try {
          const rect = currentCropRect()
          const { canvas, dataUrl } = cropCanvas(
            imageRef.value,
            rect,
            displayWidth.value,
            displayHeight.value,
            props.outputType,
            props.quality
          )
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const extension = (
                  (props.outputType ?? 'image/png').split('/')[1] || 'png'
                ).replace('jpeg', 'jpg')
                const file = new File([blob], `crop.${extension}`, { type: blob.type })
                resolve({ canvas, blob, dataUrl, cropRect: { ...rect }, file })
              } else {
                reject(new Error('Failed to create blob'))
              }
            },
            props.outputType,
            props.quality
          )
        } catch (error) {
          reject(error)
        }
      })
    }

    expose({ getCropResult } satisfies ImageCropperRef)

    const containerClasses = computed(() =>
      classNames(
        imageCropperContainerClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const renderErrorIcon = () =>
      h(
        'svg',
        {
          class: 'w-8 h-8',
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '1.5',
            d: imageErrorIconPath
          })
        ]
      )

    const renderLoadingSpinner = () =>
      h(
        'svg',
        {
          class: imageLoadingSpinnerClasses,
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          'aria-hidden': 'true'
        },
        [
          h('circle', {
            class: 'opacity-25',
            cx: '12',
            cy: '12',
            r: '10',
            stroke: 'currentColor',
            'stroke-width': '4',
            fill: 'none'
          }),
          h('path', {
            class: 'opacity-75',
            fill: 'currentColor',
            d: imageLoadingSpinnerPath
          })
        ]
      )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )
      const mergedStyle = (mergeStyleValues(
        (attrs as Record<string, unknown>).style,
        props.style
      ) ?? {}) as Record<string, unknown>

      if (status.value !== 'ready') {
        return h(
          'div',
          {
            ...forwardedAttrs,
            ref: containerRef,
            class: classNames(containerClasses.value, 'flex items-center justify-center'),
            style: {
              ...mergedStyle,
              minHeight: mergedStyle.minHeight ?? '200px'
            },
            'data-image-cropper': '',
            'data-image-cropper-status': status.value,
            role: 'img',
            'aria-label':
              status.value === 'error'
                ? labels.value.loadErrorAriaLabel
                : labels.value.loadingCropImageAriaLabel
          },
          [
            status.value === 'error'
              ? h('div', { class: imageErrorClasses }, [renderErrorIcon()])
              : renderLoadingSpinner()
          ]
        )
      }

      const cr = currentCropRect()
      const dw = displayWidth.value
      const dh = displayHeight.value

      const img = h('img', {
        src: props.src,
        class: imageCropperImgClasses,
        style: { width: `${dw}px`, height: `${dh}px` },
        draggable: false,
        alt: labels.value.imageToCropAriaLabel
      })

      const mask = h(
        'svg',
        {
          class: imageCropperMaskClasses,
          width: dw,
          height: dh,
          xmlns: 'http://www.w3.org/2000/svg'
        },
        [
          h('defs', null, [
            h('mask', { id: maskId }, [
              h('rect', { width: dw, height: dh, fill: 'white' }),
              h('rect', { x: cr.x, y: cr.y, width: cr.width, height: cr.height, fill: 'black' })
            ])
          ]),
          h('rect', {
            width: dw,
            height: dh,
            fill: IMAGE_CROPPER_MASK_FILL,
            mask: `url(#${maskId})`
          })
        ]
      )

      const frame = h(
        'div',
        {
          class: imageCropperFrameClasses,
          style: { width: `${dw}px`, height: `${dh}px` }
        },
        [img, mask]
      )

      const selection = h('div', {
        class: imageCropperSelectionClasses,
        style: {
          left: `${cr.x}px`,
          top: `${cr.y}px`,
          width: `${cr.width}px`,
          height: `${cr.height}px`
        }
      })

      const dragArea = h('div', {
        class: imageCropperDragAreaClasses,
        style: {
          left: `${cr.x}px`,
          top: `${cr.y}px`,
          width: `${cr.width}px`,
          height: `${cr.height}px`
        },
        'data-crop-move': '',
        role: 'button',
        tabindex: 0,
        'aria-label': labels.value.moveCropAreaAriaLabel,
        onPointerdown: (event: PointerEvent) => startDrag(event, 'move'),
        onKeydown: handleMoveKeyDown
      })

      const guideLines = props.guides
        ? [
            h('div', {
              class: imageCropperGuideClasses,
              'data-guide': 'true',
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
              'data-guide': 'true',
              style: {
                left: `${cr.x}px`,
                top: `${cr.y + (cr.height * 2) / 3}px`,
                width: `${cr.width}px`,
                height: '0px',
                borderTopWidth: '1px',
                borderTopStyle: 'dashed'
              }
            }),
            h('div', {
              class: imageCropperGuideClasses,
              'data-guide': 'true',
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
              'data-guide': 'true',
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

      const handles = CROP_HANDLES.map((handle) =>
        h('div', {
          class: getCropperHandleClasses(handle),
          style: getCropperHandleStyle(handle, cr),
          'data-crop-handle': handle,
          role: 'button',
          tabindex: -1,
          'aria-label': formatCropperResizeAriaLabel(
            labels.value.resizeCropAreaAriaLabel,
            getCropperHandleName(handle, labels.value)
          ),
          onPointerdown: (event: PointerEvent) => startDrag(event, 'resize', handle)
        })
      )

      return h(
        'div',
        {
          ...forwardedAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: {
            ...mergedStyle,
            width: mergedStyle.width ?? `${dw}px`,
            height: mergedStyle.height ?? `${dh}px`
          },
          'data-image-cropper': '',
          'data-image-cropper-status': 'ready',
          role: 'group',
          'aria-label': labels.value.cropperDialogAriaLabel
        },
        [frame, selection, dragArea, ...guideLines, ...handles]
      )
    }
  }
})

export default ImageCropper
