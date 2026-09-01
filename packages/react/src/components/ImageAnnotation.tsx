import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  isActivationKey,
  addImageAnnotationPolygonPoint,
  clampImageAnnotationShapeIndex,
  commitImageAnnotationPolygon,
  createCropperImageLoader,
  createDocumentDragSession,
  createImageAnnotationId,
  defaultImageAnnotationTools,
  draftImageAnnotationFromDraw,
  finishImageAnnotationDraw,
  getAnnotationDisplaySize,
  getImageAnnotationCenter,
  getImageAnnotationPathData,
  getImageAnnotationPointFromClient,
  getImageAnnotationShapeAriaLabel,
  getImageAnnotationStrokeColor,
  getImageAnnotationToolButtonClasses,
  getImageAnnotationToolTypeLabel,
  getImageEditorLabels,
  getNextImageAnnotationTool,
  getPreviousImageAnnotationTool,
  imageAnnotationContainerClasses,
  imageAnnotationDeleteButtonClasses,
  imageAnnotationImageClasses,
  imageAnnotationLabelClasses,
  imageAnnotationOverlayClasses,
  imageAnnotationReadonlyOverlayClasses,
  imageAnnotationShapeClasses,
  imageAnnotationStageClasses,
  imageAnnotationToolbarClasses,
  imageErrorClasses,
  imageErrorIconPath,
  imageLoadingSpinnerClasses,
  imageLoadingSpinnerPath,
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
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

export interface ImageAnnotationProps
  extends
    Omit<CoreImageAnnotationProps, 'className' | 'value' | 'defaultValue'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreImageAnnotationProps | 'onChange'> {
  value?: CoreImageAnnotation[]
  defaultValue?: CoreImageAnnotation[]
  className?: string
  style?: React.CSSProperties
  onChange?: (annotations: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => void
  onSelect?: (annotation: CoreImageAnnotation | null) => void
  onToolChange?: (tool: ImageAnnotationTool) => void
  onReady?: () => void
  onError?: (error: Error) => void
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
  ...rest
}: ImageAnnotationProps): React.ReactElement {
  const config = useTigerConfig()
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
  const [focusedShape, setFocusedShape] = useState(0)
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
  }, [src])

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
    if (!annotation) return
    drawingRef.current = null
    setDraft(null)
    swallowClickRef.current = true
    commitAnnotation(annotation)
  }, [commitAnnotation, nextId])

  const handleStagePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0) return
      if (!canEdit || !isImageAnnotationShapeTool(resolvedTool) || resolvedTool === 'polygon') {
        return
      }

      event.preventDefault()
      const point = getPointFromEvent(event.clientX, event.clientY)
      drawingRef.current = startImageAnnotationDraw(resolvedTool, point)
      dragSessionRef.current?.dispose()
      const session = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget,
        dragThreshold: 0,
        onMove: (payload) => {
          const drawing = drawingRef.current
          if (!drawing) return
          const next = moveImageAnnotationDraw(
            drawing,
            getPointFromEvent(payload.currentX, payload.currentY)
          )
          drawingRef.current = next
          setDraft(draftImageAnnotationFromDraw(next))
        },
        onEnd: (payload) => {
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
          }
        }
      })
      dragSessionRef.current = session
    },
    [canEdit, commitAnnotation, getPointFromEvent, minSize, nextId, resolvedTool]
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
        selectAnnotation(null)
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
        drawingRef.current = null
        setDraft(null)
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
    [commitPolygon, removeSelectedAnnotation]
  )

  const handleToolbarKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const next =
          event.key === 'ArrowRight'
            ? getNextImageAnnotationTool(resolvedTool, tools)
            : getPreviousImageAnnotationTool(resolvedTool, tools)
        setActiveTool(next)
      }
    },
    [resolvedTool, setActiveTool, tools]
  )

  const renderAnnotation = useCallback(
    (annotation: CoreImageAnnotation, isDraft = false) => {
      const selected = !isDraft && annotation.id === activeSelectedId
      const stroke = getImageAnnotationStrokeColor(annotation)
      const index = annotations.findIndex((item) => item.id === annotation.id)
      const tabIndex = isDraft || disabled ? -1 : index === focusedShapeIndex ? 0 : -1
      const onKeyDown = (event: React.KeyboardEvent<SVGElement>) => {
        if (isDraft || disabled) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          setFocusedShape((current) => (current + 1) % Math.max(annotations.length, 1))
          return
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          setFocusedShape(
            (current) =>
              (current - 1 + Math.max(annotations.length, 1)) % Math.max(annotations.length, 1)
          )
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
      const commonProps = {
        stroke,
        strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
        fill: stroke,
        fillOpacity: annotation.type === 'freehand' ? 0 : selected ? 0.18 : 0.1,
        role: 'option' as const,
        tabIndex,
        'aria-label': getImageAnnotationShapeAriaLabel(annotation, labels),
        'aria-selected': selected,
        'aria-disabled': disabled || undefined,
        className: classNames(!isDraft && !disabled && imageAnnotationShapeClasses),
        onKeyDown: isDraft ? undefined : onKeyDown,
        onPointerDown: isDraft
          ? undefined
          : (event: React.PointerEvent<SVGElement>) => {
              if (disabled) return
              if (canEdit && isImageAnnotationShapeTool(resolvedTool)) return
              event.stopPropagation()
              selectAnnotation(annotation)
              setFocusedShape(index)
            }
      }

      if (annotation.type === 'rectangle') {
        return (
          <rect
            key={annotation.id}
            {...commonProps}
            x={annotation.x * displayWidth}
            y={annotation.y * displayHeight}
            width={annotation.width * displayWidth}
            height={annotation.height * displayHeight}
          />
        )
      }

      if (annotation.type === 'ellipse') {
        return (
          <ellipse
            key={annotation.id}
            {...commonProps}
            cx={(annotation.x + annotation.width / 2) * displayWidth}
            cy={(annotation.y + annotation.height / 2) * displayHeight}
            rx={(annotation.width * displayWidth) / 2}
            ry={(annotation.height * displayHeight) / 2}
          />
        )
      }

      const pathAnnotation = annotation as Extract<
        CoreImageAnnotation,
        { type: 'polygon' | 'freehand' }
      >

      return (
        <path
          key={annotation.id}
          {...commonProps}
          d={getImageAnnotationPathData(pathAnnotation, displayWidth, displayHeight)}
          fillOpacity={pathAnnotation.type === 'polygon' ? commonProps.fillOpacity : 0}
        />
      )
    },
    [
      activeSelectedId,
      annotations,
      canEdit,
      disabled,
      displayHeight,
      displayWidth,
      focusedShapeIndex,
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
      <div
        className={imageAnnotationToolbarClasses}
        role="toolbar"
        aria-label={labels.annotationToolbarAriaLabel}
        onKeyDown={handleToolbarKeyDown}>
        {tools.map((item) => (
          <button
            key={item}
            type="button"
            className={getImageAnnotationToolButtonClasses(resolvedTool === item)}
            disabled={disabled || readonly}
            aria-pressed={resolvedTool === item}
            onClick={() => setActiveTool(item)}>
            {getImageAnnotationToolTypeLabel(item, labels)}
          </button>
        ))}
        <button
          type="button"
          className={imageAnnotationDeleteButtonClasses}
          disabled={!canEdit || !activeSelectedId}
          onClick={removeSelectedAnnotation}>
          {labels.deleteText}
        </button>
      </div>

      <div
        ref={sizeHostRef}
        className={imageAnnotationStageClasses}
        data-tiger-annotation-stage=""
        role="group"
        aria-label={stageLabel}>
        {status !== 'ready' ? (
          <div
            className={classNames(
              'flex min-h-[200px] w-full items-center justify-center',
              status === 'error' && imageErrorClasses
            )}>
            {status === 'error' ? renderErrorIcon() : renderLoadingSpinner()}
          </div>
        ) : (
          <>
            <img
              src={src}
              alt={imageAlt}
              className={imageAnnotationImageClasses}
              style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
              draggable={false}
            />
            <svg
              ref={overlayRef}
              className={classNames(
                imageAnnotationOverlayClasses,
                (!canEdit || resolvedTool === 'select') && imageAnnotationReadonlyOverlayClasses,
                disabled && 'pointer-events-none'
              )}
              width={displayWidth}
              height={displayHeight}
              viewBox={`0 0 ${displayWidth} ${displayHeight}`}
              tabIndex={disabled ? -1 : 0}
              role="listbox"
              aria-multiselectable="false"
              aria-label={labels.annotationCanvasAriaLabel}
              onPointerDown={handleStagePointerDown}
              onClick={handleStageClick}
              onDoubleClick={commitPolygon}>
              {annotations.map((annotation) => renderAnnotation(annotation))}
              {draft ? renderAnnotation(draft, true) : null}
              {renderedLabels}
            </svg>
          </>
        )}
      </div>
    </div>
  )
}

ImageAnnotation.displayName = 'ImageAnnotation'
