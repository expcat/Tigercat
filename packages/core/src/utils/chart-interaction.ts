/**
 * Chart interaction utilities
 * Provides common interaction logic for hover, select, and tooltip behaviors
 */

import type { ChartScaleValue } from '../types/chart'

/**
 * Interaction state for chart components
 */
export interface ChartInteractionState {
  hoveredIndex: number | null
  selectedIndex: number | null
}

/**
 * Common interaction event handlers result
 */
export interface ChartInteractionHandlers<T = unknown> {
  onMouseEnter: (index: number, datum: T) => void
  onMouseLeave: () => void
  onClick: (index: number, datum: T) => void
  onKeyDown: (event: KeyboardEvent, index: number, datum: T) => void
}

/**
 * Options for chart interaction behavior
 */
export interface ChartInteractionOptions<T = unknown> {
  /**
   * Enable hover highlight
   * @default false
   */
  hoverable?: boolean

  /**
   * Enable click selection
   * @default false
   */
  selectable?: boolean

  /**
   * Controlled hovered index
   */
  hoveredIndex?: number | null

  /**
   * Controlled selected index
   */
  selectedIndex?: number | null

  /**
   * Callback when hover state changes
   */
  onHoverChange?: (index: number | null, datum: T | null) => void

  /**
   * Callback when selection changes
   */
  onSelectChange?: (index: number | null, datum: T | null) => void

  /**
   * Callback when item is clicked
   */
  onItemClick?: (index: number, datum: T) => void
}

/**
 * Create interaction handlers for chart elements
 */
export function createChartInteractionHandlers<T>(
  data: T[],
  state: ChartInteractionState,
  options: ChartInteractionOptions<T>
): ChartInteractionHandlers<T> {
  const { hoverable, selectable, onHoverChange, onSelectChange, onItemClick } = options

  const handleMouseEnter = (index: number, datum: T) => {
    if (!hoverable) return
    if (options.hoveredIndex !== undefined) {
      // Controlled mode
      onHoverChange?.(index, datum)
    } else {
      state.hoveredIndex = index
    }
  }

  const handleMouseLeave = () => {
    if (!hoverable) return
    if (options.hoveredIndex !== undefined) {
      onHoverChange?.(null, null)
    } else {
      state.hoveredIndex = null
    }
  }

  const handleClick = (index: number, datum: T) => {
    onItemClick?.(index, datum)
    if (!selectable) return

    const nextIndex = state.selectedIndex === index ? null : index
    const nextDatum = nextIndex !== null ? data[nextIndex] : null

    if (options.selectedIndex !== undefined) {
      // Controlled mode
      onSelectChange?.(nextIndex, nextDatum)
    } else {
      state.selectedIndex = nextIndex
      onSelectChange?.(nextIndex, nextDatum)
    }
  }

  const handleKeyDown = (event: KeyboardEvent, index: number, datum: T) => {
    if (!selectable) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleClick(index, datum)
  }

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    onKeyDown: handleKeyDown
  }
}

/**
 * Get resolved active index based on controlled/uncontrolled state
 */
export function getActiveIndex(
  hoveredIndex: number | null,
  selectedIndex: number | null,
  controlledHovered?: number | null,
  controlledSelected?: number | null
): number | null {
  // Priority: controlled selected > uncontrolled selected > controlled hovered > uncontrolled hovered
  if (controlledSelected !== undefined && controlledSelected !== null) {
    return controlledSelected
  }
  if (selectedIndex !== null) {
    return selectedIndex
  }
  if (controlledHovered !== undefined && controlledHovered !== null) {
    return controlledHovered
  }
  return hoveredIndex
}

/**
 * Calculate opacity for chart element based on active state
 */
export function getChartElementOpacity(
  index: number,
  activeIndex: number | null,
  options: {
    activeOpacity?: number
    inactiveOpacity?: number
    defaultOpacity?: number
  } = {}
): number | undefined {
  const { activeOpacity = 1, inactiveOpacity = 0.25, defaultOpacity } = options

  if (activeIndex === null) {
    return defaultOpacity
  }

  return index === activeIndex ? activeOpacity : inactiveOpacity
}

/**
 * Default tooltip formatter
 */
export function defaultTooltipFormatter(
  label: string | undefined,
  value: number | ChartScaleValue,
  seriesName?: string,
  index?: number
): string {
  const displayLabel = label ?? (index !== undefined ? `#${index + 1}` : '')
  const prefix = seriesName ? `${seriesName} · ` : ''
  return `${prefix}${displayLabel}: ${value}`
}

/**
 * CSS classes for interactive chart elements
 */
export const chartInteractiveClasses = {
  hoverable: 'cursor-pointer transition-opacity duration-150',
  selectable: 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
  active: 'ring-2 ring-[color:var(--tiger-primary,#2563eb)] ring-offset-1'
}

/**
 * Chart animation configuration
 */
export interface ChartAnimationConfig {
  /**
   * Enable animation
   * @default false
   */
  animated?: boolean

  /**
   * Animation duration in ms
   * @default 300
   */
  duration?: number

  /**
   * Animation easing function
   * @default 'ease-out'
   */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

  /**
   * Stagger delay between elements in ms
   * @default 50
   */
  stagger?: number
}

/**
 * Get CSS transition style for chart animation
 */
export function getChartAnimationStyle(config: ChartAnimationConfig, index = 0): string {
  if (!config.animated) return ''

  const duration = config.duration ?? 300
  const easing = config.easing ?? 'ease-out'
  const stagger = config.stagger ?? 50
  const delay = index * stagger

  return `transition: all ${duration}ms ${easing} ${delay}ms`
}

/**
 * Get SVG transform for entrance animation
 */
export function getChartEntranceTransform(
  type: 'scale' | 'slide-up' | 'slide-left' | 'fade',
  progress: number,
  options: { originX?: number; originY?: number } = {}
): string {
  const { originX = 0, originY = 0 } = options

  switch (type) {
    case 'scale':
      return `translate(${originX * (1 - progress)}, ${originY * (1 - progress)}) scale(${progress})`
    case 'slide-up':
      return `translate(0, ${20 * (1 - progress)})`
    case 'slide-left':
      return `translate(${20 * (1 - progress)}, 0)`
    case 'fade':
    default:
      return ''
  }
}
