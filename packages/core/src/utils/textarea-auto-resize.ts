/**
 * Textarea auto-resize utility
 */

export interface AutoResizeTextareaOptions {
  minRows?: number
  maxRows?: number
}

function finitePositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined
  return Math.floor(value)
}

export function autoResizeTextarea(
  textarea: HTMLTextAreaElement,
  { minRows, maxRows }: AutoResizeTextareaOptions = {}
): void {
  textarea.style.height = 'auto'

  const styles = getComputedStyle(textarea)

  const lineHeightRaw = parseFloat(styles.lineHeight)
  const fontSizeRaw = parseFloat(styles.fontSize)
  const lineHeight = Number.isFinite(lineHeightRaw)
    ? lineHeightRaw
    : Number.isFinite(fontSizeRaw)
      ? fontSizeRaw * 1.2
      : 20

  const paddingTop = parseFloat(styles.paddingTop) || 0
  const paddingBottom = parseFloat(styles.paddingBottom) || 0
  const borderTop = parseFloat(styles.borderTopWidth) || 0
  const borderBottom = parseFloat(styles.borderBottomWidth) || 0
  const boxSizing = styles.boxSizing
  const borderExtra = boxSizing === 'border-box' ? borderTop + borderBottom : 0

  let nextHeight = textarea.scrollHeight + borderExtra
  const min = finitePositiveInt(minRows)
  const max = finitePositiveInt(maxRows)

  if (min !== undefined) {
    const minHeight = lineHeight * min + paddingTop + paddingBottom + borderExtra
    nextHeight = Math.max(nextHeight, minHeight)
  }

  let overflowY = 'hidden'
  if (max !== undefined) {
    const maxHeight = lineHeight * max + paddingTop + paddingBottom + borderExtra
    if (nextHeight > maxHeight) {
      nextHeight = maxHeight
      overflowY = 'auto'
    }
  }

  textarea.style.height = `${Math.max(0, nextHeight)}px`
  textarea.style.overflowY = overflowY
}

export function clearTextareaAutoResize(textarea: HTMLTextAreaElement): void {
  textarea.style.height = ''
  textarea.style.overflowY = ''
}
