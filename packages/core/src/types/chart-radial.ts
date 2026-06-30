/**
 * Radial chart types.
 */

import type {
  BaseChartProps,
  ChartGridLineStyle,
  ChartInteractionProps,
  ChartLegendProps,
  ChartSeriesPoint,
  ChartBuiltInTooltipProps
} from './chart-core'

export interface PieChartDatum extends ChartSeriesPoint {
  value: number
  label?: string
  color?: string
}

export interface PieChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
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

  /**
   * Enable per-slice top→bottom alpha gradient fill (1.0 → 0.7).
   * Opt-in; default `false` keeps the original solid `arc.color` fill.
   * @default false
   */
  gradient?: boolean
}

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
   * Point border width (stroke around data points)
   */
  pointBorderWidth?: number

  /**
   * Point border color
   */
  pointBorderColor?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

export interface RadarChartProps
  extends BaseChartProps, ChartLegendProps, ChartBuiltInTooltipProps {
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

  /**
   * Grid shape: polygon (default) or circle (ECharts style)
   * @default 'polygon'
   */
  gridShape?: 'polygon' | 'circle'

  /**
   * Show alternating split area fills between grid levels
   * @default false
   */
  showSplitArea?: boolean

  /**
   * Split area fill opacity
   * @default 0.06
   */
  splitAreaOpacity?: number

  /**
   * Split area colors (alternates between entries)
   */
  splitAreaColors?: string[]

  /**
   * Point border width (white ring around data points)
   * @default 2
   */
  pointBorderWidth?: number

  /**
   * Point border color
   * @default '#fff'
   */
  pointBorderColor?: string

  /**
   * Point size when hovered (enlargement effect)
   */
  pointHoverSize?: number

  /**
   * Auto-align axis labels based on their angle position
   * @default true
   */
  labelAutoAlign?: boolean

  /**
   * Render each series polygon stroke as a 3-stop vertical gradient
   * (lighter → base → darker) derived from the series color via
   * `color-mix(in oklab, …)`. Provides a subtle modern brightness ramp
   * without requiring palette knowledge. Opt-in; defaults to flat stroke.
   * @default false
   */
  strokeGradient?: boolean

  /**
   * Render data point fill as a per-series `<radialGradient>` (bright center
   * → series color edge) for a 3D-sphere look. Only applies when `showPoints`
   * is true (default).
   * @default false
   */
  pointGradient?: boolean
}

// -------------------------------------------------------------------
// Gauge Chart
// -------------------------------------------------------------------

export interface GaugeChartProps extends BaseChartProps, ChartBuiltInTooltipProps {
  /**
   * Current value
   */
  value: number

  /**
   * Minimum value of the scale
   * @default 0
   */
  min?: number

  /**
   * Maximum value of the scale
   * @default 100
   */
  max?: number

  /**
   * Start angle in degrees (0 = 3 o'clock, counter-clockwise)
   * @default 135
   */
  startAngle?: number

  /**
   * End angle in degrees
   * @default 405
   */
  endAngle?: number

  /**
   * Arc stroke width in px
   * @default 20
   */
  arcWidth?: number

  /**
   * Whether to show tick marks
   * @default true
   */
  showTicks?: boolean

  /**
   * Number of major ticks
   * @default 5
   */
  tickCount?: number

  /**
   * Value label format function
   */
  valueFormatter?: (value: number) => string

  /**
   * Tooltip content formatter. Receives the current value; defaults to the
   * formatted value (prefixed with `label` when present).
   */
  tooltipFormatter?: (value: number) => string

  /**
   * Label shown below the value
   */
  label?: string

  /**
   * Color segments along the arc. Array of { range: [from, to], color }
   */
  segments?: Array<{
    range: [number, number]
    color: string
  }>

  /**
   * Default arc track color
   * @default 'var(--tiger-border,#e5e7eb)'
   */
  trackColor?: string

  /**
   * Default arc fill color
   * @default 'var(--tiger-primary,#2563eb)'
   */
  color?: string

  /**
   * Palette of colors
   */
  colors?: string[]

  /**
   * When true, the value arc is rendered with a vertical alpha gradient
   * (top: full opacity → bottom: low opacity) using a per-instance
   * `<linearGradient>` definition. Opt-in; default keeps the solid arc fill.
   * @default false
   */
  gradient?: boolean
}
