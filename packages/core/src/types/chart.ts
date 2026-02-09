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
 * Common tooltip props for charts
 */
export interface ChartTooltipProps {
  /**
   * Whether to show tooltip
   * @default true
   */
  showTooltip?: boolean
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

/**
 * Value label position for bar charts
 */
export type BarValueLabelPosition = 'top' | 'inside'

export interface BarChartDatum {
  x: ChartScaleValue
  y: number
  color?: string
  label?: string
}

export interface BarChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartTooltipProps {
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
   * Custom colors for bars
   */
  colors?: string[]

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

  /**
   * Show value labels above or inside bars
   * @default false
   */
  showValueLabels?: boolean

  /**
   * Value label position
   * @default 'top'
   */
  valueLabelPosition?: BarValueLabelPosition

  /**
   * Value label formatter
   */
  valueLabelFormatter?: (datum: BarChartDatum, index: number) => string

  /**
   * Minimum bar height in px (ensures near-zero values remain visible)
   * @default 0
   */
  barMinHeight?: number

  /**
   * Maximum bar width in px (prevents overly wide bars with few data points)
   */
  barMaxWidth?: number

  /**
   * Enable linear gradient fill on bars (top-to-bottom, lighter to full)
   * @default false
   */
  gradient?: boolean

  /**
   * Enable CSS transitions for smooth bar updates
   * @default false
   */
  animated?: boolean

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (datum: BarChartDatum, index: number) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (datum: BarChartDatum, index: number) => string
}

export interface ScatterChartDatum {
  x: number
  y: number
  size?: number
  color?: string
  label?: string
}

export interface ScatterChartProps
  extends
    BaseChartProps,
    ChartInteractionProps,
    ChartLegendProps,
    ChartTooltipProps,
    ChartWithAxesProps {
  /**
   * Chart data
   */
  data: ScatterChartDatum[]

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
   * Include zero in domain
   * @default false
   */
  includeZero?: boolean

  /**
   * Custom colors for points
   */
  colors?: string[]

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (datum: ScatterChartDatum, index: number) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (datum: ScatterChartDatum, index: number) => string
}

export interface PieChartDatum extends ChartSeriesPoint {
  value: number
  label?: string
  color?: string
}

export interface PieChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartTooltipProps {
  /**
   * Chart data
   */
  data: PieChartDatum[]

  /**
   * Inner radius for donut
   * @default 0
   */
  innerRadius?: number

  /**
   * Outer radius
   */
  outerRadius?: number

  /**
   * Start angle in radians
   * @default 0
   */
  startAngle?: number

  /**
   * End angle in radians
   * @default Math.PI * 2
   */
  endAngle?: number

  /**
   * Padding angle in radians
   * @default 0
   */
  padAngle?: number

  /**
   * Custom colors
   */
  colors?: string[]

  /**
   * Whether to show labels
   * @default false
   */
  showLabels?: boolean

  /**
   * Label formatter
   */
  labelFormatter?: (value: number, datum: PieChartDatum, index: number) => string

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (datum: PieChartDatum, index: number) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (datum: PieChartDatum, index: number) => string

  /**
   * Border width between slices
   * @default 2
   */
  borderWidth?: number

  /**
   * Border color between slices
   * @default '#ffffff'
   */
  borderColor?: string

  /**
   * Distance slices translate outward on hover (ECharts emphasis style)
   * @default 8
   */
  hoverOffset?: number

  /**
   * Label position: inside the slice or outside with leader lines
   * @default 'inside'
   */
  labelPosition?: 'inside' | 'outside'

  /**
   * Enable drop shadow on slices
   * @default false
   */
  shadow?: boolean
}

export interface DonutChartDatum extends PieChartDatum {}

export interface DonutChartProps extends PieChartProps {
  /**
   * Inner radius ratio based on outer radius
   * @default 0.6
   */
  innerRadiusRatio?: number

  /**
   * Text shown as the main value in the donut center
   */
  centerValue?: string | number

  /**
   * Descriptive label shown below centerValue in the donut center
   */
  centerLabel?: string

  /**
   * Enable entrance animation (fade + scale)
   * @default false
   */
  animated?: boolean
}

export interface RadarChartDatum extends ChartSeriesPoint {
  value: number
  label?: string
  color?: string
}

export interface RadarChartSeries {
  /**
   * Series name
   */
  name?: string

  /**
   * Series data
   */
  data: RadarChartDatum[]

  /**
   * Base color
   */
  color?: string

  /**
   * Series opacity
   */
  opacity?: number

  /**
   * Polygon stroke color
   */
  strokeColor?: string

  /**
   * Polygon stroke width
   */
  strokeWidth?: number

  /**
   * Polygon fill color
   */
  fillColor?: string

  /**
   * Polygon fill opacity
   */
  fillOpacity?: number

  /**
   * Whether to show points
   */
  showPoints?: boolean

  /**
   * Point size
   */
  pointSize?: number

  /**
   * Point color
   */
  pointColor?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

// ============================================================================
// LineChart Types
// ============================================================================

export interface LineChartDatum {
  x: ChartScaleValue
  y: number
  label?: string
}

export interface LineChartSeries {
  /**
   * Series name
   */
  name?: string

  /**
   * Series data
   */
  data: LineChartDatum[]

  /**
   * Line color
   */
  color?: string

  /**
   * Line stroke width
   * @default 2
   */
  strokeWidth?: number

  /**
   * Line dash array (e.g., '5 5' for dashed)
   */
  strokeDasharray?: string

  /**
   * Whether to show data points
   * @default true
   */
  showPoints?: boolean

  /**
   * Point size
   * @default 4
   */
  pointSize?: number

  /**
   * Point color (defaults to line color)
   */
  pointColor?: string

  /**
   * Hollow point style (stroke + white fill, ECharts emptyCircle)
   * @default false
   */
  pointHollow?: boolean

  /**
   * Show gradient area fill under line
   * @default false
   */
  showArea?: boolean

  /**
   * Area fill opacity
   * @default 0.15
   */
  areaOpacity?: number

  /**
   * Additional CSS classes for this series
   */
  className?: string
}

export interface LineChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartTooltipProps {
  /**
   * Chart data (single series)
   */
  data?: LineChartDatum[]

  /**
   * Multiple series
   */
  series?: LineChartSeries[]

  /**
   * Custom x scale
   */
  xScale?: ChartScale

  /**
   * Custom y scale
   */
  yScale?: ChartScale

  /**
   * Line color (for single series)
   */
  lineColor?: string

  /**
   * Line stroke width
   * @default 2
   */
  strokeWidth?: number

  /**
   * Curve interpolation type
   * @default 'linear'
   */
  curve?: ChartCurveType

  /**
   * Whether to show data points
   * @default true
   */
  showPoints?: boolean

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
   * Include zero in Y domain
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

  /**
   * Custom colors for multi-series
   */
  colors?: string[]

  /**
   * Show gradient area fill under lines
   * @default false
   */
  showArea?: boolean

  /**
   * Area fill opacity
   * @default 0.15
   */
  areaOpacity?: number

  /**
   * Hollow point style (stroke + white fill, ECharts emptyCircle)
   * @default false
   */
  pointHollow?: boolean

  /**
   * Enable line draw entrance animation
   * @default false
   */
  animated?: boolean

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (
    datum: LineChartDatum,
    seriesIndex: number,
    index: number,
    series?: LineChartSeries
  ) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (series: LineChartSeries, index: number) => string
}

// ============================================================================
// AreaChart Types
// ============================================================================

export interface AreaChartDatum extends LineChartDatum {}

export interface AreaChartSeries extends LineChartSeries {
  /**
   * Fill color (defaults to line color)
   */
  fillColor?: string

  /**
   * Fill opacity
   * @default 0.2
   */
  fillOpacity?: number
}

export interface AreaChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartTooltipProps {
  /**
   * Chart data (single series)
   */
  data?: AreaChartDatum[]

  /**
   * Multiple series
   */
  series?: AreaChartSeries[]

  /**
   * Custom x scale
   */
  xScale?: ChartScale

  /**
   * Custom y scale
   */
  yScale?: ChartScale

  /**
   * Line/area color (for single series)
   */
  areaColor?: string

  /**
   * Line stroke width
   * @default 2
   */
  strokeWidth?: number

  /**
   * Fill opacity
   * @default 0.2
   */
  fillOpacity?: number

  /**
   * Curve interpolation type
   * @default 'linear'
   */
  curve?: ChartCurveType

  /**
   * Whether to show data points
   * @default false
   */
  showPoints?: boolean

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
   * Whether to stack areas
   * @default false
   */
  stacked?: boolean

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
   * Include zero in Y domain
   * @default true (different from LineChart)
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

  /**
   * Custom colors for multi-series
   */
  colors?: string[]

  /**
   * Enable linear gradient fill (top-to-bottom, ECharts style)
   * @default false
   */
  gradient?: boolean

  /**
   * Hollow point style (stroke + white fill, ECharts emptyCircle)
   * @default false
   */
  pointHollow?: boolean

  /**
   * Enable line draw entrance animation
   * @default false
   */
  animated?: boolean

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (
    datum: AreaChartDatum,
    seriesIndex: number,
    index: number,
    series?: AreaChartSeries
  ) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (series: AreaChartSeries, index: number) => string
}
export interface RadarChartProps extends BaseChartProps, ChartLegendProps, ChartTooltipProps {
  /**
   * Chart data (single series)
   */
  data?: RadarChartDatum[]

  /**
   * Multiple series
   */
  series?: RadarChartSeries[]

  /**
   * Max value for radius scaling
   */
  maxValue?: number

  /**
   * Start angle in radians
   * @default -Math.PI / 2
   */
  startAngle?: number

  /**
   * Grid levels
   * @default 5
   */
  levels?: number

  /**
   * Whether to show level labels
   * @default false
   */
  showLevelLabels?: boolean

  /**
   * Whether to show grid
   * @default true
   */
  showGrid?: boolean

  /**
   * Whether to show axis lines
   * @default true
   */
  showAxis?: boolean

  /**
   * Whether to show labels
   * @default true
   */
  showLabels?: boolean

  /**
   * Label offset from outer radius
   * @default 12
   */
  labelOffset?: number

  /**
   * Label formatter
   */
  labelFormatter?: (datum: RadarChartDatum, index: number) => string

  /**
   * Level label formatter
   */
  levelLabelFormatter?: (value: number, level: number) => string

  /**
   * Level label offset
   * @default 8
   */
  levelLabelOffset?: number

  /**
   * Enable hover highlight
   * @default false
   */
  hoverable?: boolean

  /**
   * Hovered series index (controlled)
   */
  hoveredIndex?: number | null

  /**
   * Opacity for active/hovered series
   * @default 1
   */
  activeOpacity?: number

  /**
   * Opacity for inactive series
   * @default 0.25
   */
  inactiveOpacity?: number

  /**
   * Enable click selection
   * @default false
   */
  selectable?: boolean

  /**
   * Selected series index (controlled)
   */
  selectedIndex?: number | null

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (
    datum: RadarChartDatum,
    seriesIndex: number,
    index: number,
    series?: RadarChartSeries
  ) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (series: RadarChartSeries, index: number) => string

  /**
   * Colors for series
   */
  colors?: string[]

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
   * Polygon stroke color
   */
  strokeColor?: string

  /**
   * Polygon stroke width
   * @default 2
   */
  strokeWidth?: number

  /**
   * Polygon fill color
   */
  fillColor?: string

  /**
   * Polygon fill opacity
   * @default 0.2
   */
  fillOpacity?: number

  /**
   * Whether to show data points
   * @default true
   */
  showPoints?: boolean

  /**
   * Point size
   * @default 3
   */
  pointSize?: number

  /**
   * Point color
   */
  pointColor?: string
}
