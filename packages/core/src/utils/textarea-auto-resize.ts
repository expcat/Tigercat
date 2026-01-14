/**
 * Textarea auto-resize utility
 */

export interface AutoResizeTextareaOptions {
  minRows?: number
  maxRows?: number
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

  let nextHeight = textarea.scrollHeight

  if (typeof minRows === 'number') {
    const minHeight = lineHeight * minRows + paddingTop + paddingBottom
    nextHeight = Math.max(nextHeight, minHeight)
  }

  if (typeof maxRows === 'number') {
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom
    nextHeight = Math.min(nextHeight, maxHeight)
  }

  textarea.style.height = `${Math.max(0, nextHeight)}px`
}
