import { classNames } from './class-names'
import type {
  ImageAnnotation,
  ImageAnnotationBox,
  ImageAnnotationPath,
  ImageAnnotationPoint,
  ImageAnnotationShape,
  ImageAnnotationTool
} from '../types/image-annotation'

export const imageAnnotationContainerClasses =
  'relative inline-flex max-w-full flex-col gap-3 text-[var(--tiger-text,#111827)]'

export const imageAnnotationStageClasses =
  'relative inline-block overflow-hidden rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg-muted,#f3f4f6)] select-none touch-none'

export const imageAnnotationImageClasses = 'block max-w-full select-none pointer-events-none'

export const imageAnnotationOverlayClasses = 'absolute inset-0 cursor-crosshair'

export const imageAnnotationReadonlyOverlayClasses = 'cursor-default'

export const imageAnnotationToolbarClasses = 'flex flex-wrap items-center gap-2'

export const imageAnnotationToolButtonClasses =
  'inline-flex items-center justify-center rounded-[var(--tiger-radius-sm,0.375rem)] border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export const imageAnnotationDeleteButtonClasses =
  'inline-flex items-center justify-center rounded-[var(--tiger-radius-sm,0.375rem)] border border-[var(--tiger-danger,#dc2626)] px-3 py-1.5 text-sm font-medium text-[var(--tiger-danger,#dc2626)] transition-colors hover:bg-[var(--tiger-danger-bg,#fef2f2)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-danger,#dc2626)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export const imageAnnotationLabelClasses =
  'pointer-events-none select-none fill-[var(--tiger-bg,#ffffff)] text-[11px] font-medium drop-shadow'

export const defaultImageAnnotationTools: ImageAnnotationTool[] = [
  'select',
  'rectangle',
  'ellipse',
  'polygon',
  'freehand'
]

const toolLabels: Record<ImageAnnotationTool, string> = {
  select: 'Select',
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  polygon: 'Polygon',
  freehand: 'Freehand'
}

export function getImageAnnotationToolLabel(tool: ImageAnnotationTool): string {
  return toolLabels[tool]
}

export function getImageAnnotationToolButtonClasses(active: boolean): string {
  return classNames(
    imageAnnotationToolButtonClasses,
    active
      ? 'border-[var(--tiger-primary,#2563eb)] bg-[var(--tiger-primary,#2563eb)] text-white'
      : 'border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#ffffff)] text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-bg-muted,#f3f4f6)]'
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

export function getImageAnnotationShapeAriaLabel(annotation: ImageAnnotation): string {
  const label = annotation.label ? `${annotation.label}, ` : ''
  return `${label}${annotation.type} annotation`
}

export function getNextImageAnnotationTool(
  current: ImageAnnotationTool,
  tools: ImageAnnotationTool[] = defaultImageAnnotationTools
): ImageAnnotationTool {
  const index = tools.indexOf(current)
  if (index === -1) return tools[0] ?? 'select'
  return tools[(index + 1) % tools.length] ?? 'select'
}

export function isImageAnnotationShapeTool(
  tool: ImageAnnotationTool
): tool is ImageAnnotationShape {
  return tool !== 'select'
}
