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
  value?: CountdownValue
  now?: CountdownValue
  format?: string
  interval?: number
  title?: string
  prefix?: string
  suffix?: string
  size?: CountdownSize
  ariaLabel?: string
  className?: string
}
