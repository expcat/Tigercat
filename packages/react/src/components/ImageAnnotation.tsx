import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  isActivationKey,
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
  shouldCommitImageAnnotationBox,
  mergeTigerLocale,
  type ImageAnnotation as CoreImageAnnotation,
  type ImageAnnotationChangeMeta,
  type ImageAnnotationPoint,
  type ImageAnnotationProps as CoreImageAnnotationProps,
  type ImageAnnotationTool
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface ImageAnnotationProps extends Omit<
  CoreImageAnnotationProps,
  'className' | 'value' | 'defaultValue'
> {
  value?: CoreImageAnnotation[]
  defaultValue?: CoreImageAnnotation[]
  className?: string
  style?: React.CSSProperties
  onChange?: (annotations: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => void
  onSelect?: (annotation: CoreImageAnnotation | null) => void
  onToolChange?: (tool: ImageAnnotationTool) => void
  onReady?: () => void
}

interface DrawingState {
  tool: Exclude<ImageAnnotationTool, 'select'>
  start: ImageAnnotationPoint
  points: ImageAnnotationPoint[]
}

export function ImageAnnotation({
  locale,
  src,
  alt = 'Image to annotate',
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
  onReady
}: ImageAnnotationProps): React.ReactElement {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getImageEditorLabels(mergedLocale), [mergedLocale])
  const toolLabels = useMemo<Record<ImageAnnotationTool, string>>(
    () => ({
      select: labels.selectToolText,
      rectangle: labels.rectangleToolText,
      ellipse: labels.ellipseToolText,
      polygon: labels.polygonToolText,
      freehand: labels.freehandToolText
    }),
    [labels]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const idSeedRef = useRef(0)
  const drawingRef = useRef<DrawingState | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [displayWidth, setDisplayWidth] = useState(0)
  const [displayHeight, setDisplayHeight] = useState(0)
  const [innerAnnotations, setInnerAnnotations] = useState(defaultValue)
  const [innerSelectedId, setInnerSelectedId] = useState(defaultSelectedId)
  const [innerTool, setInnerTool] = useState<ImageAnnotationTool>(defaultTool)
  const [draft, setDraft] = useState<CoreImageAnnotation | null>(null)

  const annotations = value ?? innerAnnotations
  const activeSelectedId = selectedId ?? innerSelectedId
  const activeTool = tool ?? innerTool
  const canEdit = !disabled && !readonly

  useEffect(() => {
    setImageLoaded(false)
    setDraft(null)
    if (typeof window === 'undefined' || typeof window.Image !== 'function') return

    const img = new window.Image()
    img.onload = () => {
      const container = containerRef.current
      const naturalWidth = img.naturalWidth || 1
      const naturalHeight = img.naturalHeight || 1
      const containerWidth = container?.clientWidth || naturalWidth
      const containerHeight = container?.clientHeight || naturalHeight
      const ratio = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight, 1)

      setDisplayWidth(naturalWidth * ratio)
      setDisplayHeight(naturalHeight * ratio)
      setImageLoaded(true)
      onReady?.()
    }
    img.src = src
  }, [src, onReady])

  const commitAnnotations = useCallback(
    (next: CoreImageAnnotation[], meta: ImageAnnotationChangeMeta) => {
      if (value === undefined) setInnerAnnotations(next)
      onChange?.(next, meta)
    },
    [onChange, value]
  )

  const selectAnnotation = useCallback(
    (annotation: CoreImageAnnotation | null) => {
      if (selectedId === undefined) setInnerSelectedId(annotation?.id)
      onSelect?.(annotation)
    },
    [onSelect, selectedId]
  )

  const setActiveTool = useCallback(
    (nextTool: ImageAnnotationTool) => {
      setDraft(null)
      drawingRef.current = null
      if (tool === undefined) setInnerTool(nextTool)
      onToolChange?.(nextTool)
    },
    [onToolChange, tool]
  )

  const createId = useCallback((shape: string) => {
    idSeedRef.current += 1
    return `${shape}-${idSeedRef.current}`
  }, [])

  const getPointFromEvent = useCallback((event: MouseEvent | React.MouseEvent) => {
    const bounds = overlayRef.current?.getBoundingClientRect()
    if (!bounds) return { x: 0, y: 0 }
    return getImageAnnotationPointFromClient(event.clientX, event.clientY, bounds)
  }, [])

  const commitAnnotation = useCallback(
    (annotation: CoreImageAnnotation) => {
      const next = [...annotations, annotation]
      commitAnnotations(next, { type: 'add', annotation })
      selectAnnotation(annotation)
    },
    [annotations, commitAnnotations, selectAnnotation]
  )

  const commitPolygon = useCallback(() => {
    const drawing = drawingRef.current
    if (!drawing || drawing.tool !== 'polygon' || drawing.points.length < 3) return

    const annotation = createImageAnnotationPath('polygon', createId('polygon'), drawing.points)
    drawingRef.current = null
    setDraft(null)
    commitAnnotation(annotation)
  }, [commitAnnotation, createId])

  const handleStageMouseDown = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!canEdit || activeTool === 'select' || activeTool === 'polygon') return

      const point = getPointFromEvent(event)
      drawingRef.current = { tool: activeTool, start: point, points: [point] }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const drawing = drawingRef.current
        if (!drawing) return
        const nextPoint = getPointFromEvent(moveEvent)

        if (drawing.tool === 'rectangle' || drawing.tool === 'ellipse') {
          setDraft(createImageAnnotationBox(drawing.tool, 'draft', drawing.start, nextPoint))
          return
        }

        const nextPoints = [...drawing.points, nextPoint]
        drawingRef.current = { ...drawing, points: nextPoints }
        setDraft(createImageAnnotationPath('freehand', 'draft', nextPoints))
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        const drawing = drawingRef.current
        drawingRef.current = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        if (!drawing) return
        const end = getPointFromEvent(upEvent)

        if (drawing.tool === 'rectangle' || drawing.tool === 'ellipse') {
          const annotation = createImageAnnotationBox(
            drawing.tool,
            createId(drawing.tool),
            drawing.start,
            end
          )
          setDraft(null)
          if (shouldCommitImageAnnotationBox(annotation, minSize)) commitAnnotation(annotation)
          return
        }

        const points = [...drawing.points, end]
        setDraft(null)
        if (points.length >= 2)
          commitAnnotation(createImageAnnotationPath('freehand', createId('freehand'), points))
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [activeTool, canEdit, commitAnnotation, createId, getPointFromEvent, minSize]
  )

  const handleStageClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!canEdit || activeTool !== 'polygon') return

      const point = getPointFromEvent(event)
      const drawing = drawingRef.current
      const points = drawing?.tool === 'polygon' ? [...drawing.points, point] : [point]
      drawingRef.current = { tool: 'polygon', start: points[0], points }
      setDraft(createImageAnnotationPath('polygon', 'draft', points))
    },
    [activeTool, canEdit, getPointFromEvent]
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        drawingRef.current = null
        setDraft(null)
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
    },
    [commitPolygon, removeSelectedAnnotation]
  )

  const renderAnnotation = useCallback(
    (annotation: CoreImageAnnotation, isDraft = false) => {
      const selected = !isDraft && annotation.id === activeSelectedId
      const stroke = getImageAnnotationStrokeColor(annotation)
      // SVG `role="button"` elements do not fire click on Enter/Space natively,
      // so wire keyboard activation (select) and Delete/Backspace (remove) here.
      const onKeyDown = (event: React.KeyboardEvent<SVGElement>) => {
        if (isDraft) return
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
        role: 'button',
        tabIndex: isDraft ? -1 : 0,
        'aria-label': getImageAnnotationShapeAriaLabel(annotation),
        className: classNames(!isDraft && 'cursor-pointer focus:outline-none'),
        onKeyDown: isDraft ? undefined : onKeyDown
      }
      const onClick = (event: React.MouseEvent<SVGElement>) => {
        if (isDraft) return
        event.stopPropagation()
        selectAnnotation(annotation)
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
            onClick={onClick}
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
            onClick={onClick}
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
          onClick={onClick}
        />
      )
    },
    [activeSelectedId, displayHeight, displayWidth, selectAnnotation, strokeWidth]
  )

  const renderedAnnotations = useMemo(
    () => annotations.map((annotation) => renderAnnotation(annotation)),
    [annotations, renderAnnotation]
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

  return (
    <div className={containerClasses} style={style} onKeyDown={handleKeyDown}>
      <div className={imageAnnotationToolbarClasses} aria-label={labels.annotationToolbarAriaLabel}>
        {tools.map((item) => (
          <button
            key={item}
            type="button"
            className={getImageAnnotationToolButtonClasses(activeTool === item)}
            disabled={disabled || readonly}
            aria-pressed={activeTool === item}
            onClick={() => setActiveTool(item)}>
            {toolLabels[item]}
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
        ref={containerRef}
        className={imageAnnotationStageClasses}
        style={{ width: imageLoaded ? `${displayWidth}px` : undefined }}
        role={imageLoaded ? 'application' : 'img'}
        aria-label={
          imageLoaded ? labels.annotationEditorAriaLabel : labels.loadingAnnotationImageAriaLabel
        }>
        {!imageLoaded ? (
          <div className="flex min-h-[200px] min-w-[240px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--tiger-border,#d1d5db)] border-t-[var(--tiger-primary,#2563eb)]" />
          </div>
        ) : (
          <>
            <img
              src={src}
              alt={alt}
              className={imageAnnotationImageClasses}
              style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
              draggable={false}
            />
            <svg
              ref={overlayRef}
              className={classNames(
                imageAnnotationOverlayClasses,
                (!canEdit || activeTool === 'select') && imageAnnotationReadonlyOverlayClasses
              )}
              width={displayWidth}
              height={displayHeight}
              viewBox={`0 0 ${displayWidth} ${displayHeight}`}
              aria-label={labels.annotationCanvasAriaLabel}
              onMouseDown={handleStageMouseDown}
              onClick={handleStageClick}
              onDoubleClick={commitPolygon}>
              {renderedAnnotations}
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
