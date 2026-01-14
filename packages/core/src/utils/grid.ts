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
  stretch: 'items-stretch'
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
  'space-evenly': 'justify-evenly'
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

type ColOffset = number | Partial<Record<Breakpoint, number>>
type ColOrder = number | Partial<Record<Breakpoint, number>>

// Tailwind needs classes to be statically present in source to generate CSS.
// We keep a small fixed set of classes and provide concrete values via CSS vars.
const colSpanClasses =
  'w-[var(--tiger-col-span)] sm:w-[var(--tiger-col-span-sm,var(--tiger-col-span))] md:w-[var(--tiger-col-span-md,var(--tiger-col-span))] lg:w-[var(--tiger-col-span-lg,var(--tiger-col-span))] xl:w-[var(--tiger-col-span-xl,var(--tiger-col-span))] 2xl:w-[var(--tiger-col-span-2xl,var(--tiger-col-span))]'

const colOffsetClasses =
  'ml-[var(--tiger-col-offset)] sm:ml-[var(--tiger-col-offset-sm,var(--tiger-col-offset))] md:ml-[var(--tiger-col-offset-md,var(--tiger-col-offset))] lg:ml-[var(--tiger-col-offset-lg,var(--tiger-col-offset))] xl:ml-[var(--tiger-col-offset-xl,var(--tiger-col-offset))] 2xl:ml-[var(--tiger-col-offset-2xl,var(--tiger-col-offset))]'

const colFlexClasses = 'flex-[var(--tiger-col-flex)]'

const colOrderClasses =
  'order-[var(--tiger-col-order)] sm:order-[var(--tiger-col-order-sm,var(--tiger-col-order))] md:order-[var(--tiger-col-order-md,var(--tiger-col-order))] lg:order-[var(--tiger-col-order-lg,var(--tiger-col-order))] xl:order-[var(--tiger-col-order-xl,var(--tiger-col-order))] 2xl:order-[var(--tiger-col-order-2xl,var(--tiger-col-order))]'

function hasNonZeroOffset(offset: ColOffset): boolean {
  if (typeof offset === 'number') return offset !== 0
  return BREAKPOINT_ORDER.some((bp) => (offset[bp] ?? 0) !== 0)
}

function setSpanVars(vars: Record<string, string>, span: ColSpan): void {
  if (typeof span === 'number') {
    if (validateGridValue(span, 'span')) vars['--tiger-col-span'] = `${toPercentage(span)}%`
    return
  }

  // Default to full width on xs unless explicitly provided.
  vars['--tiger-col-span'] = '100%'

  BREAKPOINT_ORDER.forEach((bp) => {
    const value = span[bp]
    if (value === undefined) return
    if (!validateGridValue(value, `span.${bp}`)) return

    const percentage = `${toPercentage(value)}%`
    if (bp === 'xs') {
      vars['--tiger-col-span'] = percentage
      return
    }

    vars[`--tiger-col-span-${bp}`] = percentage
  })
}

function setOffsetVars(vars: Record<string, string>, offset: ColOffset): void {
  if (typeof offset === 'number') {
    if (offset === 0) return
    if (validateGridValue(offset, 'offset')) vars['--tiger-col-offset'] = `${toPercentage(offset)}%`
    return
  }

  // Default to no offset on xs unless explicitly provided.
  vars['--tiger-col-offset'] = '0%'

  BREAKPOINT_ORDER.forEach((bp) => {
    const value = offset[bp]
    if (value === undefined) return
    if (value === 0) return
    if (!validateGridValue(value, `offset.${bp}`)) return

    const percentage = `${toPercentage(value)}%`
    if (bp === 'xs') {
      vars['--tiger-col-offset'] = percentage
      return
    }

    vars[`--tiger-col-offset-${bp}`] = percentage
  })
}

export function getColStyleVars(span?: ColSpan, offset?: ColOffset): Record<string, string> {
  const vars: Record<string, string> = {}

  if (span !== undefined && span !== null) setSpanVars(vars, span)
  if (offset !== undefined && offset !== null) setOffsetVars(vars, offset)

  return vars
}

function setOrderVars(vars: Record<string, string>, order: ColOrder): void {
  if (typeof order === 'number') {
    vars['--tiger-col-order'] = String(order)
    return
  }

  // Default to 0 on xs unless explicitly provided.
  vars['--tiger-col-order'] = '0'

  BREAKPOINT_ORDER.forEach((bp) => {
    const value = order[bp]
    if (value === undefined) return

    if (bp === 'xs') {
      vars['--tiger-col-order'] = String(value)
      return
    }

    vars[`--tiger-col-order-${bp}`] = String(value)
  })
}

export function getColOrderStyleVars(order?: ColOrder): Record<string, string> {
  if (order === undefined || order === null) return {}

  const vars: Record<string, string> = {}
  setOrderVars(vars, order)
  return vars
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
export function getGutterStyles(gutter: GutterSize): {
  rowStyle?: Record<string, string>
  colStyle?: Record<string, string>
} {
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

  return colSpanClasses
}

/**
 * Get offset classes for Col component
 */
export function getOffsetClasses(
  offset: number | Partial<Record<Breakpoint, number>> | undefined
): string {
  if (offset === undefined || offset === null) return ''

  if (!hasNonZeroOffset(offset)) return ''
  return colOffsetClasses
}

/**
 * Get order classes for Col component
 */
export function getOrderClasses(
  order: number | Partial<Record<Breakpoint, number>> | undefined
): string {
  if (order === undefined) return ''

  return colOrderClasses
}

/**
 * Get flex classes for Col component
 */
export function getFlexClasses(flex: string | number | undefined): string {
  if (flex === undefined) return ''

  return colFlexClasses
}
