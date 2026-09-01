/**
 * Visualization chart types.
 */

import type {
  BaseChartProps,
  ChartInteractionProps,
  ChartLegendToggleProps,
  ChartPadding,
  ChartScaleValue,
  ChartBuiltInTooltipProps
} from './chart-core'

// -------------------------------------------------------------------
// Funnel Chart
// -------------------------------------------------------------------

export interface FunnelChartDatum {
  /** Stage / step label */
  label?: string
  /** Numeric value (determines width) */
  value: number
  /** Optional color override */
  color?: string
}

export interface FunnelChartProps
  extends BaseChartProps, ChartInteractionProps, ChartLegendToggleProps, ChartBuiltInTooltipProps {
  /**
   * Data items — ordered from widest to narrowest
   */
  data: FunnelChartDatum[]

  /**
   * Chart height
   * @default 300
   */
  height?: number

  /**
   * Vertical or horizontal layout. Horizontal grows along x; height follows value.
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
   * Render each segment with a vertical alpha gradient in funnel user space.
   * @default false
   */
  gradient?: boolean

  /**
   * Whether to draw stage labels on the segments
   * @default true
   */
  showLabels?: boolean

  /**
   * Tooltip formatter
   */
  tooltipFormatter?: (datum: FunnelChartDatum, index: number) => string
}

// -------------------------------------------------------------------
// Heatmap Chart
// -------------------------------------------------------------------

export interface HeatmapChartDatum {
  /**
   * Column label matching `xLabels`, or a 0-based column index.
   */
  x: ChartScaleValue
  /**
   * Row label matching `yLabels`, or a 0-based row index.
   */
  y: ChartScaleValue
  /** Heat value */
  value: number
}

export interface HeatmapChartProps
  extends BaseChartProps, ChartInteractionProps, ChartBuiltInTooltipProps {
  /**
   * Data points. Lookup is by label, or by 0-based column/row index.
   * `hoveredIndex` / `selectedIndex` are row-major cell indices
   * (`row * xLabels.length + col`), not `data[]` offsets.
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
   * Chart width
   * @default 400
   */
  width?: number

  /**
   * Chart height
   * @default 300
   */
  height?: number

  /**
   * Padding for self-drawn axis labels (not cartesian axis titles)
   * @default 40
   */
  padding?: ChartPadding

  /**
   * Min color (for lowest value)
   * @default '#f0f9ff'
   */
  minColor?: string

  /**
   * Max color (for highest value)
   * @default '#2563eb'
   */
  maxColor?: string

  /**
   * Override the colour-domain minimum. Default is the data min
   * (missing cells and non-finite values are skipped).
   */
  min?: number

  /**
   * Override the colour-domain maximum. Default is the data max.
   */
  max?: number

  /**
   * Cell border radius in px. The SVG `rx` attribute wins over theme tokens.
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
   * Tooltip formatter. Receives the cell's original datum (or `null` for a
   * missing cell) and the row-major cell index.
   */
  tooltipFormatter?: (datum: HeatmapChartDatum | null, index: number) => string

  /**
   * Colour interpolation space for cell fills.
   * - `'rgb'` (default): linear hex interpolation between `minColor` and
   *   `maxColor`. Unparseable colours fall back to the default hex range.
   * - `'oklch'`: emit a CSS `color-mix(in oklch, ...)` expression.
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
  extends BaseChartProps, ChartInteractionProps, ChartLegendToggleProps, ChartBuiltInTooltipProps {
  /**
   * Hierarchical data. Parent rectangles contain children (nested squarify).
   */
  data: TreeMapChartDatum[]

  /**
   * Chart width
   * @default 400
   */
  width?: number

  /**
   * Chart height
   * @default 300
   */
  height?: number

  /**
   * Gap around nodes, not cartesian axis padding
   * @default 8
   */
  padding?: ChartPadding

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
   * Node corner radius in px. The SVG `rx` attribute wins over theme tokens.
   * @default 2
   */
  nodeRadius?: number

  /**
   * Palette of colors
   */
  colors?: string[]

  /**
   * Whether to apply a top-to-bottom alpha gradient in chart user space
   * @default false
   */
  gradient?: boolean

  /**
   * Tooltip formatter. Receives the node's original datum and layout index.
   */
  tooltipFormatter?: (datum: TreeMapChartDatum, index: number) => string
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
  extends BaseChartProps, ChartInteractionProps, ChartLegendToggleProps, ChartBuiltInTooltipProps {
  /**
   * Hierarchical data. Arcs start at 12 o'clock and run clockwise.
   * Shallow leaves fill through to the outer radius.
   */
  data: SunburstChartDatum[]

  /**
   * Chart width
   * @default 320
   */
  width?: number

  /**
   * Chart height
   * @default 320
   */
  height?: number

  /**
   * Padding around the rings (not cartesian axis padding)
   * @default 24
   */
  padding?: ChartPadding

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
   * Palette of colors. Children inherit the parent colour unless they set `color`.
   */
  colors?: string[]

  /**
   * Whether to apply a 12-o'clock vertical alpha gradient in user space
   * @default false
   */
  gradient?: boolean

  /**
   * Tooltip formatter. Receives the arc's original datum and layout index.
   */
  tooltipFormatter?: (datum: SunburstChartDatum, index: number) => string
}
