/**
 * LoadingBar component types and interfaces
 *
 * Top-of-viewport progress bar with a discrete imperative API
 * (`start` / `finish` / `error`), similar to Naive UI / nprogress.
 */

/**
 * Visual status of the loading bar.
 */
export type LoadingBarStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Color of the loading bar fill.
 */
export type LoadingBarColor = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * Options accepted by the imperative `LoadingBar.start()` API.
 */
export interface LoadingBarProps {
  /**
   * Fill color while loading. Error status always uses danger.
   * @default 'primary'
   */
  color?: LoadingBarColor

  /**
   * Bar height in pixels.
   * @default 2
   */
  height?: number

  /**
   * Additional CSS classes merged onto the bar.
   */
  className?: string

  /**
   * Inline styles merged onto the bar.
   */
  style?: Record<string, string | number>

  /**
   * Mount parent for the host container. CSS selector or element.
   * Defaults to the overlay target chain (ConfigProvider root, then `document.body`).
   */
  container?: string | HTMLElement

  /**
   * Accessible name for the progressbar.
   * @default locale `common.loadingText` or `'Loading'`
   */
  ariaLabel?: string
}

/**
 * Options for the imperative LoadingBar API.
 */
export type LoadingBarOptions = LoadingBarProps

/**
 * Props for the host-rendered loading bar container.
 */
export interface LoadingBarContainerProps {
  /**
   * Current progress percentage (0-100).
   * @default 0
   */
  percentage?: number

  /**
   * Visual status. Error uses the danger color.
   * @default 'idle'
   */
  status?: LoadingBarStatus

  /**
   * Fill color while loading.
   * @default 'primary'
   */
  color?: LoadingBarColor

  /**
   * Bar height in pixels.
   * @default 2
   */
  height?: number

  /**
   * Additional CSS classes.
   */
  className?: string

  /**
   * Inline styles.
   */
  style?: Record<string, string | number>

  /**
   * Accessible name for the progressbar.
   * @default 'Loading'
   */
  ariaLabel?: string
}

/**
 * Discrete imperative LoadingBar API.
 */
export interface LoadingBarApi {
  /**
   * Show the bar and begin trickle increment.
   * Nested `start()` calls require a matching number of `finish()` calls.
   */
  start: (options?: LoadingBarOptions) => void

  /**
   * Complete the bar (100%) then hide it.
   */
  finish: () => void

  /**
   * Switch to the error color at 100% then hide/clear.
   */
  error: () => void

  /**
   * Hide immediately and tear down the host container.
   */
  clear: () => void
}
