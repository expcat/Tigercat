/**
 * Time utility functions for TimePicker component
 */

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

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null
  }

  return { hours, minutes, seconds }
}

/**
 * Format time components to string
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59)
 * @param showSeconds - Whether to include seconds in output
 * @returns Formatted time string
 */
export function formatTime(
  hours: number,
  minutes: number,
  seconds: number = 0,
  showSeconds: boolean = false
): string {
  const h = hours.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  const s = seconds.toString().padStart(2, '0')

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
 * @param seconds - Seconds (0-59)
 * @param format - '12' or '24' hour format
 * @param showSeconds - Whether to show seconds
 * @returns Formatted display string
 */
export function formatTimeDisplay(
  hours: number,
  minutes: number,
  seconds: number = 0,
  format: '12' | '24' = '24',
  showSeconds: boolean = false
): string {
  if (format === '12') {
    const { hours: hours12, period } = to12HourFormat(hours)
    const h = hours12.toString().padStart(2, '0')
    const m = minutes.toString().padStart(2, '0')
    const s = seconds.toString().padStart(2, '0')
    const timeStr = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
    return `${timeStr} ${period}`
  } else {
    return formatTime(hours, minutes, seconds, showSeconds)
  }
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
 * @param step - Hour step
 * @param format - '12' or '24' hour format
 * @returns Array of hour values
 */
export function generateHours(step: number = 1, format: '12' | '24' = '24'): number[] {
  const max = format === '12' ? 12 : 23
  const start = format === '12' ? 1 : 0
  const hours: number[] = []

  for (let i = start; i <= max; i += step) {
    hours.push(i)
  }

  return hours
}

/**
 * Generate list of minutes based on step
 * @param step - Minute step
 * @returns Array of minute values
 */
export function generateMinutes(step: number = 1): number[] {
  const minutes: number[] = []

  for (let i = 0; i < 60; i += step) {
    minutes.push(i)
  }

  return minutes
}

/**
 * Generate list of seconds based on step
 * @param step - Second step
 * @returns Array of second values
 */
export function generateSeconds(step: number = 1): number[] {
  const seconds: number[] = []

  for (let i = 0; i < 60; i += step) {
    seconds.push(i)
  }

  return seconds
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
