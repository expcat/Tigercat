/**
 * Time utility functions for TimePicker component
 */

import type { TimeFormat } from '../types/timepicker'

/**
 * Validate time component value
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns True if value is within range
 */
function isValidTimeValue(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max
}

/**
 * Validate and normalize step value
 * Ensures step is at least 1 and rounds to integer
 * @param step - Step value to validate
 * @returns Valid step value (minimum 1)
 */
function validateStep(step: number): number {
  return Math.max(1, Math.floor(step))
}

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Parse time string to hours, minutes, and seconds
 * @param timeString - Time string in 'HH:mm' or 'HH:mm:ss' format
 * @returns Object with hours, minutes, and seconds, or null if invalid
 */
export function parseTime(timeString: string | null | undefined): {
  hours: number
  minutes: number
  seconds: number
} | null {
  if (!timeString) return null

  const timeParts = timeString.split(':')
  if (timeParts.length < 2 || timeParts.length > 3) return null

  const hours = parseInt(timeParts[0], 10)
  const minutes = parseInt(timeParts[1], 10)
  const seconds = timeParts.length === 3 ? parseInt(timeParts[2], 10) : 0

  // Validate all components
  if (
    !isValidTimeValue(hours, 0, 23) ||
    !isValidTimeValue(minutes, 0, 59) ||
    !isValidTimeValue(seconds, 0, 59)
  ) {
    return null
  }

  return { hours, minutes, seconds }
}

/**
 * Format time components to string
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59), defaults to 0
 * @param showSeconds - Whether to include seconds in output
 * @returns Formatted time string
 */
export function formatTime(
  hours: number,
  minutes: number,
  seconds: number = 0,
  showSeconds: boolean = false
): string {
  // Clamp values to valid ranges
  const h = clampValue(hours, 0, 23).toString().padStart(2, '0')
  const m = clampValue(minutes, 0, 59).toString().padStart(2, '0')
  const s = clampValue(seconds, 0, 59).toString().padStart(2, '0')

  return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
}

/**
 * Convert 24-hour format to 12-hour format with AM/PM
 * @param hours - Hours in 24-hour format (0-23)
 * @returns Object with 12-hour hours and period
 */
export function to12HourFormat(hours: number): {
  hours: number
  period: 'AM' | 'PM'
} {
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

  return { hours: hours12, period }
}

/**
 * Convert 12-hour format to 24-hour format
 * @param hours - Hours in 12-hour format (1-12)
 * @param period - AM or PM
 * @returns Hours in 24-hour format (0-23)
 */
export function to24HourFormat(hours: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') {
    return hours === 12 ? 0 : hours
  } else {
    return hours === 12 ? 12 : hours + 12
  }
}

/**
 * Format time for display based on format preference
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59), defaults to 0
 * @param format - '12' or '24' hour format
 * @param showSeconds - Whether to show seconds
 * @returns Formatted display string
 */
export function formatTimeDisplay(
  hours: number,
  minutes: number,
  seconds: number = 0,
  format: TimeFormat = '24',
  showSeconds: boolean = false
): string {
  return formatTimeDisplayWithLocale(hours, minutes, seconds, format, showSeconds)
}

export function getTimePeriodLabels(locale?: string): {
  am: string
  pm: string
} {
  if (!locale) return { am: 'AM', pm: 'PM' }

  const extract = (date: Date): string | null => {
    try {
      const parts = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        hour12: true
      }).formatToParts(date)
      const dayPeriod = parts.find((p) => p.type === 'dayPeriod')
      return dayPeriod?.value ?? null
    } catch {
      return null
    }
  }

  // Use stable dates with morning/evening hours
  const am = extract(new Date(2020, 0, 1, 9, 0, 0))
  const pm = extract(new Date(2020, 0, 1, 21, 0, 0))

  return {
    am: am || 'AM',
    pm: pm || 'PM'
  }
}

export function formatTimeDisplayWithLocale(
  hours: number,
  minutes: number,
  seconds: number = 0,
  format: TimeFormat = '24',
  showSeconds: boolean = false,
  locale?: string
): string {
  if (format !== '12') {
    return formatTime(hours, minutes, seconds, showSeconds)
  }

  const { hours: hours12, period } = to12HourFormat(hours)
  const h = hours12.toString().padStart(2, '0')
  const m = clampValue(minutes, 0, 59).toString().padStart(2, '0')
  const s = clampValue(seconds, 0, 59).toString().padStart(2, '0')
  const timeStr = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`

  const labels = getTimePeriodLabels(locale)
  const suffix = period === 'AM' ? labels.am : labels.pm
  return `${timeStr} ${suffix}`
}

/**
 * Check if time is within range
 * @param hours - Hours to check
 * @param minutes - Minutes to check
 * @param minTime - Minimum time string
 * @param maxTime - Maximum time string
 * @returns True if time is in range
 */
export function isTimeInRange(
  hours: number,
  minutes: number,
  minTime: string | null | undefined,
  maxTime: string | null | undefined
): boolean {
  const currentMinutes = hours * 60 + minutes

  if (minTime) {
    const min = parseTime(minTime)
    if (min) {
      const minMinutes = min.hours * 60 + min.minutes
      if (currentMinutes < minMinutes) return false
    }
  }

  if (maxTime) {
    const max = parseTime(maxTime)
    if (max) {
      const maxMinutes = max.hours * 60 + max.minutes
      if (currentMinutes > maxMinutes) return false
    }
  }

  return true
}

/**
 * Generate list of hours based on step
 * @param step - Hour step, defaults to 1
 * @param format - '12' or '24' hour format
 * @returns Array of hour values
 */
export function generateHours(step: number = 1, format: TimeFormat = '24'): number[] {
  const max = format === '12' ? 12 : 23
  const start = format === '12' ? 1 : 0
  const hours: number[] = []
  const validStep = validateStep(step)

  for (let i = start; i <= max; i += validStep) {
    hours.push(i)
  }

  return hours
}

/**
 * Generate a list of time values from 0 up to (but not including) max, using the given step.
 */
function generateTimeSlots(step: number, max: number): number[] {
  const validStep = validateStep(step)
  const values: number[] = []
  for (let i = 0; i < max; i += validStep) {
    values.push(i)
  }
  return values
}

/**
 * Generate list of minutes based on step
 * @param step - Minute step, defaults to 1
 * @returns Array of minute values
 */
export function generateMinutes(step: number = 1): number[] {
  return generateTimeSlots(step, 60)
}

/**
 * Generate list of seconds based on step
 * @param step - Second step, defaults to 1
 * @returns Array of second values
 */
export function generateSeconds(step: number = 1): number[] {
  return generateTimeSlots(step, 60)
}

/**
 * Get current time as formatted string
 * @param showSeconds - Whether to include seconds
 * @returns Current time string
 */
export function getCurrentTime(showSeconds: boolean = false): string {
  const now = new Date()
  return formatTime(now.getHours(), now.getMinutes(), now.getSeconds(), showSeconds)
}
