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
  extends BaseChartProps, Omit<ChartInteractionProps, 'selectedIndex'> {
  data: OrgChartNode | OrgChartNode[]
  nodeWidth?: number
  nodeHeight?: number
  levelGap?: number
  siblingGap?: number
  direction?: OrgChartDirection
  showAvatars?: boolean
  showSubtitles?: boolean
  colors?: string[]
  selectedId?: string | number | null
  ariaLabel?: string
}
