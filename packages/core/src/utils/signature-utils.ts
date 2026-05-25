import type { SignatureExportType, SignaturePoint, SignatureStroke } from '../types/signature'
import { classNames } from './class-names'

export interface SignatureCanvasRect {
  left: number
  top: number
  width: number
  height: number
}

export interface SignatureExportOptions {
  width: number
  height: number
  backgroundColor?: string
}

export const signatureRootClasses = 'inline-flex w-full flex-col gap-2'

export const signatureCanvasWrapClasses =
  'relative overflow-hidden rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-signature-border,var(--tiger-border,#d1d5db))] bg-[var(--tiger-signature-bg,var(--tiger-surface,#ffffff))]'

export const signatureCanvasClasses =
  'block touch-none outline-none focus:ring-2 focus:ring-[var(--tiger-signature-ring,var(--tiger-primary,#2563eb))]/30'

export const signatureToolbarClasses = 'flex items-center justify-end gap-2'

export const signatureClearButtonClasses =
  'inline-flex items-center rounded-[var(--tiger-radius-sm,0.375rem)] border border-[var(--tiger-signature-button-border,var(--tiger-border,#d1d5db))] px-3 py-1.5 text-sm text-[var(--tiger-signature-button-text,var(--tiger-text,#111827))] transition-colors hover:bg-[var(--tiger-signature-button-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))] disabled:cursor-not-allowed disabled:opacity-50'

export function getSignatureCanvasWrapClasses(disabled = false, readonly = false): string {
  return classNames(
    signatureCanvasWrapClasses,
    disabled && 'opacity-60',
    disabled || readonly ? 'cursor-not-allowed' : 'cursor-crosshair'
  )
}

export function clampSignatureLineWidth(lineWidth: number | undefined): number {
  if (!Number.isFinite(lineWidth)) return 2
  return Math.max(1, Math.min(24, Number(lineWidth)))
}

export function getSignaturePoint(
  clientX: number,
  clientY: number,
  rect: SignatureCanvasRect,
  width: number,
  height: number,
  time = Date.now()
): SignaturePoint {
  const scaleX = rect.width > 0 ? width / rect.width : 1
  const scaleY = rect.height > 0 ? height / rect.height : 1

  return {
    x: Math.max(0, Math.min(width, (clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(height, (clientY - rect.top) * scaleY)),
    time
  }
}

export function isSignatureEmpty(strokes: readonly SignatureStroke[] = []): boolean {
  return strokes.every((stroke) => stroke.points.length === 0)
}

export function cloneSignatureStrokes(strokes: readonly SignatureStroke[]): SignatureStroke[] {
  return strokes.map((stroke) => ({
    color: stroke.color,
    lineWidth: stroke.lineWidth,
    points: stroke.points.map((point) => ({ ...point }))
  }))
}

function escapeSvgAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function pointToPath(point: SignaturePoint): string {
  return `${Number(point.x.toFixed(2))} ${Number(point.y.toFixed(2))}`
}

export function signatureStrokeToPath(stroke: SignatureStroke): string {
  if (stroke.points.length === 0) return ''
  const [first, ...rest] = stroke.points
  return [`M ${pointToPath(first)}`, ...rest.map((point) => `L ${pointToPath(point)}`)].join(' ')
}

export function signatureStrokesToSvg(
  strokes: readonly SignatureStroke[],
  options: SignatureExportOptions
): string {
  const background = options.backgroundColor
    ? `<rect width="100%" height="100%" fill="${escapeSvgAttribute(options.backgroundColor)}"/>`
    : ''
  const paths = strokes
    .map((stroke) => {
      const d = signatureStrokeToPath(stroke)
      if (!d) return ''
      return `<path d="${d}" fill="none" stroke="${escapeSvgAttribute(stroke.color)}" stroke-width="${stroke.lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}">${background}${paths}</svg>`
}

export function signatureSvgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function drawSignatureStrokes(
  context: CanvasRenderingContext2D,
  strokes: readonly SignatureStroke[],
  options: SignatureExportOptions
): void {
  context.clearRect(0, 0, options.width, options.height)

  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor
    context.fillRect(0, 0, options.width, options.height)
  }

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue

    context.beginPath()
    context.strokeStyle = stroke.color
    context.lineWidth = stroke.lineWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'

    const [first, ...rest] = stroke.points
    context.moveTo(first.x, first.y)

    if (rest.length === 0) {
      context.lineTo(first.x + 0.01, first.y + 0.01)
    } else {
      rest.forEach((point) => context.lineTo(point.x, point.y))
    }

    context.stroke()
  }
}

export function getSignatureCanvasDataUrl(
  canvas: HTMLCanvasElement | null,
  exportType: SignatureExportType,
  quality?: number
): string {
  if (!canvas || exportType === 'image/svg+xml') return ''

  try {
    return canvas.toDataURL(exportType, quality)
  } catch {
    return ''
  }
}
