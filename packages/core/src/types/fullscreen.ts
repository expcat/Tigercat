import type { TigerLocale, TigerLocaleFullscreen } from './locale'

/**
 * Shared FullscreenButton props (framework-agnostic).
 *
 * `useFullscreen` is the headless API. This button is a thin chrome wrapper
 * around the same enter/exit/toggle helpers.
 */
export interface FullscreenProps {
  /** Element to fullscreen. Omit for `document.documentElement`. */
  target?: Element | (() => Element | null | undefined) | null
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleFullscreen>
  className?: string
  onChange?: (isFullscreen: boolean) => void
  onError?: (error: Error) => void
}

export interface FullscreenState {
  isFullscreen: boolean
  supported: boolean
}
