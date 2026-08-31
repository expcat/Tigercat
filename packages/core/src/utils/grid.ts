/**
 * Grid utility functions — 24-column flex grid with CSS gap.
 */

import type { Align, Justify, GutterSize, ColSpan, Breakpoint } from '../types/grid'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import {
  GRID_BREAKPOINT_ORDER,
  ensureGridBreakpointSync,
  injectLayoutGridStyles
} from './layout-grid-styles'

export { GRID_BREAKPOINT_ORDER }

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

const ALIGN_MAP: Record<Align, string> = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end',
  stretch: 'items-stretch'
}

const JUSTIFY_MAP: Record<Justify, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-around': 'justify-around',
  'space-between': 'justify-between',
  'space-evenly': 'justify-evenly'
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

export function resolveGutter(gutter: GutterSize | undefined | null): { x: number; y: number } {
  if (gutter === undefined || gutter === null || gutter === 0) return { x: 0, y: 0 }
  if (Array.isArray(gutter)) {
    return {
      x: Math.max(0, gutter[0] ?? 0),
      y: Math.max(0, gutter[1] ?? 0)
    }
  }
  return { x: Math.max(0, gutter), y: 0 }
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
  injectLayoutGridStyles()
  ensureGridBreakpointSync()
  return classNames('tiger-row', options.wrap === false && 'tiger-row-nowrap', options.className)
}

export function getAlignClasses(align: Align): string {
  return ALIGN_MAP[align] || 'items-start'
}

export function getJustifyClasses(justify: Justify): string {
  return JUSTIFY_MAP[justify] || 'justify-start'
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
  if (flex !== undefined) vars['--tiger-col-flex'] = String(flex).replace(/_/g, ' ')
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
  injectLayoutGridStyles()
  ensureGridBreakpointSync()
  return classNames('tiger-col', options.flex !== undefined && 'tiger-col-flex', options.className)
}

export function getSpanClasses(span: ColSpan | undefined): string {
  if (span === undefined || span === null) return ''
  return 'tiger-col'
}

export function getOffsetClasses(
  _offset: number | Partial<Record<Breakpoint, number>> | undefined
): string {
  return ''
}

export function getOrderClasses(
  _order: number | Partial<Record<Breakpoint, number>> | undefined
): string {
  return ''
}

export function getFlexClasses(flex: string | number | undefined): string {
  if (flex === undefined) return ''
  return 'tiger-col-flex'
}

export function getRowGutterClasses(_gutter: GutterSize): string {
  return ''
}
