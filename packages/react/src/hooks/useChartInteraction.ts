import { useState, useMemo, useCallback } from 'react'
import {
  classNames,
  getChartElementOpacity,
  type ChartLegendItem,
  type ChartLegendPosition
} from '@expcat/tigercat-core'

/**
 * Options for useChartInteraction hook
 */
export interface UseChartInteractionOptions<T = unknown> {
  /** Enable hover highlight */
  hoverable: boolean
  /** Controlled hovered index from props */
  hoveredIndexProp?: number | null
  /** Enable click selection */
  selectable: boolean
  /** Controlled selected index from props */
  selectedIndexProp?: number | null
  /** Opacity for active element */
  activeOpacity: number
  /** Opacity for inactive elements */
  inactiveOpacity: number
  /** Legend position for wrapper classes */
  legendPosition?: ChartLegendPosition
  /** Callback when hover changes */
  onHoveredIndexChange?: (index: number | null) => void
  /** Callback when selection changes */
  onSelectedIndexChange?: (index: number | null) => void
  /** Get data item by index */
  getData?: (index: number) => T | undefined
  /** Custom callbacks */
  callbacks?: {
    onHover?: (index: number | null, datum: T | null) => void
    onClick?: (index: number, datum: T) => void
  }
}

/**
 * Return type for useChartInteraction
 */
export interface UseChartInteractionReturn<T = unknown> {
  /** Local hovered index state */
  localHoveredIndex: number | null
  /** Local selected index state */
  localSelectedIndex: number | null
  /** Tooltip position state */
  tooltipPosition: { x: number; y: number }
  /** Resolved hovered index (controlled or uncontrolled) */
  resolvedHoveredIndex: number | null
  /** Resolved selected index (controlled or uncontrolled) */
  resolvedSelectedIndex: number | null
  /** Current active index for highlighting */
  activeIndex: number | null
  /** Get element opacity based on active state */
  getElementOpacity: (index: number) => number | undefined
  /** Handle mouse enter on chart element */
  handleMouseEnter: (index: number, event: React.MouseEvent) => void
  /** Handle mouse move for tooltip */
  handleMouseMove: (event: React.MouseEvent) => void
  /** Handle mouse leave */
  handleMouseLeave: () => void
  /** Handle click on chart element */
  handleClick: (index: number) => void
  /** Handle keydown for accessibility */
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void
  /** Handle legend item click */
  handleLegendClick: (index: number) => void
  /** Handle legend item hover */
  handleLegendHover: (index: number) => void
  /** Handle legend item leave */
  handleLegendLeave: () => void
  /** Wrapper classes for legend layout */
  wrapperClasses: string
  /** Create legend items from data */
  createLegendItems: (
    items: Array<{ label?: string; color?: string; x?: unknown }>,
    palette: string[],
    labelFormatter?: (item: unknown, index: number) => string
  ) => ChartLegendItem[]
}

/**
 * Hook for chart interaction state and handlers
 * Extracts common interaction logic from high-level chart components
 */
export function useChartInteraction<T = unknown>(
  options: UseChartInteractionOptions<T>
): UseChartInteractionReturn<T> {
  const {
    hoverable,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition = 'bottom',
    onHoveredIndexChange,
    onSelectedIndexChange,
    getData,
    callbacks
  } = options

  // Local state
  const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Resolved indices (controlled vs uncontrolled)
  const resolvedHoveredIndex = hoveredIndexProp !== undefined ? hoveredIndexProp : localHoveredIndex
  const resolvedSelectedIndex =
    selectedIndexProp !== undefined ? selectedIndexProp : localSelectedIndex

  // Active index for highlighting
  const activeIndex = useMemo(() => {
    if (resolvedSelectedIndex !== null) return resolvedSelectedIndex
    if (hoverable && resolvedHoveredIndex !== null) return resolvedHoveredIndex
    return null
  }, [resolvedSelectedIndex, hoverable, resolvedHoveredIndex])

  // Get element opacity
  const getElementOpacity = useCallback(
    (index: number): number | undefined => {
      return getChartElementOpacity(index, activeIndex, {
        activeOpacity,
        inactiveOpacity
      })
    },
    [activeIndex, activeOpacity, inactiveOpacity]
  )

  // Event handlers
  const handleMouseEnter = useCallback(
    (index: number, event: React.MouseEvent) => {
      if (!hoverable) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(index)
      }
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      onHoveredIndexChange?.(index)
      if (callbacks?.onHover && getData) {
        callbacks.onHover(index, getData(index) ?? null)
      }
    },
    [hoverable, hoveredIndexProp, onHoveredIndexChange, callbacks, getData]
  )

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!hoverable) return
    if (hoveredIndexProp === undefined) {
      setLocalHoveredIndex(null)
    }
    onHoveredIndexChange?.(null)
    callbacks?.onHover?.(null, null)
  }, [hoverable, hoveredIndexProp, onHoveredIndexChange, callbacks])

  const handleClick = useCallback(
    (index: number) => {
      if (!selectable) return
      const nextIndex = resolvedSelectedIndex === index ? null : index
      if (selectedIndexProp === undefined) {
        setLocalSelectedIndex(nextIndex)
      }
      onSelectedIndexChange?.(nextIndex)
      if (callbacks?.onClick && getData) {
        const datum = getData(index)
        if (datum) callbacks.onClick(index, datum)
      }
    },
    [
      selectable,
      resolvedSelectedIndex,
      selectedIndexProp,
      onSelectedIndexChange,
      callbacks,
      getData
    ]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (!selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleClick(index)
    },
    [selectable, handleClick]
  )

  // Legend handlers
  const handleLegendClick = useCallback(
    (index: number) => {
      handleClick(index)
    },
    [handleClick]
  )

  const handleLegendHover = useCallback(
    (index: number) => {
      if (!hoverable) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(index)
      }
      onHoveredIndexChange?.(index)
    },
    [hoverable, hoveredIndexProp, onHoveredIndexChange]
  )

  const handleLegendLeave = useCallback(() => {
    handleMouseLeave()
  }, [handleMouseLeave])

  // Wrapper classes for legend layout
  const wrapperClasses = useMemo(() => {
    return classNames(
      'inline-flex',
      legendPosition === 'right'
        ? 'flex-row items-start gap-4'
        : legendPosition === 'left'
          ? 'flex-row-reverse items-start gap-4'
          : legendPosition === 'top'
            ? 'flex-col-reverse gap-2'
            : 'flex-col gap-2'
    )
  }, [legendPosition])

  // Helper to create legend items
  const createLegendItems = useCallback(
    (
      items: Array<{ label?: string; color?: string; x?: unknown }>,
      palette: string[],
      labelFormatter?: (item: unknown, index: number) => string
    ): ChartLegendItem[] => {
      return items.map((item, index) => ({
        index,
        label: labelFormatter
          ? labelFormatter(item, index)
          : (item.label ?? String(item.x ?? index)),
        color: item.color ?? palette[index % palette.length],
        active: activeIndex === null || activeIndex === index
      }))
    },
    [activeIndex]
  )

  return {
    localHoveredIndex,
    localSelectedIndex,
    tooltipPosition,
    resolvedHoveredIndex,
    resolvedSelectedIndex,
    activeIndex,
    getElementOpacity,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave,
    wrapperClasses,
    createLegendItems
  }
}
