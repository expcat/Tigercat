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
   * Accessible title for the SVG
   */
  title?: string

  /**
   * Accessible description for the SVG
   */
  desc?: string

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

export interface PieChartDatum extends ChartSeriesPoint {
  value: number
  label?: string
  color?: string
}

export interface PieChartProps {
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
   * Additional CSS classes
   */
  className?: string
}

export interface DonutChartDatum extends PieChartDatum {}

export interface DonutChartProps extends PieChartProps {
  /**
   * Inner radius ratio based on outer radius
   * @default 0.6
   */
  innerRadiusRatio?: number
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

export interface RadarChartProps {
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
  data?: RadarChartDatum[]

  /**
   * Series list
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
   * Active series index (controlled)
   */
  activeSeriesIndex?: number

  /**
   * Opacity for active series
   * @default 1
   */
  hoverOpacity?: number

  /**
   * Opacity for inactive series
   * @default 0.25
   */
  mutedOpacity?: number

  /**
   * Whether to show tooltip on points
   * @default true
   */
  showTooltip?: boolean

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
   * Enable click selection
   * @default false
   */
  selectable?: boolean

  /**
   * Selected series index (controlled)
   */
  selectedSeriesIndex?: number

  /**
   * Whether to show legend
   * @default false
   */
  showLegend?: boolean

  /**
   * Legend position
   * @default 'bottom'
   */
  legendPosition?: 'bottom' | 'right'

  /**
   * Legend formatter
   */
  legendFormatter?: (series: RadarChartSeries, index: number) => string

  /**
   * Legend marker size
   * @default 10
   */
  legendMarkerSize?: number

  /**
   * Legend item gap
   * @default 8
   */
  legendGap?: number

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

  /**
   * Additional CSS classes
   */
  className?: string
}
