import { computed, defineComponent, h, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'
import {
  classNames,
  movePolygonVertex,
  nudgeAnnotationBox,
  pushAnnotationHistory,
  undoAnnotation,
  isActivationKey,
  coerceClassValue,
  addImageAnnotationPolygonPoint,
  clampImageAnnotationShapeIndex,
  stepImageAnnotationShapeIndex,
  createAnnotationFrameCoalescer,
  getImageAnnotationStageStyle,
  imageAnnotationDrawingClasses,
  manageLiveRegion,
  nextToolbarRovingIndex,
  commitImageAnnotationPolygon,
  createCropperImageLoader,
  createDocumentDragSession,
  createImageAnnotationId,
  defaultImageAnnotationTools,
  draftImageAnnotationFromDraw,
  finishImageAnnotationDraw,
  getAnnotationDisplaySize,
  getImageAnnotationCenter,
  getImageAnnotationFrameStyle,
  getImageAnnotationPathData,
  getImageAnnotationPointFromClient,
  getImageAnnotationShapePaint,
  getImageAnnotationViewBox,
  getImageAnnotationShapeAriaLabel,
  getImageAnnotationStrokeColor,
  getImageAnnotationToolButtonClasses,
  getImageAnnotationToolTypeLabel,
  getImageEditorLabels,
  imageAnnotationContainerClasses,
  imageAnnotationDeleteButtonClasses,
  imageAnnotationFrameClasses,
  imageAnnotationImageClasses,
  imageAnnotationLabelClasses,
  imageAnnotationOverlayClasses,
  imageAnnotationOverlayPreserveAspectRatio,
  imageAnnotationReadonlyOverlayClasses,
  imageAnnotationShapeClasses,
  imageAnnotationStageClasses,
  imageAnnotationToolbarClasses,
  imageErrorClasses,
  imageErrorIconPath,
  imageLoadingSpinnerClasses,
  imageLoadingSpinnerPath,
  isImageAnnotationShapeTarget,
  isImageAnnotationShapeTool,
  mergeTigerLocale,
  mergeStyleValues,
  moveImageAnnotationDraw,
  resolveImageAnnotationTool,
  startImageAnnotationDraw,
  type DocumentDragSession,
  type ImageAnnotation as CoreImageAnnotation,
  type ImageAnnotationChangeMeta,
  type ImageAnnotationDrawState,
  type ImageAnnotationTool,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface VueImageAnnotationProps {
  locale?: Partial<TigerLocale>
  src: string
  alt?: string
  modelValue?: CoreImageAnnotation[]
  defaultValue?: CoreImageAnnotation[]
  selectedId?: string
  defaultSelectedId?: string
  tool?: ImageAnnotationTool
  defaultTool?: ImageAnnotationTool
  tools?: ImageAnnotationTool[]
  disabled?: boolean
  readonly?: boolean
  minSize?: number
  strokeWidth?: number
  showLabels?: boolean
  className?: string
  style?: Record<string, string | number>
}

type LoadStatus = 'loading' | 'ready' | 'error'

export const ImageAnnotation = defineComponent({
  name: 'TigerImageAnnotation',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    src: { type: String, required: true },
    alt: { type: String, default: undefined },
    modelValue: { type: Array as PropType<CoreImageAnnotation[]>, default: undefined },
    defaultValue: {
      type: Array as PropType<CoreImageAnnotation[]>,
      default: () => []
    },
    selectedId: { type: String, default: undefined },
    defaultSelectedId: { type: String, default: undefined },
    tool: { type: String as PropType<ImageAnnotationTool>, default: undefined },
    defaultTool: { type: String as PropType<ImageAnnotationTool>, default: 'select' },
    tools: {
      type: Array as PropType<ImageAnnotationTool[]>,
      default: () => defaultImageAnnotationTools
    },
    disabled: { type: Boolean, default: false },
    bind: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    minSize: { type: Number, default: 0.01 },
    strokeWidth: { type: Number, default: 2 },
    showLabels: { type: Boolean, default: true },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: [
    'update:modelValue',
    'change',
    'select',
    'tool-change',
    'ready',
    'error',
    'update:selectedId',
    'update:tool'
  ],
  setup(props, { attrs, emit }) {
    const annotationBox = ref({ x: 0.2, y: 0.2, width: 0.3, height: 0.2 })
    const polygon = ref([
      { x: 0.1, y: 0.1 },
      { x: 0.4, y: 0.1 },
      { x: 0.2, y: 0.4 }
    ])
    const annotationHistory = ref<
      { annotations: { x: number; y: number; width: number; height: number }[] }[]
    >([])
    const annotationBlob = ref('')
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageEditorLabels(mergedLocale.value))
    const sizeHostRef = ref<HTMLElement | null>(null)
    const overlayRef = ref<SVGSVGElement | null>(null)
    const status = ref<LoadStatus>('loading')
    const displayWidth = ref(0)
    const displayHeight = ref(0)
    const innerAnnotations = ref<CoreImageAnnotation[]>(props.defaultValue)
    const innerSelectedId = ref<string | undefined>(props.defaultSelectedId)
    const innerTool = ref<ImageAnnotationTool>(props.defaultTool)
    const draft = ref<CoreImageAnnotation | null>(null)
    const drawing = ref<ImageAnnotationDrawState | null>(null)
    const focusedShape = ref(0)
    const swallowClick = ref(false)
    const natural = { w: 0, h: 0 }
    const loader = createCropperImageLoader()
    let dragSession: DocumentDragSession | null = null
    let resizeObserver: ResizeObserver | null = null

    const annotations = computed(() =>
      props.modelValue !== undefined ? props.modelValue : innerAnnotations.value
    )
    const activeSelectedId = computed(() =>
      props.selectedId !== undefined ? props.selectedId : innerSelectedId.value
    )
    const resolvedTool = computed(() =>
      resolveImageAnnotationTool(
        props.tool !== undefined ? props.tool : innerTool.value,
        props.tools
      )
    )
    const canEdit = computed(() => !props.disabled && !props.readonly)
    const canSelect = computed(() => !props.disabled)
    const imageAlt = computed(() => props.alt ?? labels.value.defaultAnnotationAlt)

    const applyDisplaySize = () => {
      const size = getAnnotationDisplaySize(
        natural.w,
        natural.h,
        sizeHostRef.value?.clientWidth ?? 0
      )
      if (!size) return false
      displayWidth.value = size.width
      displayHeight.value = size.height
      return true
    }

    const observeHost = () => {
      resizeObserver?.disconnect()
      const host = sizeHostRef.value
      if (!host || typeof ResizeObserver === 'undefined') return
      resizeObserver = new ResizeObserver(() => {
        if (status.value !== 'ready') return
        applyDisplaySize()
      })
      resizeObserver.observe(host)
    }

    const drawingStroke = ref(false)
    const loadAttempt = ref(0)
    const toolIndex = ref(0)
    const shapeEls: Array<SVGElement | null> = []
    const live = manageLiveRegion('polite')

    const loadImage = () => {
      status.value = 'loading'
      draft.value = null
      drawing.value = null
      loader.load(props.src, {
        onLoad: (_image, naturalWidth, naturalHeight) => {
          natural.w = naturalWidth
          natural.h = naturalHeight
          if (!applyDisplaySize()) {
            status.value = 'error'
            emit('error', new Error('Image not loaded'))
            return
          }
          status.value = 'ready'
          emit('ready')
          observeHost()
        },
        onError: () => {
          status.value = 'error'
          emit('error', new Error('Image not loaded'))
        }
      })
    }

    onMounted(loadImage)
    watch([() => props.src, loadAttempt], loadImage)
    onBeforeUnmount(() => {
      loader.dispose()
      dragSession?.dispose()
      dragSession = null
      resizeObserver?.disconnect()
    })

    const commitAnnotations = (next: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => {
      if (props.modelValue === undefined) innerAnnotations.value = next
      emit('update:modelValue', next)
      emit('change', next, meta)
    }

    const selectAnnotation = (annotation: CoreImageAnnotation | null) => {
      if (!canSelect.value) return
      if (props.selectedId === undefined) innerSelectedId.value = annotation?.id
      emit('select', annotation)
      emit('update:selectedId', annotation?.id ?? '')
    }

    const setActiveTool = (nextTool: ImageAnnotationTool) => {
      if (nextTool !== resolvedTool.value) {
        draft.value = null
        drawing.value = null
      }
      if (props.tool === undefined) innerTool.value = nextTool
      emit('tool-change', nextTool)
      emit('update:tool', nextTool)
    }

    const nextId = (shape: string) =>
      createImageAnnotationId(
        shape,
        annotations.value.map((item) => item.id)
      )

    const getPointFromEvent = (clientX: number, clientY: number) => {
      const bounds = overlayRef.value?.getBoundingClientRect()
      if (!bounds) return { x: 0, y: 0 }
      return getImageAnnotationPointFromClient(clientX, clientY, bounds)
    }

    const commitAnnotation = (annotation: CoreImageAnnotation) => {
      commitAnnotations([...annotations.value, annotation], { type: 'add', annotation })
      selectAnnotation(annotation)
    }

    onBeforeUnmount(() => live.destroy())
    const isRtl = computed(() => mergedLocale.value?.direction === 'rtl')

    const commitPolygon = () => {
      if (!drawing.value) return
      const annotation = commitImageAnnotationPolygon(drawing.value, nextId('polygon'))
      drawing.value = null
      draft.value = null
      if (!annotation) {
        live.announce(labels.value.annotationPolygonIncompleteText)
        return
      }
      swallowClick.value = true
      commitAnnotation(annotation)
    }

    const handleStagePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      if (
        !canEdit.value ||
        !isImageAnnotationShapeTool(resolvedTool.value) ||
        resolvedTool.value === 'polygon'
      ) {
        return
      }

      event.preventDefault()
      const point = getPointFromEvent(event.clientX, event.clientY)
      drawing.value = startImageAnnotationDraw(resolvedTool.value, point)
      drawingStroke.value = true
      dragSession?.dispose()
      const frames = createAnnotationFrameCoalescer(
        (payload: { currentX: number; currentY: number }) => {
          if (!drawing.value) return
          drawing.value = moveImageAnnotationDraw(
            drawing.value,
            getPointFromEvent(payload.currentX, payload.currentY)
          )
          draft.value = draftImageAnnotationFromDraw(drawing.value)
        }
      )
      dragSession = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget as Element,
        dragThreshold: 0,
        onMove: (payload) => {
          frames.push(payload)
        },
        onEnd: (payload) => {
          frames.cancel()
          drawingStroke.value = false
          const current = drawing.value
          drawing.value = null
          dragSession = null
          if (!current || payload.cancelled) {
            draft.value = null
            return
          }
          const annotation = finishImageAnnotationDraw(
            current,
            getPointFromEvent(payload.currentX, payload.currentY),
            nextId(current.tool),
            props.minSize
          )
          draft.value = null
          if (annotation) {
            swallowClick.value = true
            commitAnnotation(annotation)
            return
          }
          live.announce(labels.value.annotationTooSmallText)
        }
      })
    }

    const handleStageClick = (event: MouseEvent) => {
      if (swallowClick.value) {
        swallowClick.value = false
        event.preventDefault()
        return
      }
      if (!canEdit.value && !canSelect.value) return
      if (resolvedTool.value === 'select') {
        // pointerdown on a shape already selected it. This click bubbles to the
        // canvas; clearing here dropped the selection before Delete could enable.
        if (!isImageAnnotationShapeTarget(event.target)) selectAnnotation(null)
        return
      }
      if (!canEdit.value || resolvedTool.value !== 'polygon' || event.detail > 1) return
      const point = getPointFromEvent(event.clientX, event.clientY)
      drawing.value = drawing.value
        ? addImageAnnotationPolygonPoint(drawing.value, point)
        : startImageAnnotationDraw('polygon', point)
      draft.value = draftImageAnnotationFromDraw(drawing.value)
    }

    const removeAnnotation = (annotation: CoreImageAnnotation) => {
      if (!canEdit.value) return
      const next = annotations.value.filter((item) => item.id !== annotation.id)
      commitAnnotations(next, { type: 'remove', annotation })
      selectAnnotation(null)
    }

    const removeSelectedAnnotation = () => {
      if (!canEdit.value || !activeSelectedId.value) return
      const removed = annotations.value.find(
        (annotation) => annotation.id === activeSelectedId.value
      )
      if (removed) removeAnnotation(removed)
    }

    const isCanvasTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false
      if (target.closest('button')) return false
      return Boolean(target.closest('[data-tiger-annotation-stage]'))
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (drawing.value || draft.value) {
          event.preventDefault()
          event.stopPropagation()
          dragSession?.dispose()
          dragSession = null
          drawing.value = null
          draft.value = null
          drawingStroke.value = false
        }
        return
      }
      if (
        (event.key === 'ArrowRight' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp') &&
        isCanvasTarget(event.target) &&
        annotations.value.length > 0
      ) {
        event.preventDefault()
        const delta =
          event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? isRtl.value
              ? -1
              : 1
            : isRtl.value
              ? 1
              : -1
        const focused = clampImageAnnotationShapeIndex(focusedShape.value, annotations.value.length)
        const next = stepImageAnnotationShapeIndex(focused, annotations.value.length, delta)
        focusedShape.value = next
        shapeEls[next]?.focus()
        return
      }

      if (event.key === 'Enter' && isCanvasTarget(event.target)) {
        commitPolygon()
        return
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && isCanvasTarget(event.target)) {
        event.preventDefault()
        removeSelectedAnnotation()
      }
    }

    const handleToolbarKeyDown = (event: KeyboardEvent) => {
      const count = props.tools.length + 1
      const next = nextToolbarRovingIndex(toolIndex.value, count, event.key, isRtl.value)
      if (next === null) return
      event.preventDefault()
      toolIndex.value = next
      const buttons = (event.currentTarget as HTMLElement).querySelectorAll('button')
      buttons[next]?.focus()
      if (next < props.tools.length) setActiveTool(props.tools[next])
    }

    const renderAnnotation = (annotation: CoreImageAnnotation, isDraft = false) => {
      const selected = !isDraft && annotation.id === activeSelectedId.value
      const paint = getImageAnnotationShapePaint(annotation, selected, props.strokeWidth)
      const index = annotations.value.findIndex((item) => item.id === annotation.id)
      const paintAttrs = {
        stroke: paint.stroke,
        'stroke-width': paint.strokeWidth,
        fill: paint.fill,
        'fill-opacity': paint.fillOpacity,
        'stroke-linecap': paint.strokeLinecap,
        'stroke-linejoin': paint.strokeLinejoin
      }
      const width = displayWidth.value
      const height = displayHeight.value
      let geometry: ReturnType<typeof h>
      let hit: ReturnType<typeof h> | null = null

      if (annotation.type === 'rectangle') {
        geometry = h('rect', {
          ...paintAttrs,
          x: annotation.x * width,
          y: annotation.y * height,
          width: annotation.width * width,
          height: annotation.height * height
        })
      } else if (annotation.type === 'ellipse') {
        geometry = h('ellipse', {
          ...paintAttrs,
          cx: (annotation.x + annotation.width / 2) * width,
          cy: (annotation.y + annotation.height / 2) * height,
          rx: (annotation.width * width) / 2,
          ry: (annotation.height * height) / 2
        })
      } else {
        const d = getImageAnnotationPathData(annotation, width, height)
        geometry = h('path', {
          ...paintAttrs,
          d,
          ...(annotation.type === 'freehand' ? { 'pointer-events': 'none' } : {})
        })
        if (!isDraft && annotation.type === 'freehand') {
          hit = h('path', {
            d,
            fill: 'none',
            stroke: 'transparent',
            'stroke-width': paint.hitStrokeWidth,
            'stroke-linecap': paint.strokeLinecap,
            'stroke-linejoin': paint.strokeLinejoin,
            'pointer-events': 'stroke',
            'aria-hidden': 'true'
          })
        }
      }

      return h(
        'g',
        {
          key: annotation.id,
          role: 'option',
          tabindex: -1,
          ref: (node: unknown) => {
            if (!isDraft && index >= 0) shapeEls[index] = node as SVGElement | null
          },
          'aria-label': getImageAnnotationShapeAriaLabel(annotation, labels.value),
          'aria-selected': selected,
          'aria-disabled': props.disabled || undefined,
          class: classNames(!isDraft && !props.disabled && imageAnnotationShapeClasses),
          ...(isDraft ? {} : { 'data-tiger-annotation-shape': annotation.type }),
          onPointerdown: isDraft
            ? undefined
            : (event: PointerEvent) => {
                if (props.disabled) return
                if (canEdit.value && isImageAnnotationShapeTool(resolvedTool.value)) return
                event.stopPropagation()
                selectAnnotation(annotation)
                focusedShape.value = index
              },
          onKeydown: isDraft
            ? undefined
            : (event: KeyboardEvent) => {
                if (props.disabled) return
                if (
                  event.key === 'ArrowRight' ||
                  event.key === 'ArrowDown' ||
                  event.key === 'ArrowLeft' ||
                  event.key === 'ArrowUp'
                ) {
                  event.preventDefault()
                  const delta =
                    event.key === 'ArrowRight' || event.key === 'ArrowDown'
                      ? isRtl.value
                        ? -1
                        : 1
                      : isRtl.value
                        ? 1
                        : -1
                  const next = stepImageAnnotationShapeIndex(index, annotations.value.length, delta)
                  focusedShape.value = next
                  shapeEls[next]?.focus()
                  return
                }
                if (isActivationKey(event)) {
                  event.preventDefault()
                  event.stopPropagation()
                  selectAnnotation(annotation)
                  return
                }
                if (event.key === 'Delete' || event.key === 'Backspace') {
                  event.preventDefault()
                  event.stopPropagation()
                  removeAnnotation(annotation)
                }
              }
        },
        hit ? [geometry, hit] : [geometry]
      )
    }

    const containerClasses = computed(() =>
      classNames(
        imageAnnotationContainerClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const containerStyle = computed(() =>
      mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
    )

    const spinner = () =>
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
          h('path', { class: 'opacity-75', fill: 'currentColor', d: imageLoadingSpinnerPath })
        ]
      )

    const errorIcon = () =>
      h(
        'svg',
        {
          class: 'h-8 w-8',
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
            'stroke-width': '1.5',
            d: imageErrorIconPath
          })
        ]
      )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )
      const stageLabel =
        status.value === 'error'
          ? labels.value.loadAnnotationErrorAriaLabel
          : status.value === 'ready'
            ? labels.value.annotationEditorAriaLabel
            : labels.value.loadingAnnotationImageAriaLabel

      const toolbar = h(
        'div',
        {
          class: imageAnnotationToolbarClasses,
          role: 'toolbar',
          'aria-label': labels.value.annotationToolbarAriaLabel,
          onKeydown: handleToolbarKeyDown
        },
        [
          ...props.tools.map((item, index) =>
            h(
              'button',
              {
                key: item,
                type: 'button',
                class: getImageAnnotationToolButtonClasses(resolvedTool.value === item),
                disabled: props.disabled || props.readonly,
                'aria-pressed': resolvedTool.value === item,
                tabindex: index === toolIndex.value ? 0 : -1,
                onClick: () => {
                  toolIndex.value = index
                  setActiveTool(item)
                }
              },
              getImageAnnotationToolTypeLabel(item, labels.value)
            )
          ),
          h(
            'button',
            {
              type: 'button',
              class: imageAnnotationDeleteButtonClasses,
              disabled: !canEdit.value || !activeSelectedId.value,
              tabindex: toolIndex.value === props.tools.length ? 0 : -1,
              onClick: removeSelectedAnnotation
            },
            labels.value.deleteText
          )
        ]
      )

      const stageChildren =
        status.value !== 'ready'
          ? [
              h(
                'div',
                {
                  class: classNames(
                    'flex min-h-[200px] w-full items-center justify-center',
                    status.value === 'error' && imageErrorClasses
                  )
                },
                status.value === 'error'
                  ? [
                      errorIcon(),
                      h(
                        'p',
                        { class: 'text-sm text-[var(--tiger-text)]' },
                        labels.value.annotationLoadFailedText
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: getImageAnnotationToolButtonClasses(false),
                          onClick: () => {
                            loadAttempt.value += 1
                          }
                        },
                        labels.value.annotationRetryText
                      )
                    ]
                  : [spinner()]
              )
            ]
          : [
              h(
                'div',
                {
                  class: imageAnnotationFrameClasses,
                  style: getImageAnnotationFrameStyle(displayWidth.value, displayHeight.value),
                  'data-tiger-annotation-frame': ''
                },
                [
                  h('img', {
                    src: props.src,
                    alt: '',
                    'aria-hidden': 'true',
                    class: imageAnnotationImageClasses,
                    style: { width: '100%', height: '100%' },
                    draggable: false
                  }),
                  h(
                    'svg',
                    {
                      ref: overlayRef,
                      class: classNames(
                        imageAnnotationOverlayClasses,
                        (!canEdit.value || resolvedTool.value === 'select') &&
                          imageAnnotationReadonlyOverlayClasses,
                        props.disabled && 'pointer-events-none'
                      ),
                      width: '100%',
                      height: '100%',
                      preserveAspectRatio: imageAnnotationOverlayPreserveAspectRatio,
                      viewBox: getImageAnnotationViewBox(displayWidth.value, displayHeight.value),
                      tabindex: props.disabled ? -1 : 0,
                      role: 'listbox',
                      'aria-multiselectable': false,
                      'aria-label': `${labels.value.annotationCanvasAriaLabel}: ${imageAlt.value}`,
                      onPointerdown: handleStagePointerDown,
                      onClick: handleStageClick,
                      onDblclick: commitPolygon
                    },
                    [
                      ...annotations.value.map((annotation) => renderAnnotation(annotation)),
                      ...(draft.value ? [renderAnnotation(draft.value, true)] : []),
                      ...(props.showLabels
                        ? annotations.value
                            .filter((annotation) => annotation.label)
                            .map((annotation) => {
                              const center = getImageAnnotationCenter(
                                annotation,
                                displayWidth.value,
                                displayHeight.value
                              )
                              return h(
                                'text',
                                {
                                  key: `${annotation.id}-label`,
                                  x: center.x,
                                  y: center.y,
                                  textAnchor: 'middle',
                                  dominantBaseline: 'middle',
                                  fill: getImageAnnotationStrokeColor(annotation),
                                  'aria-hidden': 'true',
                                  class: imageAnnotationLabelClasses
                                },
                                annotation.label
                              )
                            })
                        : [])
                    ]
                  )
                ]
              )
            ]

      return h(
        'div',
        {
          ...forwardedAttrs,
          class: containerClasses.value,
          style: containerStyle.value,
          onKeydown: handleKeyDown
        },
        [
          props.bind
            ? h('div', { 'data-tiger-annotation-bind': '' }, [
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-nudge': '',
                    onClick: () => {
                      annotationHistory.value = pushAnnotationHistory(annotationHistory.value, [
                        annotationBox.value
                      ])
                      annotationBox.value = nudgeAnnotationBox(annotationBox.value, 'ArrowRight')
                    }
                  },
                  'nudge'
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-vertex': '',
                    onClick: () => {
                      polygon.value = movePolygonVertex(polygon.value, 0, { x: 0.5, y: 0.2 })
                    }
                  },
                  'vertex'
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-undo': '',
                    onClick: () => {
                      const undone = undoAnnotation(annotationHistory.value)
                      if (!undone) return
                      annotationHistory.value = undone.past
                      const restored = undone.annotations[0]
                      if (restored) annotationBox.value = restored
                    }
                  },
                  'undo'
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-annotation-export': '',
                    onClick: () => {
                      const canvas = document.createElement('canvas')
                      canvas.width = 32
                      canvas.height = 32
                      const context = canvas.getContext('2d')
                      if (context) {
                        context.fillRect(
                          annotationBox.value.x * 32,
                          annotationBox.value.y * 32,
                          annotationBox.value.width * 32,
                          annotationBox.value.height * 32
                        )
                      }
                      canvas.toBlob((blob) => {
                        annotationBlob.value = blob ? String(blob.size) : ''
                      })
                    }
                  },
                  'export'
                ),
                h(
                  'span',
                  { 'data-annotation-box': '' },
                  `${annotationBox.value.x},${annotationBox.value.y}`
                ),
                h('span', { 'data-annotation-vertex': '' }, String(polygon.value[0]?.x ?? '')),
                h('span', { 'data-annotation-blob': '' }, annotationBlob.value)
              ])
            : null,
          toolbar,
          h(
            'div',
            {
              ref: sizeHostRef,
              class: classNames(
                imageAnnotationStageClasses,
                drawingStroke.value && imageAnnotationDrawingClasses
              ),
              style: getImageAnnotationStageStyle(),
              'data-tiger-annotation-stage': '',
              role: 'group',
              'aria-label': stageLabel
            },
            stageChildren
          )
        ]
      )
    }
  }
})

export default ImageAnnotation
