export type CountdownValue = number | string | Date

export type CountdownSize = 'sm' | 'md' | 'lg'

export interface CountdownDurationParts {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

export interface CountdownChangePayload {
  remaining: number
  formatted: string
  parts: CountdownDurationParts
  finished: boolean
}

export interface CountdownProps {
  /**
   * Target timestamp. Invalid or omitted values render `00:00:00` and do not tick.
   */
  value?: CountdownValue
  /**
   * First-paint / SSR clock snapshot only. After mount, ticks use `Date.now()`.
   * Changing `now` updates the displayed remaining time and does not restart the interval.
   * Omit on the server to keep HTML stable (`00:00:00`); the client fills in on mount.
   */
  now?: CountdownValue
  /**
   * Display pattern. `HH` is total hours unless `D`/`DD` is present (then 24h remainder).
   * `SSS` needs an `interval` smaller than 1000ms or milliseconds will not move.
   * @default 'HH:mm:ss'
   */
  format?: string
  /**
   * Tick period in ms. `<= 0` disables the timer.
   * @default 1000
   */
  interval?: number
  /**
   * Visible title above the value. Not an HTML tooltip.
   */
  title?: unknown
  prefix?: unknown
  suffix?: unknown
  size?: CountdownSize
  /**
   * Accessible name for the widget root. The timer node keeps the formatted time as its name.
   */
  ariaLabel?: string
  className?: string
}
