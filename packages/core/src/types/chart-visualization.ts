/**
 * Visualization chart types.
 */

import type {
  BaseChartProps,
  ChartInteractionProps,
  ChartLegendProps,
  ChartScaleValue,
  ChartSeriesPoint,
  ChartBuiltInTooltipProps
} from './chart-core'

// -------------------------------------------------------------------
// Funnel Chart
// -------------------------------------------------------------------

export interface FunnelChartDatum extends ChartSeriesPoint {
  /** Stage / step label */
  label?: string
  /** Numeric value (determines width) */
  value: number
  /** Optional color override */
  color?: string
}

export interface FunnelChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
  /**
   * Data items — ordered from widest to narrowest
   */
  data: FunnelChartDatum[]

  /**
   * Vertical or horizontal layout
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal'

  /**
   * Gap between funnel segments in px
   * @default 2
   */
  gap?: number

  /**
   * Whether the last segment tapers to a point
   * @default false
   */
  pinch?: boolean

  /**
   * Palette of colors
   */
  colors?: string[]

  /**
   * Render each segment with a vertical alpha gradient (top opaque → bottom faded).
   * Opt-in; defaults to flat fill so existing visuals stay 1:1.
   * @default false
   */
  gradient?: boolean
}

// -------------------------------------------------------------------
// Heatmap Chart
// -------------------------------------------------------------------

export interface HeatmapChartDatum {
  /** X-axis index or label */
  x: ChartScaleValue
  /** Y-axis index or label */
  y: ChartScaleValue
  /** Heat value */
  value: number
}

export interface HeatmapChartProps
  extends BaseChartProps, ChartInteractionProps, ChartBuiltInTooltipProps {
  /**
   * Data points
   */
  data: HeatmapChartDatum[]

  /**
   * X-axis labels
   */
  xLabels: string[]

  /**
   * Y-axis labels
   */
  yLabels: string[]

  /**
   * Min color (for lowest value)
   * @default '#f0f9ff'
   */
  minColor?: string

  /**
   * Max color (for highest value)
   * @default 'var(--tiger-primary,#2563eb)'
   */
  maxColor?: string

  /**
   * Cell border radius in px
   * @default 2
   */
  cellRadius?: number

  /**
   * Gap between cells in px
   * @default 1
   */
  cellGap?: number

  /**
   * Whether to show value labels inside cells
   * @default false
   */
  showValues?: boolean

  /**
   * Value format function
   */
  valueFormatter?: (value: number) => string

  /**
   * Palette of colors
   */
  colors?: string[]

  /**
   * Colour interpolation space for cell fills.
   * - `'rgb'` (default): legacy linear hex interpolation between
   *   `minColor` and `maxColor`.
   * - `'oklch'`: emit a CSS `color-mix(in oklch, ...)` expression so the
   *   browser performs perceptually-uniform shading. Recommended when
   *   `minColor`/`maxColor` are CSS colour functions or theme tokens.
   * @default 'rgb'
   */
  colorSpace?: 'rgb' | 'oklch'

  /**
   * Rendering backend for heatmap cells.
   * - `'svg'`: render one `<rect>` per cell.
   * - `'canvas'`: draw cells into a canvas layer for large matrices.
   * - `'auto'`: switch to canvas when cell count exceeds `canvasThreshold`.
   * @default 'auto'
   */
  renderMode?: 'svg' | 'canvas' | 'auto'

  /**
   * Cell count threshold used when `renderMode` is `'auto'`.
   * @default 1000
   */
  canvasThreshold?: number
}

// -------------------------------------------------------------------
// TreeMap Chart
// -------------------------------------------------------------------

export interface TreeMapChartDatum {
  /** Node label */
  label: string
  /** Node value (determines area) */
  value: number
  /** Optional color override */
  color?: string
  /** Nested children */
  children?: TreeMapChartDatum[]
}

export interface TreeMapChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
  /**
   * Hierarchical data
   */
  data: TreeMapChartDatum[]

  /**
   * Gap between nodes in px
   * @default 2
   */
  gap?: number

  /**
   * Whether to show labels inside nodes
   * @default true
   */
  showLabels?: boolean

  /**
   * Minimum font size for labels (hide if cell too small)
   * @default 10
   */
  minLabelSize?: number

  /**
   * Palette of colors
   */
  colors?: string[]

  /**
   * Whether to apply a top-to-bottom alpha gradient to each node fill
   * for a subtle "lit from above" depth effect (opt-in, default `false`).
   * @default false
   */
  gradient?: boolean
}

// -------------------------------------------------------------------
// Sunburst Chart
// -------------------------------------------------------------------

export interface SunburstChartDatum {
  /** Arc label */
  label: string
  /** Arc value */
  value: number
  /** Optional color override */
  color?: string
  /** Nested children */
  children?: SunburstChartDatum[]
}

export interface SunburstChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendProps, ChartBuiltInTooltipProps {
  /**
   * Hierarchical data
   */
  data: SunburstChartDatum[]

  /**
   * Inner radius ratio (0 = no hole, 0.3 = donut-like)
   * @default 0
   */
  innerRadiusRatio?: number

  /**
   * Whether to show labels on arcs
   * @default true
   */
  showLabels?: boolean

  /**
   * Palette of colors
   */
  colors?: string[]

  /**
   * Whether to apply a top-to-bottom alpha gradient to each arc fill
   * for a subtle "lit from above" depth effect (opt-in, default `false`).
   * @default false
   */
  gradient?: boolean
}
