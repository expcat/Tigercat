import type { BaseChartProps, ChartInteractionProps } from './chart'

export type GanttDateValue = Date | string | number

export type GanttScale = 'day' | 'week' | 'month'

export interface GanttTask {
  id: string | number
  label: string
  start: GanttDateValue
  end: GanttDateValue
  progress?: number
  color?: string
  group?: string
  dependencies?: Array<string | number>
  disabled?: boolean
  data?: Record<string, unknown>
}

export interface GanttProps extends BaseChartProps, Omit<ChartInteractionProps, 'selectedIndex'> {
  data: GanttTask[]
  scale?: GanttScale
  rowHeight?: number
  barHeight?: number
  taskLabelWidth?: number
  timelineHeight?: number
  minDate?: GanttDateValue
  maxDate?: GanttDateValue
  minBarWidth?: number
  showToday?: boolean
  showProgress?: boolean
  showDependencies?: boolean
  dateFormatter?: (date: Date, scale: GanttScale) => string
  colors?: string[]
  selectedId?: string | number | null
  ariaLabel?: string
}
