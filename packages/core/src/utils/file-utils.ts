import { isBrowser } from './env'

export interface FormatFileSizeOptions {
  precision?: number
  trimTrailingZeros?: boolean
  emptyText?: string
}

/**
 * Trigger a browser file download via a temporary `<a download>` link.
 * No-ops outside the browser. Shared by Table CSV, DataExport, and chart export.
 */
export function downloadBrowserFile(
  data: Blob | string | Uint8Array,
  filename: string,
  mime?: string
): void {
  if (!isBrowser()) return

  const blob =
    data instanceof Blob
      ? data
      : new Blob([data as BlobPart], { type: mime ?? 'application/octet-stream' })
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

export function formatBytes(
  bytes: number | null | undefined,
  options: FormatFileSizeOptions = {}
): string {
  if (bytes === undefined || bytes === null) return options.emptyText ?? ''
  const safeBytes = Number.isFinite(bytes) ? Math.max(0, bytes) : 0
  if (safeBytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const index = Math.min(units.length - 1, Math.floor(Math.log(safeBytes) / Math.log(k)))
  const size = safeBytes / Math.pow(k, index)
  const precision = Math.max(0, Math.floor(options.precision ?? 2))
  const text = size.toFixed(precision)

  return `${options.trimTrailingZeros ? text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') : text} ${units[index]}`
}

export function getFileExtensionName(name: string, options?: { includeDot?: boolean }): string {
  const dot = name.lastIndexOf('.')
  if (dot <= 0 || dot === name.length - 1) return ''
  const extension = name.slice(dot + 1).toLowerCase()
  return options?.includeDot ? `.${extension}` : extension
}
