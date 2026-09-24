import { isBrowser } from './env'

/**
 * Copy text with the async Clipboard API.
 * Returns false when the API is missing or the write fails. Does not move focus.
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof text !== 'string') return false
  if (!isBrowser() || !navigator.clipboard?.writeText) return false

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
