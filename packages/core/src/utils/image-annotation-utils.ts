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
  'relative flex w-full max-w-full flex-col gap-3 text-[var(--tiger-text,#111827)]'

export const imageAnnotationStageClasses =
  'relative block w-full overflow-hidden rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-surface-muted,#f3f4f6)] select-none touch-none'

export const imageAnnotationImageClasses = 'block max-w-full select-none pointer-events-none'

export const imageAnnotationOverlayClasses = 'absolute inset-0 cursor-crosshair'

export const imageAnnotationReadonlyOverlayClasses = 'cursor-default'

export const imageAnnotationToolbarClasses = 'flex flex-wrap items-center gap-2'

const annotationFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-offset-2'

export const imageAnnotationToolButtonClasses = `inline-flex items-center justify-center rounded-[var(--tiger-radius-sm,0.375rem)] border px-3 py-1.5 text-sm font-medium transition-colors ${annotationFocusRing} disabled:cursor-not-allowed disabled:opacity-50`

export const imageAnnotationDeleteButtonClasses = `inline-flex items-center justify-center rounded-[var(--tiger-radius-sm,0.375rem)] border border-[var(--tiger-error,#dc2626)] px-3 py-1.5 text-sm font-medium text-[var(--tiger-error,#dc2626)] transition-colors hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] ${annotationFocusRing} disabled:cursor-not-allowed disabled:opacity-50`

export const imageAnnotationLabelClasses =
  'pointer-events-none select-none fill-white text-[11px] font-medium drop-shadow'

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
      ? 'border-[var(--tiger-primary,#2563eb)] bg-[var(--tiger-primary,#2563eb)] text-white'
      : 'border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-annotation-tool-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-annotation-tool-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-surface-muted,#f3f4f6)]'
  )
}

export function getImageAnnotationStrokeColor(annotation: ImageAnnotation): string {
  return annotation.color ?? 'var(--tiger-primary,#2563eb)'
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

  const pathAnnotation = annotation as ImageAnnotationPath

  if (pathAnnotation.points.length === 0) return { x: 0, y: 0 }

  const total = pathAnnotation.points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  )

  return {
    x: (total.x / pathAnnotation.points.length) * width,
    y: (total.y / pathAnnotation.points.length) * height
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
