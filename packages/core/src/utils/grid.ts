/**
 * Grid utility functions — 24-column flex grid with CSS gap.
 */

import type { Align, Justify, GutterSize, ColSpan, Breakpoint } from '../types/grid'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import { GRID_BREAKPOINT_ORDER } from './layout-grid-styles'
import { isResponsiveMap, resolveResponsiveValue } from './responsive'

const ALIGN_CSS: Record<Align, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch'
}

const JUSTIFY_CSS: Record<Justify, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  'space-around': 'space-around',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly'
}

type ColOffset = number | Partial<Record<Breakpoint, number>>
type ColOrder = number | Partial<Record<Breakpoint, number>>

function clampGridValue(value: number, fieldName: string): number | undefined {
  if (!Number.isFinite(value)) {
    devWarn(`grid.${fieldName}`, `Invalid ${fieldName} value: ${value}.`)
    return undefined
  }
  if (value < 0 || value > 24) {
    devWarn(
      `grid.${fieldName}`,
      `Invalid ${fieldName} value: ${value}. ${fieldName} should be between 0 and 24.`
    )
    return Math.min(24, Math.max(0, Math.round(value)))
  }
  return value
}

function nonNegativeGutter(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0
  return value
}

export function resolveGutter(gutter: GutterSize | undefined | null): { x: number; y: number } {
  if (gutter === undefined || gutter === null || gutter === 0) return { x: 0, y: 0 }
  if (Array.isArray(gutter)) {
    return {
      x: nonNegativeGutter(gutter[0]),
      y: nonNegativeGutter(gutter[1])
    }
  }
  if (typeof gutter === 'number') return { x: nonNegativeGutter(gutter), y: 0 }
  return { x: 0, y: 0 }
}

export function resolveResponsiveGutter(
  gutter: GutterSize | undefined | null,
  width: number
): { x: number; y: number } {
  if (isResponsiveMap(gutter)) {
    return resolveGutter(resolveResponsiveValue(gutter, width, 0))
  }
  return resolveGutter(gutter)
}

export function resolveResponsiveAlign(
  align: Align | Partial<Record<Breakpoint, Align>> | undefined,
  width: number
): Align {
  if (!align || typeof align === 'string') return align ?? 'top'
  return resolveResponsiveValue(align, width, 'top')
}

export function resolveResponsiveJustify(
  justify: Justify | Partial<Record<Breakpoint, Justify>> | undefined,
  width: number
): Justify {
  if (!justify || typeof justify === 'string') return justify ?? 'start'
  return resolveResponsiveValue(justify, width, 'start')
}

export function hasGutter(gutter: GutterSize | undefined | null): boolean {
  const { x, y } = resolveGutter(gutter)
  return x > 0 || y > 0
}

export function getRowGutterStyleVars(
  gutter: GutterSize | undefined | null
): Record<string, string> {
  const { x, y } = resolveGutter(gutter)
  const vars: Record<string, string> = {}
  if (x > 0) vars['--tiger-row-gutter-x'] = `${x}px`
  if (y > 0) vars['--tiger-row-gutter-y'] = `${y}px`
  return vars
}

export function getRowAlignJustifyVars(
  align: Align = 'top',
  justify: Justify = 'start'
): Record<string, string> {
  return {
    '--tiger-row-align': ALIGN_CSS[align] ?? ALIGN_CSS.top,
    '--tiger-row-justify': JUSTIFY_CSS[justify] ?? JUSTIFY_CSS.start
  }
}

export function getRowClasses(
  options: {
    wrap?: boolean
    align?: Align
    justify?: Justify
    className?: string
  } = {}
): string {
  return classNames('tiger-row', options.wrap === false && 'tiger-row-nowrap', options.className)
}

function setSpanVars(vars: Record<string, string>, span: ColSpan): void {
  if (typeof span === 'number') {
    const value = clampGridValue(span, 'span')
    if (value === undefined) return
    vars['--tiger-col-span'] = String(value)
    vars['--tiger-col-display-base'] = value === 0 ? 'none' : 'block'
    return
  }

  vars['--tiger-col-span'] = '24'
  vars['--tiger-col-display-base'] = 'block'

  GRID_BREAKPOINT_ORDER.forEach((bp) => {
    const raw = span[bp]
    if (raw === undefined) return
    const value = clampGridValue(raw, `span.${bp}`)
    if (value === undefined) return
    const display = value === 0 ? 'none' : 'block'
    if (bp === 'xs') {
      vars['--tiger-col-span'] = String(value)
      vars['--tiger-col-display-base'] = display
      return
    }
    vars[`--tiger-col-span-${bp}`] = String(value)
    vars[`--tiger-col-display-${bp}`] = display
  })
}

function setOffsetVars(vars: Record<string, string>, offset: ColOffset): void {
  if (typeof offset === 'number') {
    const value = clampGridValue(offset, 'offset')
    if (value === undefined) return
    vars['--tiger-col-offset'] = String(value)
    return
  }

  vars['--tiger-col-offset'] = '0'

  GRID_BREAKPOINT_ORDER.forEach((bp) => {
    const raw = offset[bp]
    if (raw === undefined) return
    const value = clampGridValue(raw, `offset.${bp}`)
    if (value === undefined) return
    if (bp === 'xs') {
      vars['--tiger-col-offset'] = String(value)
      return
    }
    vars[`--tiger-col-offset-${bp}`] = String(value)
  })
}

function setOrderVars(vars: Record<string, string>, order: ColOrder): void {
  if (typeof order === 'number') {
    vars['--tiger-col-order'] = String(order)
    return
  }

  vars['--tiger-col-order'] = '0'

  GRID_BREAKPOINT_ORDER.forEach((bp) => {
    const value = order[bp]
    if (value === undefined) return
    if (bp === 'xs') {
      vars['--tiger-col-order'] = String(value)
      return
    }
    vars[`--tiger-col-order-${bp}`] = String(value)
  })
}

export function getColMergedStyleVars(
  span?: ColSpan,
  offset?: ColOffset,
  order?: ColOrder,
  flex?: string | number
): Record<string, string> {
  const vars: Record<string, string> = {}
  if (flex === undefined && span !== undefined && span !== null) setSpanVars(vars, span)
  if (offset !== undefined && offset !== null) setOffsetVars(vars, offset)
  if (order !== undefined && order !== null) setOrderVars(vars, order)
  if (flex !== undefined) {
    const text = String(flex)
    if (text.includes('_')) {
      devWarn(
        'Col.flex',
        `Col flex must be a CSS value such as "1 1 auto", not "${text}". Underscores are not rewritten.`
      )
    }
    vars['--tiger-col-flex'] = text
  }
  return vars
}

export function getColStyleVars(span?: ColSpan, offset?: ColOffset): Record<string, string> {
  return getColMergedStyleVars(span, offset)
}

export function getColOrderStyleVars(order?: ColOrder): Record<string, string> {
  if (order === undefined || order === null) return {}
  return getColMergedStyleVars(undefined, undefined, order)
}

export function getColClasses(
  options: { flex?: string | number; className?: string } = {}
): string {
  return classNames('tiger-col', options.flex !== undefined && 'tiger-col-flex', options.className)
}
