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
   * Chart padding. Default leaves room for ChartAxis labels
   * (`labelOffset` 28 + tick + dy).
   * @default { top: 24, right: 24, bottom: 52, left: 52 }
   */
  padding?: ChartPadding

  /**
   * Whether the SVG should observe its container and resize responsively.
   * @default false
   */
  responsive?: boolean

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
 * Legend toggle props mixed into high-level charts.
 * Placement around the plot is the chart shell, not ChartLegend.
 */
export interface ChartLegendToggleProps {
  /**
   * Whether to show legend
   * @default false
   */
  showLegend?: boolean

  /**
   * Legend position around the plot
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
 * Legend row orientation. Plot placement is the parent shell.
 */
export type ChartLegendOrientation = 'horizontal' | 'vertical'

/**
 * Standalone ChartLegend component props.
 */
export interface ChartLegendProps {
  /**
   * Legend items
   */
  items: ChartLegendItem[]

  /**
   * Row vs column layout
   * @default 'horizontal'
   */
  orientation?: ChartLegendOrientation

  /**
   * Marker size in px
   * @default 10
   */
  markerSize?: number

  /**
   * Item gap in px
   * @default 8
   */
  gap?: number

  /**
   * Whether items are buttons
   * @default false
   */
  interactive?: boolean

  /**
   * Accessible name. Defaults to locale `chart.legendAriaLabel`.
   */
  ariaLabel?: string

  /**
   * Additional CSS classes
   */
  className?: string
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
   * Tooltip content. Optional when the framework slot / children render nodes.
   */
  content?: string

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
   * Visual highlight (full opacity). Not pressed.
   */
  active?: boolean

  /**
   * Selection; drives `aria-pressed` when the legend is interactive.
   */
  selected?: boolean
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
   * Observe the canvas host (not a legend sibling) and resize the SVG
   * @default false
   */
  responsive?: boolean

  /**
   * Resolved SVG size after the parent is observed (`responsive`) or the
   * `width`/`height` fallback. Framework wrappers also emit this as
   * `onResolvedSizeChange` / `resolved-size-change`.
   */
  onResolvedSizeChange?: (size: { width: number; height: number }) => void

  /**
   * Inner padding for chart drawing area. Default covers ChartAxis labels.
   * @default { top: 24, right: 24, bottom: 52, left: 52 }
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

export interface ChartCanvasRenderContext {
  innerRect: {
    x: number
    y: number
    width: number
    height: number
  }
  width: number
  height: number
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
   * Explicit x extent when `yScale` is omitted (horizontal line endpoints)
   */
  xRange?: [number, number]

  /**
   * Explicit y extent when `xScale` is omitted (vertical line endpoints)
   */
  yRange?: [number, number]

  /**
   * Plot width used as `[0, width]` when `xRange` / `xScale.range` is missing
   */
  width?: number

  /**
   * Plot height used as `[0, height]` when `yRange` / `yScale.range` is missing
   */
  height?: number

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
