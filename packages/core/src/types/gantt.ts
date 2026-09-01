import type { BaseChartProps, ChartInteractionProps } from './chart'

export type GanttDateValue = Date | string | number

export type GanttScale = 'day' | 'week' | 'month'

export interface GanttTask {
  id: string | number
  label: string
  start: GanttDateValue
  /**
   * Inclusive calendar end for `YYYY-MM-DD` strings (`01-01`–`01-05` covers 5 days).
   * Same-day tasks cover one day.
   */
  end: GanttDateValue
  progress?: number
  color?: string
  dependencies?: Array<string | number>
  disabled?: boolean
  data?: Record<string, unknown>
}

export interface GanttProps
  extends BaseChartProps, Omit<ChartInteractionProps, 'selectedIndex' | 'hoveredIndex'> {
  data: GanttTask[]
  /**
   * Chart width. Grows to the laid-out rows when they are wider.
   * @default 760
   */
  width?: number
  /**
   * Chart height. Grows to the laid-out rows when they are taller.
   * @default 360
   */
  height?: number
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
  /**
   * Allow pointer-dragging bars. Also implied by `onTaskChange` / `onDataChange`.
   * Default is read-only: a drag does not keep a new date unless the parent writes `data`.
   * @default false
   */
  draggable?: boolean
  dateFormatter?: (date: Date, scale: GanttScale) => string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  colors?: string[]
  selectedId?: string | number | null
  ariaLabel?: string
}
