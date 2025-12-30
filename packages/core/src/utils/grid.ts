/**
 * Grid utility functions
 */

import type { Align, Justify, GutterSize, ColSpan, Breakpoint } from '../types/grid'

/**
 * Breakpoint order for responsive classes
 */
const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

/**
 * Align class map for Row component
 */
const ALIGN_MAP: Record<Align, string> = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end',
  stretch: 'items-stretch',
}

/**
 * Justify class map for Row component
 */
const JUSTIFY_MAP: Record<Justify, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-around': 'justify-around',
  'space-between': 'justify-between',
  'space-evenly': 'justify-evenly',
}

/**
 * Validate span or offset value (should be between 0 and 24)
 * @param value - Value to validate
 * @param fieldName - Name of the field for warning message
 * @returns True if valid
 */
function validateGridValue(value: number, fieldName: string): boolean {
  if (value < 0 || value > 24) {
    console.warn(`Invalid ${fieldName} value: ${value}. ${fieldName} should be between 0 and 24.`)
    return false
  }
  return true
}

/**
 * Convert grid value (0-24) to percentage
 * @param value - Grid value
 * @returns Percentage string
 */
function toPercentage(value: number): string {
  return ((value / 24) * 100).toFixed(6).replace(/\.?0+$/, '')
}

/**
 * Get align classes for Row component
 */
export function getAlignClasses(align: Align): string {
  return ALIGN_MAP[align] || 'items-start'
}

/**
 * Get justify classes for Row component
 */
export function getJustifyClasses(justify: Justify): string {
  return JUSTIFY_MAP[justify] || 'justify-start'
}

/**
 * Get gutter styles for Row component
 */
export function getGutterStyles(gutter: GutterSize): { rowStyle?: Record<string, string>; colStyle?: Record<string, string> } {
  if (gutter === undefined || gutter === null || gutter === 0) return {}

  const [horizontal, vertical] = Array.isArray(gutter) ? gutter : [gutter, gutter]

  const rowStyle: Record<string, string> = {}
  const colStyle: Record<string, string> = {}

  if (horizontal > 0) {
    rowStyle.marginLeft = `-${horizontal / 2}px`
    rowStyle.marginRight = `-${horizontal / 2}px`
    colStyle.paddingLeft = `${horizontal / 2}px`
    colStyle.paddingRight = `${horizontal / 2}px`
  }

  if (vertical > 0) {
    rowStyle.marginTop = `-${vertical / 2}px`
    rowStyle.marginBottom = `-${vertical / 2}px`
    colStyle.paddingTop = `${vertical / 2}px`
    colStyle.paddingBottom = `${vertical / 2}px`
  }

  return { rowStyle, colStyle }
}

/**
 * Get span classes for Col component
 */
export function getSpanClasses(span: ColSpan | undefined): string {
  if (span === undefined || span === null) return 'w-full'

  if (typeof span === 'number') {
    validateGridValue(span, 'span')
    const percentage = toPercentage(span)
    return `w-[${percentage}%]`
  }

  // Handle responsive object
  const classes: string[] = []

  BREAKPOINT_ORDER.forEach((bp) => {
    const value = span[bp]
    if (value !== undefined) {
      validateGridValue(value, `span.${bp}`)
      const percentage = toPercentage(value)
      const prefix = bp === 'xs' ? '' : `${bp}:`
      classes.push(`${prefix}w-[${percentage}%]`)
    }
  })

  return classes.join(' ') || 'w-full'
}

/**
 * Get offset classes for Col component
 */
export function getOffsetClasses(offset: number | Partial<Record<Breakpoint, number>> | undefined): string {
  if (offset === undefined || offset === null) return ''

  if (typeof offset === 'number') {
    // offset=0 means no offset, return empty string
    if (offset === 0) return ''
    
    validateGridValue(offset, 'offset')
    const percentage = toPercentage(offset)
    return `ml-[${percentage}%]`
  }

  // Handle responsive object
  const classes: string[] = []

  BREAKPOINT_ORDER.forEach((bp) => {
    const value = offset[bp]
    if (value !== undefined && value !== 0) {
      validateGridValue(value, `offset.${bp}`)
      const percentage = toPercentage(value)
      const prefix = bp === 'xs' ? '' : `${bp}:`
      classes.push(`${prefix}ml-[${percentage}%]`)
    }
  })

  return classes.join(' ')
}

/**
 * Get order classes for Col component
 */
export function getOrderClasses(order: number | Partial<Record<Breakpoint, number>> | undefined): string {
  if (order === undefined) return ''

  if (typeof order === 'number') {
    return `order-${order}`
  }

  // Handle responsive object
  const classes: string[] = []

  BREAKPOINT_ORDER.forEach((bp) => {
    const value = order[bp]
    if (value !== undefined) {
      if (bp === 'xs') {
        classes.push(`order-${value}`)
      } else {
        classes.push(`${bp}:order-${value}`)
      }
    }
  })

  return classes.join(' ')
}

/**
 * Get flex classes for Col component
 */
export function getFlexClasses(flex: string | number | undefined): string {
  if (flex === undefined) return ''

  // Always use arbitrary value syntax for consistency
  return `flex-[${flex}]`
}
