import { isBrowser } from './env'

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof text !== 'string') return false

  if (isBrowser() && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Clipboard API failed, fall back to textarea method
    }
  }

  if (!isBrowser()) return false

  // `textarea` is removed in `finally`: `select()`, `setSelectionRange()` and
  // `execCommand()` can all throw (or be missing) in embedded webviews and test
  // DOMs, and an early return from the old catch left the node in the document
  // for good — an invisible, focusable textbox in the a11y tree.
  let textarea: HTMLTextAreaElement | null = null
  try {
    textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea?.remove()
  }
}
