import { classNames } from './class-names'
import { isPositiveFinite } from './image-utils'
import type { TigerLocaleImageEditor } from '../types/locale'
import type {
  ImageAnnotation,
  ImageAnnotationBox,
  ImageAnnotationPath,
  ImageAnnotationPoint,
  ImageAnnotationShape,
  ImageAnnotationTool
} from '../types/image-annotation'

export const imageAnnotationContainerClasses =
  'relative flex w-full max-w-full flex-col gap-3 text-[var(--tiger-text)]'

export const imageAnnotationStageClasses =
  'relative block w-full overflow-auto rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] select-none'

export const imageAnnotationDrawingClasses = 'touch-none'

/** Stage scrolls when the fitted image is taller than this cap. */
export const IMAGE_ANNOTATION_MAX_STAGE_HEIGHT = 480

export const imageAnnotationImageClasses = 'block max-w-full select-none pointer-events-none'

export const imageAnnotationOverlayClasses = 'absolute inset-0 cursor-crosshair'

export const imageAnnotationReadonlyOverlayClasses = 'cursor-default'

/**
 * Image frame that owns the overlay. The stage scrolls; the frame is the image.
 * An overlay pinned to the stage is only the scrollport, while the viewBox is the
 * whole image, so freehand points sampled from the CSS box land in the wrong place.
 */
export const imageAnnotationFrameClasses = 'relative'

/**
 * Inverse of {@link getImageAnnotationPointFromClient}: fractions of the SVG box
 * are fractions of the viewBox. The default `meet` letterboxes when those aspect
 * ratios differ and bends the stroke away from the pointer.
 */
export const imageAnnotationOverlayPreserveAspectRatio = 'none'

const IMAGE_ANNOTATION_FREEHAND_HIT_STROKE = 16

export const imageAnnotationToolbarClasses = 'flex flex-wrap items-center gap-2'

const annotationFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)] focus-visible:ring-offset-2'

export const imageAnnotationToolButtonClasses = `inline-flex items-center justify-center rounded-[var(--tiger-radius-sm)] border px-3 py-1.5 text-sm font-medium transition-colors ${annotationFocusRing} disabled:cursor-not-allowed disabled:opacity-50`

export const imageAnnotationDeleteButtonClasses = `inline-flex items-center justify-center rounded-[var(--tiger-radius-sm)] border border-[var(--tiger-error)] px-3 py-1.5 text-sm font-medium text-[var(--tiger-error)] transition-colors hover:bg-[var(--tiger-error-bg-hover)] ${annotationFocusRing} disabled:cursor-not-allowed disabled:opacity-50`

export const imageAnnotationLabelClasses = 'pointer-events-none select-none text-[11px] font-medium'

export const imageAnnotationShapeClasses = 'cursor-pointer outline-none focus-visible:outline-none'

export const defaultImageAnnotationTools: ImageAnnotationTool[] = [
  'select',
  'rectangle',
  'ellipse',
  'polygon',
  'freehand'
]

export const IMAGE_ANNOTATION_FREEHAND_MIN_DISTANCE = 0.01

export type ImageAnnotationLabels = Required<
  Pick<
    TigerLocaleImageEditor,
    | 'annotationShapeAriaLabel'
    | 'annotationLabeledShapeAriaLabel'
    | 'selectToolText'
    | 'rectangleToolText'
    | 'ellipseToolText'
    | 'polygonToolText'
    | 'freehandToolText'
  >
>

export function getImageAnnotationToolButtonClasses(active: boolean): string {
  return classNames(
    imageAnnotationToolButtonClasses,
    active
      ? 'border-[var(--tiger-primary)] bg-[var(--tiger-primary)] text-white'
      : 'border-[var(--tiger-border)] bg-[var(--tiger-annotation-tool-bg)] text-[var(--tiger-annotation-tool-text)] hover:bg-[var(--tiger-surface-muted)]'
  )
}

const ANNOTATION_COLOR =
  /^(?:#[0-9a-fA-F]{3,8}|var\(--tiger-[a-z0-9-]+\)|[a-zA-Z]+|rgba?\([^)]+\)|hsla?\([^)]+\))$/

const ANNOTATION_TOKEN = /^(?:primary|success|warning|error|info|text|border)$/

/** A theme token or a validated color. Anything else falls back to the primary token. */
export function getImageAnnotationStrokeColor(annotation: ImageAnnotation): string {
  const color = annotation.color?.trim()
  if (!color) return 'var(--tiger-primary)'
  if (ANNOTATION_TOKEN.test(color)) return `var(--tiger-${color})`
  if (ANNOTATION_COLOR.test(color) && !/url\(|expression\(|;|javascript:/i.test(color)) return color
  return 'var(--tiger-primary)'
}

export function stepImageAnnotationShapeIndex(
  current: number,
  count: number,
  delta: number
): number {
  if (count <= 0) return -1
  const base = current < 0 || current >= count ? 0 : current
  return (base + delta + count) % count
}

export function createAnnotationFrameCoalescer<T>(apply: (value: T) => void): {
  push: (value: T) => void
  flush: () => void
  cancel: () => void
} {
  let frame = 0
  let pending: T | undefined
  let has = false
  const run = () => {
    frame = 0
    if (!has) return
    has = false
    apply(pending as T)
  }
  return {
    push(value) {
      pending = value
      has = true
      if (frame) return
      const schedule =
        typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame
          : (callback: FrameRequestCallback) => {
              callback(0)
              return 0
            }
      frame = schedule(run)
    },
    flush() {
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      run()
    },
    cancel() {
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      frame = 0
      has = false
    }
  }
}

export function clampImageAnnotationUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 1)
}

export function clampImageAnnotationPoint(point: ImageAnnotationPoint): ImageAnnotationPoint {
  return {
    x: clampImageAnnotationUnit(point.x),
    y: clampImageAnnotationUnit(point.y)
  }
}

export function getImageAnnotationPointFromClient(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
): ImageAnnotationPoint {
  if (bounds.width <= 0 || bounds.height <= 0) return { x: 0, y: 0 }

  return clampImageAnnotationPoint({
    x: (clientX - bounds.left) / bounds.width,
    y: (clientY - bounds.top) / bounds.height
  })
}

export function normalizeImageAnnotationBox(
  start: ImageAnnotationPoint,
  end: ImageAnnotationPoint
): Pick<ImageAnnotationBox, 'x' | 'y' | 'width' | 'height'> {
  const a = clampImageAnnotationPoint(start)
  const b = clampImageAnnotationPoint(end)
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)

  return {
    x,
    y,
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y)
  }
}

export function shouldCommitImageAnnotationBox(
  box: Pick<ImageAnnotationBox, 'width' | 'height'>,
  minSize = 0.01
): boolean {
  return box.width >= minSize && box.height >= minSize
}

export function createImageAnnotationBox(
  type: 'rectangle' | 'ellipse',
  id: string,
  start: ImageAnnotationPoint,
  end: ImageAnnotationPoint,
  options: Pick<ImageAnnotation, 'label' | 'color'> = {}
): ImageAnnotationBox {
  return {
    id,
    type,
    ...normalizeImageAnnotationBox(start, end),
    ...options
  }
}

export function createImageAnnotationPath(
  type: 'polygon' | 'freehand',
  id: string,
  points: ImageAnnotationPoint[],
  options: Pick<ImageAnnotation, 'label' | 'color'> = {}
): ImageAnnotationPath {
  return {
    id,
    type,
    points: points.map(clampImageAnnotationPoint),
    ...options
  }
}

/** Polygon and freehand. Box types stay out so path geometry is not fed a rectangle. */
export function isImageAnnotationPath(
  annotation: ImageAnnotation
): annotation is ImageAnnotationPath {
  return annotation.type === 'polygon' || annotation.type === 'freehand'
}

export function isImageAnnotationPathClosed(annotation: ImageAnnotationPath): boolean {
  return annotation.type === 'polygon' && annotation.points.length >= 3
}

export function getImageAnnotationPathData(
  annotation: Extract<ImageAnnotation, { type: 'polygon' | 'freehand' }>,
  width: number,
  height: number
): string {
  if (annotation.points.length === 0) return ''

  const [first, ...rest] = annotation.points
  const parts = [`M ${first.x * width} ${first.y * height}`]
  rest.forEach((point) => {
    parts.push(`L ${point.x * width} ${point.y * height}`)
  })
  if (isImageAnnotationPathClosed(annotation)) parts.push('Z')

  return parts.join(' ')
}

export function getImageAnnotationCenter(
  annotation: ImageAnnotation,
  width: number,
  height: number
): ImageAnnotationPoint {
  if (annotation.type === 'rectangle' || annotation.type === 'ellipse') {
    return {
      x: (annotation.x + annotation.width / 2) * width,
      y: (annotation.y + annotation.height / 2) * height
    }
  }

  if (!isImageAnnotationPath(annotation) || annotation.points.length === 0) {
    return { x: 0, y: 0 }
  }

  const total = annotation.points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  )

  return {
    x: (total.x / annotation.points.length) * width,
    y: (total.y / annotation.points.length) * height
  }
}

export function getImageAnnotationToolTypeLabel(
  tool: ImageAnnotationTool,
  labels: ImageAnnotationLabels
): string {
  switch (tool) {
    case 'select':
      return labels.selectToolText
    case 'rectangle':
      return labels.rectangleToolText
    case 'ellipse':
      return labels.ellipseToolText
    case 'polygon':
      return labels.polygonToolText
    case 'freehand':
      return labels.freehandToolText
  }
}

export function getImageAnnotationShapeAriaLabel(
  annotation: ImageAnnotation,
  labels: ImageAnnotationLabels
): string {
  const type = getImageAnnotationToolTypeLabel(annotation.type, labels)
  if (annotation.label) {
    return labels.annotationLabeledShapeAriaLabel
      .replace('{label}', annotation.label)
      .replace('{type}', type)
  }
  return labels.annotationShapeAriaLabel.replace('{type}', type)
}

export function getNextImageAnnotationTool(
  current: ImageAnnotationTool,
  tools: ImageAnnotationTool[] = defaultImageAnnotationTools
): ImageAnnotationTool {
  const index = tools.indexOf(current)
  if (index === -1) return tools[0] ?? 'select'
  return tools[(index + 1) % tools.length] ?? 'select'
}

export function getPreviousImageAnnotationTool(
  current: ImageAnnotationTool,
  tools: ImageAnnotationTool[] = defaultImageAnnotationTools
): ImageAnnotationTool {
  const index = tools.indexOf(current)
  if (index === -1) return tools[0] ?? 'select'
  return tools[(index - 1 + tools.length) % tools.length] ?? 'select'
}

export function isImageAnnotationShapeTool(
  tool: ImageAnnotationTool
): tool is ImageAnnotationShape {
  return tool !== 'select'
}

export function resolveImageAnnotationTool(
  tool: ImageAnnotationTool | undefined,
  tools: ImageAnnotationTool[]
): ImageAnnotationTool {
  if (tools.length === 0) return 'select'
  if (tool && tools.includes(tool)) return tool
  return tools[0] ?? 'select'
}

export function createImageAnnotationId(shape: string, existingIds: Iterable<string>): string {
  const used = new Set(existingIds)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    let id = `${shape}-${crypto.randomUUID()}`
    while (used.has(id)) id = `${shape}-${crypto.randomUUID()}`
    return id
  }
  const prefix = `${shape}-`
  let seed = 1
  for (const id of used) {
    if (!id.startsWith(prefix)) continue
    const parsed = Number(id.slice(prefix.length))
    if (Number.isInteger(parsed) && parsed >= seed) seed = parsed + 1
  }
  while (used.has(`${prefix}${seed}`)) seed += 1
  return `${prefix}${seed}`
}

export function getAnnotationDisplaySize(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number
): { width: number; height: number } | null {
  if (!isPositiveFinite(naturalWidth) || !isPositiveFinite(naturalHeight)) return null
  const width = isPositiveFinite(containerWidth) ? containerWidth : naturalWidth
  const height = naturalHeight * (width / naturalWidth)
  if (!isPositiveFinite(width) || !isPositiveFinite(height)) return null
  return { width, height }
}

export function getImageAnnotationStageStyle(): { maxHeight: string } {
  return { maxHeight: `${IMAGE_ANNOTATION_MAX_STAGE_HEIGHT}px` }
}

export function getImageAnnotationFrameStyle(
  width: number,
  height: number
): { width: string; height: string } {
  return { width: `${width}px`, height: `${height}px` }
}

export function getImageAnnotationViewBox(width: number, height: number): string {
  return `0 0 ${width} ${height}`
}

export interface ImageAnnotationShapePaint {
  stroke: string
  strokeWidth: number
  fill: string
  fillOpacity: number
  strokeLinecap: 'round' | 'butt'
  strokeLinejoin: 'round' | 'miter'
  /** Pointer target in viewBox units. Wider than the ink for an open freehand stroke. */
  hitStrokeWidth: number
}

/**
 * Freehand is an open pen stroke. Filling it closes the path back to the start,
 * which is the self-intersecting blob. Boxes and polygons stay translucent fills.
 */
export function getImageAnnotationShapePaint(
  annotation: ImageAnnotation,
  selected: boolean,
  strokeWidth: number
): ImageAnnotationShapePaint {
  const stroke = getImageAnnotationStrokeColor(annotation)
  const width = selected ? strokeWidth + 1 : strokeWidth
  if (annotation.type === 'freehand') {
    const pen = Number.isFinite(width) && width > 0 ? width : 2
    return {
      stroke,
      strokeWidth: pen,
      fill: 'none',
      fillOpacity: 0,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      hitStrokeWidth: Math.max(pen, IMAGE_ANNOTATION_FREEHAND_HIT_STROKE)
    }
  }
  return {
    stroke,
    strokeWidth: width,
    fill: stroke,
    fillOpacity: selected ? 0.18 : 0.1,
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    hitStrokeWidth: width
  }
}

const IMAGE_ANNOTATION_SHAPE_SELECTOR = '[data-tiger-annotation-shape]'

/** True when the event target is a committed shape (or a node inside one). */
export function isImageAnnotationShapeTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false
  return Boolean(target.closest(IMAGE_ANNOTATION_SHAPE_SELECTOR))
}

export interface ImageAnnotationDrawState {
  tool: ImageAnnotationShape
  start: ImageAnnotationPoint
  points: ImageAnnotationPoint[]
}

export function startImageAnnotationDraw(
  tool: ImageAnnotationShape,
  point: ImageAnnotationPoint
): ImageAnnotationDrawState {
  const start = clampImageAnnotationPoint(point)
  return { tool, start, points: [start] }
}

export function moveImageAnnotationDraw(
  state: ImageAnnotationDrawState,
  point: ImageAnnotationPoint,
  minDistance = IMAGE_ANNOTATION_FREEHAND_MIN_DISTANCE
): ImageAnnotationDrawState {
  const nextPoint = clampImageAnnotationPoint(point)
  if (state.tool !== 'freehand') {
    return { ...state, points: [state.start, nextPoint] }
  }
  const last = state.points[state.points.length - 1]
  if (last && Math.hypot(nextPoint.x - last.x, nextPoint.y - last.y) < minDistance) {
    return state
  }
  return { ...state, points: [...state.points, nextPoint] }
}

export function draftImageAnnotationFromDraw(
  state: ImageAnnotationDrawState
): ImageAnnotation | null {
  if (state.tool === 'rectangle' || state.tool === 'ellipse') {
    const end = state.points[state.points.length - 1] ?? state.start
    return createImageAnnotationBox(state.tool, 'draft', state.start, end)
  }
  return createImageAnnotationPath(state.tool, 'draft', state.points)
}

export function finishImageAnnotationDraw(
  state: ImageAnnotationDrawState,
  end: ImageAnnotationPoint,
  id: string,
  minSize = 0.01
): ImageAnnotation | null {
  if (state.tool === 'rectangle' || state.tool === 'ellipse') {
    const annotation = createImageAnnotationBox(state.tool, id, state.start, end)
    return shouldCommitImageAnnotationBox(annotation, minSize) ? annotation : null
  }
  if (state.tool === 'freehand') {
    const moved = moveImageAnnotationDraw(state, end, 0)
    if (!shouldCommitImageAnnotationPath(moved.points, minSize)) return null
    return createImageAnnotationPath('freehand', id, moved.points)
  }
  return null
}

export function addImageAnnotationPolygonPoint(
  state: ImageAnnotationDrawState,
  point: ImageAnnotationPoint
): ImageAnnotationDrawState {
  const nextPoint = clampImageAnnotationPoint(point)
  const last = state.points[state.points.length - 1]
  if (last && last.x === nextPoint.x && last.y === nextPoint.y) return state
  return { ...state, points: [...state.points, nextPoint] }
}

export function commitImageAnnotationPolygon(
  state: ImageAnnotationDrawState,
  id: string
): ImageAnnotation | null {
  if (state.tool !== 'polygon' || state.points.length < 3) return null
  return createImageAnnotationPath('polygon', id, state.points)
}

export function shouldCommitImageAnnotationPath(
  points: ImageAnnotationPoint[],
  minSize = 0.01
): boolean {
  if (points.length < 2) return false
  let length = 0
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1]
    const next = points[i]
    length += Math.hypot(next.x - prev.x, next.y - prev.y)
  }
  if (length >= minSize) return true
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  return (
    Math.max(...xs) - Math.min(...xs) >= minSize && Math.max(...ys) - Math.min(...ys) >= minSize
  )
}

export function clampImageAnnotationShapeIndex(index: number, count: number): number {
  if (count <= 0) return -1
  if (index >= 0 && index < count) return index
  return 0
}
