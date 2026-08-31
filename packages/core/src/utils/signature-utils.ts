import type {
  SignatureChangePayload,
  SignatureExportType,
  SignaturePoint,
  SignatureStroke
} from '../types/signature'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'
import { isBrowser } from './env'

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
  surfaceColor?: string
  quality?: number
}

export interface SignatureSession {
  strokes: SignatureStroke[]
  activeStroke: SignatureStroke | null
  pointerId: number | null
}

export const SIGNATURE_DEFAULT_HEIGHT = 180
export const SIGNATURE_MIN_BACKING = 1

export const signatureRootClasses = 'inline-flex w-full flex-col gap-2'

export const signatureCanvasWrapClasses = classNames(
  'relative w-full rounded-[var(--tiger-radius-md,0.5rem)]',
  'border border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-surface,#ffffff)]'
)

export const signatureCanvasClasses = classNames(
  'block w-full touch-none rounded-[inherit]',
  'outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'
)

export const signatureToolbarClasses = 'flex items-center justify-end gap-2'

export const signatureToolbarButtonClasses = classNames(
  'inline-flex items-center rounded-[var(--tiger-radius-sm,0.375rem)]',
  'border border-[var(--tiger-border,#d1d5db)] px-3 py-1.5 text-sm',
  'text-[var(--tiger-text,#111827)]',
  'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease,background-color_150ms_ease)]',
  'hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

export function getSignatureCanvasWrapClasses(disabled = false, readonly = false): string {
  return classNames(
    signatureCanvasWrapClasses,
    disabled && 'opacity-60',
    disabled || readonly ? 'cursor-not-allowed' : 'cursor-crosshair'
  )
}

export function getSignatureCanvasStatusClasses(status: InputStatus = 'default'): string {
  if (status === 'error') return 'border-[var(--tiger-error,#dc2626)]'
  if (status === 'warning') return 'border-[var(--tiger-warning,#d97706)]'
  if (status === 'success') return 'border-[var(--tiger-success,#16a34a)]'
  return ''
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
  height: number
): SignaturePoint {
  const scaleX = rect.width > 0 ? width / rect.width : 1
  const scaleY = rect.height > 0 ? height / rect.height : 1

  return {
    x: Math.max(0, Math.min(width, (clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(height, (clientY - rect.top) * scaleY))
  }
}

export function isSignatureEmpty(strokes: readonly SignatureStroke[] = []): boolean {
  return strokes.every((stroke) => stroke.points.length === 0)
}

export function cloneSignatureStrokes(strokes: readonly SignatureStroke[]): SignatureStroke[] {
  return strokes.map((stroke) => ({
    color: stroke.color,
    lineWidth: stroke.lineWidth,
    points: stroke.points.map((point) => ({ x: point.x, y: point.y }))
  }))
}

export function createSignatureSession(strokes: readonly SignatureStroke[] = []): SignatureSession {
  return {
    strokes: cloneSignatureStrokes(strokes),
    activeStroke: null,
    pointerId: null
  }
}

export function beginSignatureStroke(
  session: SignatureSession,
  point: SignaturePoint,
  pointerId: number,
  color: string,
  lineWidth: number
): SignatureSession {
  if (session.pointerId != null) return session

  const stroke: SignatureStroke = {
    color,
    lineWidth: clampSignatureLineWidth(lineWidth),
    points: [{ x: point.x, y: point.y }]
  }

  return {
    strokes: [...session.strokes, stroke],
    activeStroke: stroke,
    pointerId
  }
}

export function appendSignaturePoint(
  session: SignatureSession,
  point: SignaturePoint,
  pointerId: number
): SignatureSession {
  if (session.pointerId !== pointerId || !session.activeStroke) return session

  const activeStroke: SignatureStroke = {
    ...session.activeStroke,
    points: [...session.activeStroke.points, { x: point.x, y: point.y }]
  }
  const strokes = session.strokes.map((stroke) =>
    stroke === session.activeStroke ? activeStroke : stroke
  )
  return {
    strokes,
    activeStroke,
    pointerId: session.pointerId
  }
}

export function finishSignatureStroke(
  session: SignatureSession,
  pointerId?: number | null
): SignatureSession {
  if (!session.activeStroke) return session
  if (pointerId != null && session.pointerId != null && pointerId !== session.pointerId) {
    return session
  }

  return {
    strokes: session.strokes,
    activeStroke: null,
    pointerId: null
  }
}

export function undoSignatureStroke(session: SignatureSession): SignatureSession {
  if (session.strokes.length === 0) return session
  return {
    strokes: session.strokes.slice(0, -1),
    activeStroke: null,
    pointerId: null
  }
}

export function clearSignatureStrokes(): SignatureSession {
  return createSignatureSession([])
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

export function isSignatureSvgDataUrl(value: string): boolean {
  return value.startsWith('data:image/svg+xml')
}

export function decodeSignatureSvgDataUrl(value: string): string | null {
  if (!isSignatureSvgDataUrl(value)) return null
  const comma = value.indexOf(',')
  if (comma < 0) return null
  const meta = value.slice(0, comma)
  const data = value.slice(comma + 1)
  try {
    return meta.includes(';base64') ? globalThis.atob(data) : decodeURIComponent(data)
  } catch {
    return null
  }
}

export function parseSignatureSvg(svg: string): SignatureStroke[] {
  const strokes: SignatureStroke[] = []
  const pathPattern = /<path\b([^>]*)>/gi
  let match: RegExpExecArray | null
  while ((match = pathPattern.exec(svg)) !== null) {
    const attrs = match[1]
    const d = /(?:^|\s)d="([^"]*)"/.exec(attrs)?.[1]
    if (!d) continue
    const color = /(?:^|\s)stroke="([^"]*)"/.exec(attrs)?.[1] ?? '#111827'
    const widthRaw = /(?:^|\s)stroke-width="([^"]*)"/.exec(attrs)?.[1]
    const points: SignaturePoint[] = []
    const commandPattern = /[ML]\s*([-\d.]+)\s+([-\d.]+)/gi
    let command: RegExpExecArray | null
    while ((command = commandPattern.exec(d)) !== null) {
      points.push({ x: Number(command[1]), y: Number(command[2]) })
    }
    if (points.length === 0) continue
    strokes.push({
      color,
      lineWidth: clampSignatureLineWidth(widthRaw == null ? undefined : Number(widthRaw)),
      points
    })
  }
  return strokes
}

/** Restore strokes from an SVG data URL (or raw SVG). Raster URLs yield `[]`. */
export function signatureValueToStrokes(value: unknown): SignatureStroke[] {
  if (value == null || value === '') return []
  const str = String(value)
  if (!str) return []
  const svg = isSignatureSvgDataUrl(str)
    ? decodeSignatureSvgDataUrl(str)
    : str.includes('<svg')
      ? str
      : null
  if (!svg) return []
  return parseSignatureSvg(svg)
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

export function readCssColor(
  element: Element | null | undefined,
  variable: string,
  fallback: string
): string {
  if (!element || typeof getComputedStyle === 'undefined') return fallback
  const value = getComputedStyle(element).getPropertyValue(variable).trim()
  return value || fallback
}

export function resolveSignaturePenColor(
  element: Element | null | undefined,
  penColor?: string
): string {
  if (penColor && penColor.trim()) return penColor
  return readCssColor(element, '--tiger-text', '#111827')
}

export function resolveSignatureSurfaceColor(element: Element | null | undefined): string {
  return readCssColor(element, '--tiger-surface', '#ffffff')
}

export function resolveSignatureExportBackground(
  exportType: SignatureExportType,
  backgroundColor: string | undefined,
  surfaceColor: string
): string | undefined {
  if (backgroundColor) return backgroundColor
  if (exportType === 'image/jpeg' || exportType === 'image/webp') return surfaceColor
  return undefined
}

export function getSignatureDevicePixelRatio(): number {
  if (!isBrowser()) return 1
  return window.devicePixelRatio || 1
}

export function syncSignatureCanvasBackingStore(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr = getSignatureDevicePixelRatio()
): CanvasRenderingContext2D | null {
  const nextWidth = Math.max(SIGNATURE_MIN_BACKING, Math.round(width * dpr))
  const nextHeight = Math.max(SIGNATURE_MIN_BACKING, Math.round(height * dpr))
  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth
    canvas.height = nextHeight
  }
  canvas.style.width = '100%'
  canvas.style.height = `${height}px`
  const context = canvas.getContext('2d')
  if (!context) return null
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  return context
}

/**
 * Offscreen canvas at **logical** width×height. Never reads the display canvas,
 * so DPR backing-store size cannot leak into the export.
 */
export function createSignatureExportCanvas(
  strokes: readonly SignatureStroke[],
  options: SignatureExportOptions & { exportType: SignatureExportType }
): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return null
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(SIGNATURE_MIN_BACKING, Math.round(options.width))
  canvas.height = Math.max(SIGNATURE_MIN_BACKING, Math.round(options.height))
  const context = canvas.getContext('2d')
  const backgroundColor = resolveSignatureExportBackground(
    options.exportType,
    options.backgroundColor,
    options.surfaceColor ?? '#ffffff'
  )
  if (context) {
    drawSignatureStrokes(context, strokes, {
      width: options.width,
      height: options.height,
      backgroundColor
    })
  }
  return canvas
}

export function exportSignatureDataUrl(
  strokes: readonly SignatureStroke[],
  exportType: SignatureExportType,
  options: SignatureExportOptions
): string {
  if (isSignatureEmpty(strokes)) return ''
  if (exportType === 'image/svg+xml') {
    return signatureSvgToDataUrl(signatureStrokesToSvg(strokes, options))
  }
  const canvas = createSignatureExportCanvas(strokes, { ...options, exportType })
  if (!canvas) return ''
  try {
    return canvas.toDataURL(exportType, options.quality)
  } catch {
    return ''
  }
}

/**
 * Form/controlled value is always an SVG data URL (or `''`). Raster export is
 * available via `exportSignatureDataUrl` / `toDataURL`.
 */
export function createSignatureChangePayload(
  strokes: readonly SignatureStroke[],
  options: SignatureExportOptions & { exportType: SignatureExportType }
): SignatureChangePayload {
  const cloned = cloneSignatureStrokes(strokes)
  if (isSignatureEmpty(cloned)) {
    return {
      value: '',
      empty: true,
      strokes: [],
      exportType: options.exportType
    }
  }

  return {
    value: signatureSvgToDataUrl(signatureStrokesToSvg(cloned, options)),
    empty: false,
    strokes: cloned,
    exportType: options.exportType
  }
}
