import { classNames } from './class-names'

export const qrcodeContainerClasses = classNames(
  'relative inline-flex items-center justify-center',
  'bg-[var(--tiger-qrcode-bg,#ffffff)]',
  'rounded-[var(--tiger-radius-md,0.5rem)]'
)

export const qrcodeOverlayClasses = classNames(
  'absolute inset-0 flex flex-col items-center justify-center',
  'bg-white/80 rounded-[var(--tiger-radius-md,0.5rem)]'
)

export const qrcodeExpiredTextClasses = classNames(
  'text-sm text-[var(--tiger-qrcode-expired-text,var(--tiger-text-muted,#6b7280))]',
  'mb-1'
)

export const qrcodeRefreshClasses = classNames(
  'text-sm cursor-pointer',
  'text-[var(--tiger-qrcode-refresh,var(--tiger-primary,#2563eb))]',
  'hover:underline'
)

/**
 * Minimal QR code matrix generator.
 * Implements a simplified encoding for display purposes
 * (real production usage should use a proper QR library).
 * This generates a deterministic dot-matrix based on the input string.
 */
export function generateQRMatrix(value: string, size: number = 21): boolean[][] {
  // Simple hash-based pseudo QR matrix for visual representation
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  )

  // Position detection patterns (top-left, top-right, bottom-left)
  const drawFinderPattern = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (row + r >= size || col + c >= size) continue
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        matrix[row + r][col + c] = isOuter || isInner
      }
    }
  }

  drawFinderPattern(0, 0)
  drawFinderPattern(0, size - 7)
  drawFinderPattern(size - 7, 0)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Fill data area with deterministic pattern from string hash
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  }
  let seed = Math.abs(hash)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) continue
      // Skip finder pattern areas + separators
      if (r < 8 && c < 8) continue
      if (r < 8 && c >= size - 8) continue
      if (r >= size - 8 && c < 8) continue
      if (r === 6 || c === 6) continue

      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      matrix[r][c] = seed % 3 === 0
    }
  }

  return matrix
}
