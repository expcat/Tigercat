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

export interface ChartScale {
  type: ChartScaleType
  domain: ChartScaleValue[]
  range: [number, number]
  map: (value: ChartScaleValue) => number
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

export interface ChartAxisProps {
  /**
   * Axis orientation
   * @default 'bottom'
   */
  orientation?: ChartAxisOrientation

  /**
   * Axis scale
   */
  scale: ChartScale

  /**
   * Number of ticks (only for linear scale)
   * @default 5
   */
  ticks?: number

  /**
   * Explicit tick values
   */
  tickValues?: ChartScaleValue[]

  /**
   * Tick label formatter
   */
  tickFormat?: (value: ChartScaleValue) => string

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

export interface ChartAxisTick {
  value: ChartScaleValue
  position: number
  label: string
}

export type ChartGridLine = 'x' | 'y' | 'both'

export type ChartGridLineStyle = 'solid' | 'dashed' | 'dotted'

export interface ChartGridProps {
  /**
   * X axis scale
   */
  xScale?: ChartScale

  /**
   * Y axis scale
   */
  yScale?: ChartScale

  /**
   * Show grid lines
   * @default 'both'
   */
  show?: ChartGridLine

  /**
   * X axis tick count
   * @default 5
   */
  xTicks?: number

  /**
   * Y axis tick count
   * @default 5
   */
  yTicks?: number

  /**
   * Explicit X tick values
   */
  xTickValues?: ChartScaleValue[]

  /**
   * Explicit Y tick values
   */
  yTickValues?: ChartScaleValue[]

  /**
   * Grid line style
   * @default 'solid'
   */
  lineStyle?: ChartGridLineStyle

  /**
   * Line stroke width
   * @default 1
   */
  strokeWidth?: number

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

export type ChartSeriesType = 'bar' | 'scatter' | 'line' | 'area' | 'pie' | 'radar' | 'custom'

export interface ChartSeriesPoint {
  x: ChartScaleValue
  y: ChartScaleValue
  value?: number
  label?: string
  color?: string
  size?: number
}

export interface ChartSeriesProps<T extends ChartSeriesPoint = ChartSeriesPoint> {
  /**
   * Series data
   */
  data: T[]

  /**
   * Series name
   */
  name?: string

  /**
   * Series color
   */
  color?: string

  /**
   * Series opacity
   */
  opacity?: number

  /**
   * Series type hint
   */
  type?: ChartSeriesType

  /**
   * Additional CSS classes
   */
  className?: string
}

export interface BarChartDatum {
  x: ChartScaleValue
  y: number
  color?: string
  label?: string
}

export interface BarChartProps {
  /**
   * Chart width
   * @default 320
   */
  width?: number

  /**
   * Chart height
   * @default 200
   */
  height?: number

  /**
   * Chart padding
   * @default 24
   */
  padding?: ChartPadding

  /**
   * Chart data
   */
  data: BarChartDatum[]

  /**
   * Custom x scale
   */
  xScale?: ChartScale

  /**
   * Custom y scale
   */
  yScale?: ChartScale

  /**
   * Bar color
   */
  barColor?: string

  /**
   * Bar corner radius
   * @default 4
   */
  barRadius?: number

  /**
   * Inner padding ratio for bars
   * @default 0.2
   */
  barPaddingInner?: number

  /**
   * Outer padding ratio for bars
   * @default 0.1
   */
  barPaddingOuter?: number

  /**
   * Whether to show grid
   * @default true
   */
  showGrid?: boolean

  /**
   * Whether to show axes
   * @default true
   */
  showAxis?: boolean

  /**
   * X axis label
   */
  xAxisLabel?: string

  /**
   * Y axis label
   */
  yAxisLabel?: string

  /**
   * X ticks
   * @default 5
   */
  xTicks?: number

  /**
   * Y ticks
   * @default 5
   */
  yTicks?: number

  /**
   * X tick values
   */
  xTickValues?: ChartScaleValue[]

  /**
   * Y tick values
   */
  yTickValues?: ChartScaleValue[]

  /**
   * X tick format
   */
  xTickFormat?: (value: ChartScaleValue) => string

  /**
   * Y tick format
   */
  yTickFormat?: (value: ChartScaleValue) => string

  /**
   * Grid line style
   * @default 'solid'
   */
  gridLineStyle?: ChartGridLineStyle

  /**
   * Grid stroke width
   * @default 1
   */
  gridStrokeWidth?: number

  /**
   * Additional CSS classes
   */
  className?: string
}

export interface ScatterChartDatum {
  x: number
  y: number
  size?: number
  color?: string
  label?: string
}

export interface ScatterChartProps {
  /**
   * Chart width
   * @default 320
   */
  width?: number

  /**
   * Chart height
   * @default 200
   */
  height?: number

  /**
   * Chart padding
   * @default 24
   */
  padding?: ChartPadding

  /**
   * Chart data
   */
  data: ScatterChartDatum[]

  /**
   * Custom x scale
   */
  xScale?: ChartScale

  /**
   * Custom y scale
   */
  yScale?: ChartScale

  /**
   * Point size
   * @default 4
   */
  pointSize?: number

  /**
   * Point color
   */
  pointColor?: string

  /**
   * Point opacity
   */
  pointOpacity?: number

  /**
   * Whether to show grid
   * @default true
   */
  showGrid?: boolean

  /**
   * Whether to show axes
   * @default true
   */
  showAxis?: boolean

  /**
   * Include zero in domain
   * @default false
   */
  includeZero?: boolean

  /**
   * X axis label
   */
  xAxisLabel?: string

  /**
   * Y axis label
   */
  yAxisLabel?: string

  /**
   * X ticks
   * @default 5
   */
  xTicks?: number

  /**
   * Y ticks
   * @default 5
   */
  yTicks?: number

  /**
   * X tick values
   */
  xTickValues?: ChartScaleValue[]

  /**
   * Y tick values
   */
  yTickValues?: ChartScaleValue[]

  /**
   * X tick format
   */
  xTickFormat?: (value: ChartScaleValue) => string

  /**
   * Y tick format
   */
  yTickFormat?: (value: ChartScaleValue) => string

  /**
   * Grid line style
   * @default 'solid'
   */
  gridLineStyle?: ChartGridLineStyle

  /**
   * Grid stroke width
   * @default 1
   */
  gridStrokeWidth?: number

  /**
   * Additional CSS classes
   */
  className?: string
}
