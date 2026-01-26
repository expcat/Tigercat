/**
 * Chart primitives types and interfaces
 */

export type ChartScaleType = 'linear' | 'band' | 'point'

export type ChartAxisOrientation = 'left' | 'right' | 'top' | 'bottom'

export type ChartScaleValue = number | string

export type ChartPadding =
  | number
  | {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }

export interface ChartCanvasProps {
  /**
   * SVG width
   * @default 320
   */
  width?: number

  /**
   * SVG height
   * @default 200
   */
  height?: number

  /**
   * Inner padding for chart drawing area
   * @default 24
   */
  padding?: ChartPadding

  /**
   * Additional CSS classes
   */
  className?: string
}

export interface ChartScale<T extends ChartScaleValue = ChartScaleValue> {
  type: ChartScaleType
  domain: T[]
  range: [number, number]
  map: (value: T) => number
  bandwidth?: number
  step?: number
}

export interface BandScaleOptions {
  /**
   * Inner padding between bands
   * @default 0.1
   */
  paddingInner?: number

  /**
   * Outer padding at both ends
   * @default 0.1
   */
  paddingOuter?: number

  /**
   * Alignment between 0 and 1
   * @default 0.5
   */
  align?: number
}

export interface PointScaleOptions {
  /**
   * Padding ratio at both ends
   * @default 0.5
   */
  padding?: number
}

export interface ChartAxisProps<T extends ChartScaleValue = ChartScaleValue> {
  /**
   * Axis orientation
   * @default 'bottom'
   */
  orientation?: ChartAxisOrientation

  /**
   * Axis scale
   */
  scale: ChartScale<T>

  /**
   * Number of ticks (only for linear scale)
   * @default 5
   */
  ticks?: number

  /**
   * Explicit tick values
   */
  tickValues?: T[]

  /**
   * Tick label formatter
   */
  tickFormat?: (value: T) => string

  /**
   * Tick size in px
   * @default 6
   */
  tickSize?: number

  /**
   * Tick padding in px
   * @default 4
   */
  tickPadding?: number

  /**
   * Axis label
   */
  label?: string

  /**
   * Label offset in px
   * @default 28
   */
  labelOffset?: number

  /**
   * X offset
   * @default 0
   */
  x?: number

  /**
   * Y offset
   * @default 0
   */
  y?: number

  /**
   * Additional CSS classes
   */
  className?: string
}

export interface ChartAxisTick<T extends ChartScaleValue = ChartScaleValue> {
  value: T
  position: number
  label: string
}
