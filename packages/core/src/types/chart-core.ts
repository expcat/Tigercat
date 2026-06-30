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

/**
 * Curve interpolation type for line/area charts
 */
export type ChartCurveType = 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter' | 'natural'

/**
 * Legend position
 */
export type ChartLegendPosition = 'top' | 'bottom' | 'left' | 'right'

/**
 * Common base props for all high-level chart components
 */
export interface BaseChartProps {
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
   * Accessible title for the SVG
   */
  title?: string

  /**
   * Accessible description for the SVG
   */
  desc?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Common interaction props for charts
 */
export interface ChartInteractionProps {
  /**
   * Enable hover highlight
   * @default false
   */
  hoverable?: boolean

  /**
   * Hovered index (controlled)
   */
  hoveredIndex?: number | null

  /**
   * Opacity for active/hovered element
   * @default 1
   */
  activeOpacity?: number

  /**
   * Opacity for inactive elements when one is active
   * @default 0.25
   */
  inactiveOpacity?: number

  /**
   * Enable click selection
   * @default false
   */
  selectable?: boolean

  /**
   * Selected index (controlled)
   */
  selectedIndex?: number | null
}

/**
 * Common legend props for charts
 */
export interface ChartLegendProps {
  /**
   * Whether to show legend
   * @default false
   */
  showLegend?: boolean

  /**
   * Legend position
   * @default 'bottom'
   */
  legendPosition?: ChartLegendPosition

  /**
   * Legend marker size in px
   * @default 10
   */
  legendMarkerSize?: number

  /**
   * Legend item gap in px
   * @default 8
   */
  legendGap?: number
}

/**
 * Common built-in tooltip toggle props for high-level charts.
 */
export interface ChartBuiltInTooltipProps {
  /**
   * Whether to show tooltip
   * @default true
   */
  showTooltip?: boolean
}

/**
 * Standalone chart tooltip props.
 */
export interface ChartTooltipProps {
  /**
   * Tooltip content
   */
  content: string

  /**
   * Whether the tooltip is open
   * @default false
   */
  open?: boolean

  /**
   * Viewport X position
   * @default 0
   */
  x?: number

  /**
   * Viewport Y position
   * @default 0
   */
  y?: number

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Common props for charts with X/Y axes (Bar, Line, Area, Scatter)
 */
export interface ChartWithAxesProps {
  /**
   * Custom x scale
   */
  xScale?: ChartScale

  /**
   * Custom y scale
   */
  yScale?: ChartScale

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
   * Whether to show X axis
   * @default true
   */
  showXAxis?: boolean

  /**
   * Whether to show Y axis
   * @default true
   */
  showYAxis?: boolean

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
  yTickValues?: number[]

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
}

/**
 * Legend item data
 */
export interface ChartLegendItem {
  /**
   * Item index
   */
  index: number

  /**
   * Display label
   */
  label: string

  /**
   * Color
   */
  color: string

  /**
   * Whether this item is active/selected
   */
  active?: boolean
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
   * Resize the SVG to its parent container using ResizeObserver
   * @default false
   */
  responsive?: boolean

  /**
   * Inner padding for chart drawing area
   * @default 24
   */
  padding?: ChartPadding

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Accessible title for the SVG
   */
  title?: string

  /**
   * Accessible description for the SVG
   */
  desc?: string
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
  x?: ChartScaleValue
  y?: ChartScaleValue
  value?: number
  label?: string
  color?: string
  size?: number
}

export interface ChartSeriesProps<T = ChartSeriesPoint> {
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
