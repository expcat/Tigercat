import { computed, defineComponent, h, onMounted, PropType, ref, watch } from 'vue'
import {
  classNames,
  coerceClassValue,
  createImageAnnotationBox,
  createImageAnnotationPath,
  defaultImageAnnotationTools,
  getImageAnnotationCenter,
  getImageAnnotationPathData,
  getImageAnnotationPointFromClient,
  getImageAnnotationShapeAriaLabel,
  getImageAnnotationStrokeColor,
  getImageAnnotationToolButtonClasses,
  getImageEditorLabels,
  imageAnnotationContainerClasses,
  imageAnnotationDeleteButtonClasses,
  imageAnnotationImageClasses,
  imageAnnotationLabelClasses,
  imageAnnotationOverlayClasses,
  imageAnnotationReadonlyOverlayClasses,
  imageAnnotationStageClasses,
  imageAnnotationToolbarClasses,
  isBrowser,
  mergeTigerLocale,
  mergeStyleValues,
  shouldCommitImageAnnotationBox,
  type ImageAnnotation as CoreImageAnnotation,
  type ImageAnnotationChangeMeta,
  type ImageAnnotationPoint,
  type ImageAnnotationTool,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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

interface DrawingState {
  tool: Exclude<ImageAnnotationTool, 'select'>
  start: ImageAnnotationPoint
  points: ImageAnnotationPoint[]
}

export const ImageAnnotation = defineComponent({
  name: 'TigerImageAnnotation',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    src: { type: String, required: true },
    alt: { type: String, default: 'Image to annotate' },
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
  emits: ['update:modelValue', 'change', 'select', 'tool-change', 'ready'],
  setup(props, { attrs, emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageEditorLabels(mergedLocale.value))
    const toolLabels = computed<Record<ImageAnnotationTool, string>>(() => ({
      select: labels.value.selectToolText,
      rectangle: labels.value.rectangleToolText,
      ellipse: labels.value.ellipseToolText,
      polygon: labels.value.polygonToolText,
      freehand: labels.value.freehandToolText
    }))
    const containerRef = ref<HTMLElement | null>(null)
    const overlayRef = ref<SVGSVGElement | null>(null)
    const idSeed = ref(0)
    const imageLoaded = ref(false)
    const displayWidth = ref(0)
    const displayHeight = ref(0)
    const innerAnnotations = ref<CoreImageAnnotation[]>(props.defaultValue)
    const innerSelectedId = ref<string | undefined>(props.defaultSelectedId)
    const innerTool = ref<ImageAnnotationTool>(props.defaultTool)
    const draft = ref<CoreImageAnnotation | null>(null)
    const drawing = ref<DrawingState | null>(null)

    const annotations = computed(() => props.modelValue ?? innerAnnotations.value)
    const activeSelectedId = computed(() => props.selectedId ?? innerSelectedId.value)
    const activeTool = computed(() => props.tool ?? innerTool.value)
    const canEdit = computed(() => !props.disabled && !props.readonly)

    const loadImage = () => {
      imageLoaded.value = false
      draft.value = null
      if (!isBrowser() || typeof window.Image !== 'function') return

      const img = new window.Image()
      img.onload = () => {
        const naturalWidth = img.naturalWidth || 1
        const naturalHeight = img.naturalHeight || 1
        const containerWidth = containerRef.value?.clientWidth || naturalWidth
        const containerHeight = containerRef.value?.clientHeight || naturalHeight
        const ratio = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight, 1)

        displayWidth.value = naturalWidth * ratio
        displayHeight.value = naturalHeight * ratio
        imageLoaded.value = true
        emit('ready')
      }
      img.src = props.src
    }

    onMounted(loadImage)
    watch(() => props.src, loadImage)

    const commitAnnotations = (next: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => {
      if (props.modelValue === undefined) innerAnnotations.value = next
      emit('update:modelValue', next)
      emit('change', next, meta)
    }

    const selectAnnotation = (annotation: CoreImageAnnotation | null) => {
      if (props.selectedId === undefined) innerSelectedId.value = annotation?.id
      emit('select', annotation)
    }

    const setActiveTool = (nextTool: ImageAnnotationTool) => {
      draft.value = null
      drawing.value = null
      if (props.tool === undefined) innerTool.value = nextTool
      emit('tool-change', nextTool)
    }

    const createId = (shape: string) => {
      idSeed.value += 1
      return `${shape}-${idSeed.value}`
    }

    const getPointFromEvent = (event: MouseEvent): ImageAnnotationPoint => {
      const bounds = overlayRef.value?.getBoundingClientRect()
      if (!bounds) return { x: 0, y: 0 }
      return getImageAnnotationPointFromClient(event.clientX, event.clientY, bounds)
    }

    const commitAnnotation = (annotation: CoreImageAnnotation) => {
      commitAnnotations([...annotations.value, annotation], { type: 'add', annotation })
      selectAnnotation(annotation)
    }

    const commitPolygon = () => {
      if (!drawing.value || drawing.value.tool !== 'polygon' || drawing.value.points.length < 3) {
        return
      }

      const annotation = createImageAnnotationPath(
        'polygon',
        createId('polygon'),
        drawing.value.points
      )
      drawing.value = null
      draft.value = null
      commitAnnotation(annotation)
    }

    const handleStageMouseDown = (event: MouseEvent) => {
      if (!canEdit.value || activeTool.value === 'select' || activeTool.value === 'polygon') return

      const point = getPointFromEvent(event)
      drawing.value = { tool: activeTool.value, start: point, points: [point] }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!drawing.value) return
        const nextPoint = getPointFromEvent(moveEvent)

        if (drawing.value.tool === 'rectangle' || drawing.value.tool === 'ellipse') {
          draft.value = createImageAnnotationBox(
            drawing.value.tool,
            'draft',
            drawing.value.start,
            nextPoint
          )
          return
        }

        const nextPoints = [...drawing.value.points, nextPoint]
        drawing.value = { ...drawing.value, points: nextPoints }
        draft.value = createImageAnnotationPath('freehand', 'draft', nextPoints)
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        const current = drawing.value
        drawing.value = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        if (!current) return
        const end = getPointFromEvent(upEvent)

        if (current.tool === 'rectangle' || current.tool === 'ellipse') {
          const annotation = createImageAnnotationBox(
            current.tool,
            createId(current.tool),
            current.start,
            end
          )
          draft.value = null
          if (shouldCommitImageAnnotationBox(annotation, props.minSize))
            commitAnnotation(annotation)
          return
        }

        const points = [...current.points, end]
        draft.value = null
        if (points.length >= 2) {
          commitAnnotation(createImageAnnotationPath('freehand', createId('freehand'), points))
        }
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleStageClick = (event: MouseEvent) => {
      if (!canEdit.value || activeTool.value !== 'polygon') return

      const point = getPointFromEvent(event)
      const points = drawing.value?.tool === 'polygon' ? [...drawing.value.points, point] : [point]
      drawing.value = { tool: 'polygon', start: points[0], points }
      draft.value = createImageAnnotationPath('polygon', 'draft', points)
    }

    const removeSelectedAnnotation = () => {
      if (!canEdit.value || !activeSelectedId.value) return
      const removed = annotations.value.find(
        (annotation) => annotation.id === activeSelectedId.value
      )
      const next = annotations.value.filter(
        (annotation) => annotation.id !== activeSelectedId.value
      )
      commitAnnotations(next, { type: 'remove', annotation: removed })
      selectAnnotation(null)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        drawing.value = null
        draft.value = null
        return
      }

      if (event.key === 'Enter') {
        commitPolygon()
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        removeSelectedAnnotation()
      }
    }

    const renderAnnotation = (annotation: CoreImageAnnotation, isDraft = false) => {
      const selected = !isDraft && annotation.id === activeSelectedId.value
      const stroke = getImageAnnotationStrokeColor(annotation)
      const fillOpacity = annotation.type === 'freehand' ? 0 : selected ? 0.18 : 0.1
      const commonProps: Record<string, unknown> = {
        stroke,
        strokeWidth: selected ? props.strokeWidth + 1 : props.strokeWidth,
        fill: stroke,
        fillOpacity,
        role: 'button',
        tabindex: isDraft ? -1 : 0,
        'aria-label': getImageAnnotationShapeAriaLabel(annotation),
        class: classNames(!isDraft && 'cursor-pointer focus:outline-none'),
        onClick: (event: MouseEvent) => {
          if (isDraft) return
          event.stopPropagation()
          selectAnnotation(annotation)
        }
      }

      if (annotation.type === 'rectangle') {
        return h('rect', {
          ...commonProps,
          key: annotation.id,
          x: annotation.x * displayWidth.value,
          y: annotation.y * displayHeight.value,
          width: annotation.width * displayWidth.value,
          height: annotation.height * displayHeight.value
        })
      }

      if (annotation.type === 'ellipse') {
        return h('ellipse', {
          ...commonProps,
          key: annotation.id,
          cx: (annotation.x + annotation.width / 2) * displayWidth.value,
          cy: (annotation.y + annotation.height / 2) * displayHeight.value,
          rx: (annotation.width * displayWidth.value) / 2,
          ry: (annotation.height * displayHeight.value) / 2
        })
      }

      const pathAnnotation = annotation as Extract<
        CoreImageAnnotation,
        { type: 'polygon' | 'freehand' }
      >

      return h('path', {
        ...commonProps,
        key: annotation.id,
        d: getImageAnnotationPathData(pathAnnotation, displayWidth.value, displayHeight.value),
        fillOpacity: pathAnnotation.type === 'polygon' ? fillOpacity : 0
      })
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

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      const toolbar = h(
        'div',
        {
          class: imageAnnotationToolbarClasses,
          'aria-label': labels.value.annotationToolbarAriaLabel
        },
        [
          ...props.tools.map((item) =>
            h(
              'button',
              {
                key: item,
                type: 'button',
                class: getImageAnnotationToolButtonClasses(activeTool.value === item),
                disabled: props.disabled || props.readonly,
                'aria-pressed': activeTool.value === item,
                onClick: () => setActiveTool(item)
              },
              toolLabels.value[item]
            )
          ),
          h(
            'button',
            {
              type: 'button',
              class: imageAnnotationDeleteButtonClasses,
              disabled: !canEdit.value || !activeSelectedId.value,
              onClick: removeSelectedAnnotation
            },
            labels.value.deleteText
          )
        ]
      )

      const stageChildren = !imageLoaded.value
        ? [
            h('div', { class: 'flex min-h-[200px] min-w-[240px] items-center justify-center' }, [
              h('div', {
                class:
                  'h-8 w-8 animate-spin rounded-full border-2 border-[var(--tiger-border,#d1d5db)] border-t-[var(--tiger-primary,#2563eb)]'
              })
            ])
          ]
        : [
            h('img', {
              src: props.src,
              alt: props.alt,
              class: imageAnnotationImageClasses,
              style: { width: `${displayWidth.value}px`, height: `${displayHeight.value}px` },
              draggable: false
            }),
            h(
              'svg',
              {
                ref: overlayRef,
                class: classNames(
                  imageAnnotationOverlayClasses,
                  (!canEdit.value || activeTool.value === 'select') &&
                    imageAnnotationReadonlyOverlayClasses
                ),
                width: displayWidth.value,
                height: displayHeight.value,
                viewBox: `0 0 ${displayWidth.value} ${displayHeight.value}`,
                'aria-label': labels.value.annotationCanvasAriaLabel,
                onMousedown: handleStageMouseDown,
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
                            class: imageAnnotationLabelClasses
                          },
                          annotation.label
                        )
                      })
                  : [])
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
          toolbar,
          h(
            'div',
            {
              ref: containerRef,
              class: imageAnnotationStageClasses,
              style: imageLoaded.value ? { width: `${displayWidth.value}px` } : undefined,
              role: imageLoaded.value ? 'application' : 'img',
              'aria-label': imageLoaded.value
                ? labels.value.annotationEditorAriaLabel
                : labels.value.loadingAnnotationImageAriaLabel
            },
            stageChildren
          )
        ]
      )
    }
  }
})

export default ImageAnnotation
