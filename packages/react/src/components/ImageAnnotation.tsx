import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  movePolygonVertex,
  nudgeAnnotationBox,
  pushAnnotationHistory,
  undoAnnotation,
  isActivationKey,
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
  moveImageAnnotationDraw,
  resolveImageAnnotationTool,
  startImageAnnotationDraw,
  type DocumentDragSession,
  type ImageAnnotation as CoreImageAnnotation,
  type ImageAnnotationChangeMeta,
  type ImageAnnotationProps as CoreImageAnnotationProps,
  type ImageAnnotationTool
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { useControlledState } from '../hooks/useControlledState'

export interface ImageAnnotationProps
  extends
    Omit<CoreImageAnnotationProps, 'className' | 'value' | 'defaultValue'>,
    Omit<
      React.ComponentPropsWithoutRef<'div'>,
      keyof CoreImageAnnotationProps | 'onChange' | 'onError' | 'onSelect'
    > {
  value?: CoreImageAnnotation[]
  defaultValue?: CoreImageAnnotation[]
  className?: string
  style?: React.CSSProperties
  onChange?: (annotations: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => void
  onSelect?: (annotation: CoreImageAnnotation | null) => void
  onToolChange?: (tool: ImageAnnotationTool) => void
  onReady?: () => void
  onError?: (error: Error) => void
  bind?: boolean
}

type LoadStatus = 'loading' | 'ready' | 'error'

function renderErrorIcon(): React.ReactNode {
  return (
    <svg
      className="h-8 w-8"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={imageErrorIconPath} />
    </svg>
  )
}

function renderLoadingSpinner(): React.ReactNode {
  return (
    <svg
      className={imageLoadingSpinnerClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path className="opacity-75" fill="currentColor" d={imageLoadingSpinnerPath} />
    </svg>
  )
}

export function ImageAnnotation({
  locale,
  src,
  alt,
  value,
  defaultValue = [],
  selectedId,
  defaultSelectedId,
  tool,
  defaultTool = 'select',
  tools = defaultImageAnnotationTools,
  disabled = false,
  readonly = false,
  minSize = 0.01,
  strokeWidth = 2,
  showLabels = true,
  className,
  style,
  onChange,
  onSelect,
  onToolChange,
  onReady,
  onError,
  bind = false,
  ...rest
}: ImageAnnotationProps): React.ReactElement {
  const config = useTigerConfig()
  const [annotationBox, setAnnotationBox] = useState({ x: 0.2, y: 0.2, width: 0.3, height: 0.2 })
  const [polygon, setPolygon] = useState([
    { x: 0.1, y: 0.1 },
    { x: 0.4, y: 0.1 },
    { x: 0.2, y: 0.4 }
  ])
  const [annotationHistory, setAnnotationHistory] = useState<
    { annotations: { x: number; y: number; width: number; height: number }[] }[]
  >([])
  const [annotationBlob, setAnnotationBlob] = useState('')
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getImageEditorLabels(mergedLocale), [mergedLocale])
  const sizeHostRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const drawingRef = useRef<ReturnType<typeof startImageAnnotationDraw> | null>(null)
  const dragSessionRef = useRef<DocumentDragSession | null>(null)
  const swallowClickRef = useRef(false)
  const naturalRef = useRef({ w: 0, h: 0 })
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)
  const loaderRef = useRef(createCropperImageLoader())
  onReadyRef.current = onReady
  onErrorRef.current = onError
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [displayWidth, setDisplayWidth] = useState(0)
  const [displayHeight, setDisplayHeight] = useState(0)
  const [annotations, setAnnotations] = useControlledState<
    CoreImageAnnotation[],
    [ImageAnnotationChangeMeta]
  >({
    value,
    defaultValue,
    onChange
  })
  const [activeSelectedId, setSelectedId] = useControlledState<string | undefined>({
    value: selectedId,
    defaultValue: defaultSelectedId
  })
  const [activeTool, setActiveToolState] = useControlledState({
    value: tool,
    defaultValue: defaultTool,
    onChange: onToolChange
  })
  const [draft, setDraft] = useState<CoreImageAnnotation | null>(null)
  const [drawingStroke, setDrawingStroke] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [focusedShape, setFocusedShape] = useState(0)
  const [toolIndex, setToolIndex] = useState(0)
  const shapeRefs = useRef<Array<SVGElement | null>>([])
  const liveRef = useRef<ReturnType<typeof manageLiveRegion> | null>(null)
  const isRtl = mergedLocale?.direction === 'rtl'
  const resolvedTool = resolveImageAnnotationTool(activeTool, tools)
  const canEdit = !disabled && !readonly
  const canSelect = !disabled
  const imageAlt = alt ?? labels.defaultAnnotationAlt
  const focusedShapeIndex = clampImageAnnotationShapeIndex(focusedShape, annotations.length)

  useEffect(() => {
    const loader = loaderRef.current
    setStatus('loading')
    setDraft(null)
    drawingRef.current = null
    loader.load(src, {
      onLoad: (_image, naturalWidth, naturalHeight) => {
        naturalRef.current = { w: naturalWidth, h: naturalHeight }
        const size = getAnnotationDisplaySize(
          naturalWidth,
          naturalHeight,
          sizeHostRef.current?.clientWidth ?? 0
        )
        if (!size) {
          setStatus('error')
          onErrorRef.current?.(new Error('Image not loaded'))
          return
        }
        setDisplayWidth(size.width)
        setDisplayHeight(size.height)
        setStatus('ready')
        onReadyRef.current?.()
      },
      onError: () => {
        setStatus('error')
        onErrorRef.current?.(new Error('Image not loaded'))
      }
    })
    return () => loader.dispose()
  }, [src, loadAttempt])

  useEffect(() => {
    const region = manageLiveRegion('polite')
    liveRef.current = region
    return () => {
      region.destroy()
      liveRef.current = null
    }
  }, [])

  useEffect(() => {
    const host = sizeHostRef.current
    if (!host || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      const { w, h } = naturalRef.current
      const size = getAnnotationDisplaySize(w, h, host.clientWidth)
      if (!size) return
      setDisplayWidth(size.width)
      setDisplayHeight(size.height)
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [status])

  useEffect(() => () => dragSessionRef.current?.dispose(), [])

  const commitAnnotations = useCallback(
    (next: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => {
      setAnnotations(next, meta)
    },
    [setAnnotations]
  )

  const selectAnnotation = useCallback(
    (annotation: CoreImageAnnotation | null) => {
      if (!canSelect) return
      setSelectedId(annotation?.id)
      onSelect?.(annotation)
    },
    [canSelect, onSelect, setSelectedId]
  )

  const setActiveTool = useCallback(
    (nextTool: ImageAnnotationTool) => {
      if (nextTool === resolvedTool) {
        setActiveToolState(nextTool)
        return
      }
      setDraft(null)
      drawingRef.current = null
      setActiveToolState(nextTool)
    },
    [resolvedTool, setActiveToolState]
  )

  const getPointFromEvent = useCallback((clientX: number, clientY: number) => {
    const bounds = overlayRef.current?.getBoundingClientRect()
    if (!bounds) return { x: 0, y: 0 }
    return getImageAnnotationPointFromClient(clientX, clientY, bounds)
  }, [])

  const commitAnnotation = useCallback(
    (annotation: CoreImageAnnotation) => {
      const next = [...annotations, annotation]
      commitAnnotations(next, { type: 'add', annotation })
      selectAnnotation(annotation)
    },
    [annotations, commitAnnotations, selectAnnotation]
  )

  const nextId = useCallback(
    (shape: string) =>
      createImageAnnotationId(
        shape,
        annotations.map((item) => item.id)
      ),
    [annotations]
  )

  const commitPolygon = useCallback(() => {
    const drawing = drawingRef.current
    if (!drawing) return
    const annotation = commitImageAnnotationPolygon(drawing, nextId('polygon'))
    drawingRef.current = null
    setDraft(null)
    if (!annotation) {
      liveRef.current?.announce(labels.annotationPolygonIncompleteText)
      return
    }
    swallowClickRef.current = true
    commitAnnotation(annotation)
  }, [commitAnnotation, labels.annotationPolygonIncompleteText, nextId])

  const handleStagePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0) return
      if (!canEdit || !isImageAnnotationShapeTool(resolvedTool) || resolvedTool === 'polygon') {
        return
      }

      event.preventDefault()
      const point = getPointFromEvent(event.clientX, event.clientY)
      drawingRef.current = startImageAnnotationDraw(resolvedTool, point)
      setDrawingStroke(true)
      dragSessionRef.current?.dispose()
      const frames = createAnnotationFrameCoalescer(
        (payload: { currentX: number; currentY: number }) => {
          const drawing = drawingRef.current
          if (!drawing) return
          const next = moveImageAnnotationDraw(
            drawing,
            getPointFromEvent(payload.currentX, payload.currentY)
          )
          drawingRef.current = next
          setDraft(draftImageAnnotationFromDraw(next))
        }
      )
      const session = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget,
        dragThreshold: 0,
        onMove: (payload) => {
          frames.push(payload)
        },
        onEnd: (payload) => {
          frames.cancel()
          setDrawingStroke(false)
          const drawing = drawingRef.current
          drawingRef.current = null
          dragSessionRef.current = null
          if (!drawing || payload.cancelled) {
            setDraft(null)
            return
          }
          const annotation = finishImageAnnotationDraw(
            drawing,
            getPointFromEvent(payload.currentX, payload.currentY),
            nextId(drawing.tool),
            minSize
          )
          setDraft(null)
          if (annotation) {
            swallowClickRef.current = true
            commitAnnotation(annotation)
            return
          }
          liveRef.current?.announce(labels.annotationTooSmallText)
        }
      })
      dragSessionRef.current = session
    },
    [
      canEdit,
      commitAnnotation,
      getPointFromEvent,
      labels.annotationTooSmallText,
      minSize,
      nextId,
      resolvedTool
    ]
  )

  const handleStageClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (swallowClickRef.current) {
        swallowClickRef.current = false
        event.preventDefault()
        return
      }
      if (!canEdit && !canSelect) return
      if (resolvedTool === 'select') {
        // pointerdown on a shape already selected it. This click bubbles to the
        // canvas; clearing here dropped the selection before Delete could enable.
        if (!isImageAnnotationShapeTarget(event.target)) selectAnnotation(null)
        return
      }
      if (!canEdit || resolvedTool !== 'polygon' || event.detail > 1) return
      const point = getPointFromEvent(event.clientX, event.clientY)
      const drawing = drawingRef.current
      const next = drawing
        ? addImageAnnotationPolygonPoint(drawing, point)
        : startImageAnnotationDraw('polygon', point)
      drawingRef.current = next
      setDraft(draftImageAnnotationFromDraw(next))
    },
    [canEdit, canSelect, getPointFromEvent, resolvedTool, selectAnnotation]
  )

  const removeAnnotation = useCallback(
    (annotation: CoreImageAnnotation) => {
      if (!canEdit) return
      const next = annotations.filter((item) => item.id !== annotation.id)
      commitAnnotations(next, { type: 'remove', annotation })
      selectAnnotation(null)
    },
    [annotations, canEdit, commitAnnotations, selectAnnotation]
  )

  const removeSelectedAnnotation = useCallback(() => {
    if (!canEdit || !activeSelectedId) return
    const removed = annotations.find((annotation) => annotation.id === activeSelectedId)
    if (removed) removeAnnotation(removed)
  }, [activeSelectedId, annotations, canEdit, removeAnnotation])

  const isCanvasTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false
    if (target.closest('button')) return false
    return Boolean(target.closest('[data-tiger-annotation-stage]'))
  }

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (drawingRef.current || draft) {
          event.preventDefault()
          event.stopPropagation()
          dragSessionRef.current?.dispose()
          dragSessionRef.current = null
          drawingRef.current = null
          setDraft(null)
          setDrawingStroke(false)
        }
        return
      }
      if (
        (event.key === 'ArrowRight' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp') &&
        isCanvasTarget(event.target) &&
        annotations.length > 0
      ) {
        event.preventDefault()
        const delta =
          event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? isRtl
              ? -1
              : 1
            : isRtl
              ? 1
              : -1
        const next = stepImageAnnotationShapeIndex(focusedShapeIndex, annotations.length, delta)
        setFocusedShape(next)
        shapeRefs.current[next]?.focus()
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
    },
    [annotations.length, commitPolygon, draft, focusedShapeIndex, isRtl, removeSelectedAnnotation]
  )

  const handleToolbarKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const count = tools.length + 1
      const next = nextToolbarRovingIndex(toolIndex, count, event.key, isRtl)
      if (next === null) return
      event.preventDefault()
      setToolIndex(next)
      const buttons = event.currentTarget.querySelectorAll('button')
      buttons[next]?.focus()
      if (next < tools.length) setActiveTool(tools[next])
    },
    [isRtl, setActiveTool, toolIndex, tools]
  )

  const renderAnnotation = useCallback(
    (annotation: CoreImageAnnotation, isDraft = false) => {
      const selected = !isDraft && annotation.id === activeSelectedId
      const paint = getImageAnnotationShapePaint(annotation, selected, strokeWidth)
      const index = annotations.findIndex((item) => item.id === annotation.id)
      const paintProps = {
        stroke: paint.stroke,
        strokeWidth: paint.strokeWidth,
        fill: paint.fill,
        fillOpacity: paint.fillOpacity,
        strokeLinecap: paint.strokeLinecap,
        strokeLinejoin: paint.strokeLinejoin
      }
      const onKeyDown = (event: React.KeyboardEvent<SVGElement>) => {
        if (isDraft || disabled) return
        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp'
        ) {
          event.preventDefault()
          const delta =
            event.key === 'ArrowRight' || event.key === 'ArrowDown'
              ? isRtl
                ? -1
                : 1
              : isRtl
                ? 1
                : -1
          const next = stepImageAnnotationShapeIndex(index, annotations.length, delta)
          setFocusedShape(next)
          shapeRefs.current[next]?.focus()
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

      let geometry: React.ReactNode
      let hit: React.ReactNode = null
      if (annotation.type === 'rectangle') {
        geometry = (
          <rect
            {...paintProps}
            x={annotation.x * displayWidth}
            y={annotation.y * displayHeight}
            width={annotation.width * displayWidth}
            height={annotation.height * displayHeight}
          />
        )
      } else if (annotation.type === 'ellipse') {
        geometry = (
          <ellipse
            {...paintProps}
            cx={(annotation.x + annotation.width / 2) * displayWidth}
            cy={(annotation.y + annotation.height / 2) * displayHeight}
            rx={(annotation.width * displayWidth) / 2}
            ry={(annotation.height * displayHeight) / 2}
          />
        )
      } else {
        const d = getImageAnnotationPathData(annotation, displayWidth, displayHeight)
        geometry = (
          <path
            {...paintProps}
            d={d}
            pointerEvents={annotation.type === 'freehand' ? 'none' : undefined}
          />
        )
        if (!isDraft && annotation.type === 'freehand') {
          hit = (
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={paint.hitStrokeWidth}
              strokeLinecap={paint.strokeLinecap}
              strokeLinejoin={paint.strokeLinejoin}
              pointerEvents="stroke"
              aria-hidden="true"
            />
          )
        }
      }

      return (
        <g
          key={annotation.id}
          role="option"
          tabIndex={-1}
          aria-label={getImageAnnotationShapeAriaLabel(annotation, labels)}
          aria-selected={selected}
          aria-disabled={disabled || undefined}
          ref={(node: SVGElement | null) => {
            if (!isDraft && index >= 0) shapeRefs.current[index] = node
          }}
          className={classNames(!isDraft && !disabled && imageAnnotationShapeClasses)}
          {...(isDraft ? {} : { 'data-tiger-annotation-shape': annotation.type })}
          onKeyDown={isDraft ? undefined : onKeyDown}
          onPointerDown={
            isDraft
              ? undefined
              : (event: React.PointerEvent<SVGElement>) => {
                  if (disabled) return
                  if (canEdit && isImageAnnotationShapeTool(resolvedTool)) return
                  event.stopPropagation()
                  selectAnnotation(annotation)
                  setFocusedShape(index)
                }
          }>
          {geometry}
          {hit}
        </g>
      )
    },
    [
      activeSelectedId,
      annotations,
      canEdit,
      disabled,
      displayHeight,
      displayWidth,
      isRtl,
      labels,
      removeAnnotation,
      resolvedTool,
      selectAnnotation,
      strokeWidth
    ]
  )

  const renderedLabels = showLabels
    ? annotations
        .filter((annotation) => annotation.label)
        .map((annotation) => {
          const center = getImageAnnotationCenter(annotation, displayWidth, displayHeight)
          return (
            <text
              key={`${annotation.id}-label`}
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={getImageAnnotationStrokeColor(annotation)}
              aria-hidden="true"
              className={imageAnnotationLabelClasses}>
              {annotation.label}
            </text>
          )
        })
    : null

  const containerClasses = classNames(imageAnnotationContainerClasses, className)
  const stageLabel =
    status === 'error'
      ? labels.loadAnnotationErrorAriaLabel
      : status === 'ready'
        ? labels.annotationEditorAriaLabel
        : labels.loadingAnnotationImageAriaLabel

  return (
    <div {...rest} className={containerClasses} style={style} onKeyDown={handleKeyDown}>
      {bind ? (
        <div data-tiger-annotation-bind="">
          <button
            type="button"
            data-tiger-nudge=""
            onClick={() => {
              setAnnotationHistory((past) => pushAnnotationHistory(past, [annotationBox]))
              setAnnotationBox(nudgeAnnotationBox(annotationBox, 'ArrowRight'))
            }}>
            nudge
          </button>
          <button
            type="button"
            data-tiger-vertex=""
            onClick={() => setPolygon(movePolygonVertex(polygon, 0, { x: 0.5, y: 0.2 }))}>
            vertex
          </button>
          <button
            type="button"
            data-tiger-undo=""
            onClick={() => {
              const undone = undoAnnotation(annotationHistory)
              if (!undone) return
              setAnnotationHistory(undone.past)
              const restored = undone.annotations[0]
              if (restored) setAnnotationBox(restored)
            }}>
            undo
          </button>
          <button
            type="button"
            data-tiger-annotation-export=""
            onClick={() => {
              const canvas = document.createElement('canvas')
              canvas.width = 32
              canvas.height = 32
              const context = canvas.getContext('2d')
              if (context) {
                context.fillRect(
                  annotationBox.x * 32,
                  annotationBox.y * 32,
                  annotationBox.width * 32,
                  annotationBox.height * 32
                )
              }
              canvas.toBlob((blob) => setAnnotationBlob(blob ? String(blob.size) : ''))
            }}>
            export
          </button>
          <span data-annotation-box="">{`${annotationBox.x},${annotationBox.y}`}</span>
          <span data-annotation-vertex="">{String(polygon[0]?.x ?? '')}</span>
          <span data-annotation-blob="">{annotationBlob}</span>
        </div>
      ) : null}
      <div
        className={imageAnnotationToolbarClasses}
        role="toolbar"
        aria-label={labels.annotationToolbarAriaLabel}
        onKeyDown={handleToolbarKeyDown}>
        {tools.map((item, index) => (
          <button
            key={item}
            type="button"
            className={getImageAnnotationToolButtonClasses(resolvedTool === item)}
            disabled={disabled || readonly}
            aria-pressed={resolvedTool === item}
            tabIndex={index === toolIndex ? 0 : -1}
            onClick={() => {
              setToolIndex(index)
              setActiveTool(item)
            }}>
            {getImageAnnotationToolTypeLabel(item, labels)}
          </button>
        ))}
        <button
          type="button"
          className={imageAnnotationDeleteButtonClasses}
          disabled={!canEdit || !activeSelectedId}
          tabIndex={toolIndex === tools.length ? 0 : -1}
          onClick={removeSelectedAnnotation}>
          {labels.deleteText}
        </button>
      </div>

      <div
        ref={sizeHostRef}
        className={classNames(
          imageAnnotationStageClasses,
          drawingStroke && imageAnnotationDrawingClasses
        )}
        style={getImageAnnotationStageStyle()}
        data-tiger-annotation-stage=""
        role="group"
        aria-label={stageLabel}>
        {status !== 'ready' ? (
          <div
            className={classNames(
              'flex min-h-[200px] w-full items-center justify-center',
              status === 'error' && imageErrorClasses
            )}>
            {status === 'error' ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-[var(--tiger-text)]">
                {renderErrorIcon()}
                <p>{labels.annotationLoadFailedText}</p>
                <button
                  type="button"
                  className={getImageAnnotationToolButtonClasses(false)}
                  onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                  {labels.annotationRetryText}
                </button>
              </div>
            ) : (
              renderLoadingSpinner()
            )}
          </div>
        ) : (
          <div
            className={imageAnnotationFrameClasses}
            style={getImageAnnotationFrameStyle(displayWidth, displayHeight)}
            data-tiger-annotation-frame="">
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className={imageAnnotationImageClasses}
              style={{ width: '100%', height: '100%' }}
              draggable={false}
            />
            <svg
              ref={overlayRef}
              className={classNames(
                imageAnnotationOverlayClasses,
                (!canEdit || resolvedTool === 'select') && imageAnnotationReadonlyOverlayClasses,
                disabled && 'pointer-events-none'
              )}
              width="100%"
              height="100%"
              preserveAspectRatio={imageAnnotationOverlayPreserveAspectRatio}
              viewBox={getImageAnnotationViewBox(displayWidth, displayHeight)}
              tabIndex={disabled ? -1 : 0}
              role="listbox"
              aria-multiselectable="false"
              aria-label={`${labels.annotationCanvasAriaLabel}: ${imageAlt}`}
              onPointerDown={handleStagePointerDown}
              onClick={handleStageClick}
              onDoubleClick={commitPolygon}>
              {annotations.map((annotation) => renderAnnotation(annotation))}
              {draft ? renderAnnotation(draft, true) : null}
              {renderedLabels}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

ImageAnnotation.displayName = 'ImageAnnotation'
