import type { BaseChartProps, ChartInteractionProps } from './chart'

export interface OrgChartNode {
  id: string | number
  label: string
  title?: string
  subtitle?: string
  avatar?: string
  color?: string
  children?: OrgChartNode[]
  disabled?: boolean
  data?: Record<string, unknown>
}

export type OrgChartDirection = 'vertical' | 'horizontal'

export interface OrgChartProps
  extends BaseChartProps, Omit<ChartInteractionProps, 'selectedIndex' | 'hoveredIndex'> {
  data: OrgChartNode | OrgChartNode[]
  /**
   * Chart width. Grows to the laid-out tree when the tree is wider.
   * @default 720
   */
  width?: number
  /**
   * Chart height. Grows to the laid-out tree when the tree is taller.
   * @default 420
   */
  height?: number
  nodeWidth?: number
  nodeHeight?: number
  levelGap?: number
  siblingGap?: number
  /**
   * `horizontal` is left-to-right. Cards keep `nodeWidth` × `nodeHeight`.
   * @default 'vertical'
   */
  direction?: OrgChartDirection
  showAvatars?: boolean
  showSubtitles?: boolean
  colors?: string[]
  selectedId?: string | number | null
  ariaLabel?: string
}
