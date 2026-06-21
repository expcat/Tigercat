import { isBrowser } from './env'

export type ChartExportFormat = 'svg' | 'png'

export interface ChartDownloadOptions {
  filename?: string
  backgroundColor?: string
  scale?: number
}

export function serializeChartSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  }

  return new XMLSerializer().serializeToString(clone)
}

export function getChartSvgDataUrl(svg: SVGSVGElement): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializeChartSvg(svg))}`
}

export function downloadChartSvg(svg: SVGSVGElement, filename: string = 'chart'): void {
  if (!isBrowser()) return

  downloadChartBlob(
    new Blob([serializeChartSvg(svg)], { type: 'image/svg+xml;charset=utf-8' }),
    `${filename}.svg`
  )
}

export async function exportChartPng(
  svg: SVGSVGElement,
  options: ChartDownloadOptions = {}
): Promise<Blob> {
  if (!isBrowser()) {
    throw new Error('Chart PNG export is only available in the browser')
  }

  const width = resolveSvgLength(svg, 'width') || svg.viewBox.baseVal.width
  const height = resolveSvgLength(svg, 'height') || svg.viewBox.baseVal.height
  if (!width || !height) {
    throw new Error('Chart SVG needs width/height or viewBox for PNG export')
  }

  const scale = Math.max(1, options.scale ?? 1)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * scale)
  canvas.height = Math.ceil(height * scale)

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context is unavailable')
  }

  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const image = await loadImage(getChartSvgDataUrl(svg))
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to export chart PNG'))
      }
    }, 'image/png')
  })
}

export async function downloadChartPng(
  svg: SVGSVGElement,
  options: ChartDownloadOptions = {}
): Promise<void> {
  if (!isBrowser()) return

  const blob = await exportChartPng(svg, options)
  downloadChartBlob(blob, `${options.filename ?? 'chart'}.png`)
}

export function downloadChartBlob(blob: Blob, filename: string): void {
  if (!isBrowser()) return

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function resolveSvgLength(svg: SVGSVGElement, attribute: 'width' | 'height'): number {
  const raw = svg.getAttribute(attribute)
  if (!raw) return 0
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load chart SVG image'))
    image.src = src
  })
}
