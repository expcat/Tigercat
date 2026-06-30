/**
 * Cartesian chart types.
 */

import type {
  BaseChartProps,
  ChartCurveType,
  ChartGridLineStyle,
  ChartInteractionProps,
  ChartLegendProps,
  ChartScale,
  ChartScaleValue,
  ChartBuiltInTooltipProps,
  ChartWithAxesProps
} from './chart-core'

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
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
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
    ChartBuiltInTooltipProps,
    ChartWithAxesProps {
  /**
   * Chart data
   */
  data: ScatterChartDatum[]

  /**
   * Point size (radius)
   * @default 6
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
   * Point shape
   * @default 'circle'
   */
  pointStyle?: 'circle' | 'square' | 'triangle' | 'diamond'

  /**
   * Enable radial gradient fill for points
   * @default false
   */
  gradient?: boolean

  /**
   * Enable entrance animation with stagger
   * @default false
   */
  animated?: boolean

  /**
   * Point border (stroke) width
   * @default 0
   */
  pointBorderWidth?: number

  /**
   * Point border (stroke) color
   * @default 'white'
   */
  pointBorderColor?: string

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
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
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
   * Render line stroke as a 3-stop gradient (lighter → base → darker)
   * derived from each series color via `color-mix(in oklab, …)`. Provides
   * a subtle modern brightness ramp without requiring palette knowledge.
   * @default false
   */
  strokeGradient?: boolean

  /**
   * Render data point fill as a per-series `<radialGradient>` (bright center
   * → series color edge) for a hollow / 3D-sphere look. Has no effect on
   * points where `pointHollow` is true (those keep the white-fill + colored-stroke style).
   * @default false
   */
  pointGradient?: boolean

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
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
  /**
   * Chart data (single series)
   */
  data?: LineChartDatum[]

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
   * Render line stroke as a 3-stop horizontal gradient (lighter → base → darker)
   * derived from each series color via `color-mix(in oklab, …)`. Provides a
   * subtle modern brightness ramp without requiring palette knowledge.
   * @default false
   */
  strokeGradient?: boolean

  /**
   * Render data point fill as a per-series `<radialGradient>` (bright center
   * → series color edge) for a hollow / 3D-sphere look. Has no effect on
   * points where `pointHollow` is true (those keep the white-fill + colored-stroke style).
   * @default false
   */
  pointGradient?: boolean

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (
    datum: LineChartDatum,
    seriesIndex: number,
    index: number,
    series?: AreaChartSeries
  ) => string

  /**
   * Legend formatter
   */
  legendFormatter?: (series: AreaChartSeries, index: number) => string
}
