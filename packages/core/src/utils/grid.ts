/**
 * Grid utility functions
 */

import type { Align, Justify, GutterSize, ColSpan, Breakpoint } from '../types/grid'

/**
 * Get align classes for Row component
 */
export function getAlignClasses(align: Align): string {
  const alignMap: Record<Align, string> = {
    top: 'items-start',
    middle: 'items-center',
    bottom: 'items-end',
    stretch: 'items-stretch',
  }
  return alignMap[align] || 'items-start'
}

/**
 * Get justify classes for Row component
 */
export function getJustifyClasses(justify: Justify): string {
  const justifyMap: Record<Justify, string> = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    'space-around': 'justify-around',
    'space-between': 'justify-between',
    'space-evenly': 'justify-evenly',
  }
  return justifyMap[justify] || 'justify-start'
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
    // Validate span value
    if (span < 0 || span > 24) {
      console.warn(`Invalid span value: ${span}. Span should be between 0 and 24.`)
    }
    // Convert to percentage: span/24 * 100%
    const percentage = ((span / 24) * 100).toFixed(6).replace(/\.?0+$/, '')
    return `w-[${percentage}%]`
  }

  // Handle responsive object
  const classes: string[] = []
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

  breakpointOrder.forEach((bp) => {
    const value = span[bp]
    if (value !== undefined) {
      // Validate value
      if (value < 0 || value > 24) {
        console.warn(`Invalid span value for ${bp}: ${value}. Span should be between 0 and 24.`)
      }
      const percentage = ((value / 24) * 100).toFixed(6).replace(/\.?0+$/, '')
      if (bp === 'xs') {
        classes.push(`w-[${percentage}%]`)
      } else {
        classes.push(`${bp}:w-[${percentage}%]`)
      }
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
    
    // Validate offset value
    if (offset < 0 || offset > 24) {
      console.warn(`Invalid offset value: ${offset}. Offset should be between 0 and 24.`)
    }
    const percentage = ((offset / 24) * 100).toFixed(6).replace(/\.?0+$/, '')
    return `ml-[${percentage}%]`
  }

  // Handle responsive object
  const classes: string[] = []
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

  breakpointOrder.forEach((bp) => {
    const value = offset[bp]
    if (value !== undefined && value !== 0) {
      // Validate value
      if (value < 0 || value > 24) {
        console.warn(`Invalid offset value for ${bp}: ${value}. Offset should be between 0 and 24.`)
      }
      const percentage = ((value / 24) * 100).toFixed(6).replace(/\.?0+$/, '')
      if (bp === 'xs') {
        classes.push(`ml-[${percentage}%]`)
      } else {
        classes.push(`${bp}:ml-[${percentage}%]`)
      }
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
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

  breakpointOrder.forEach((bp) => {
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
