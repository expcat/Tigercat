import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  createChartPointerMoveScheduler,
  getChartElementOpacity,
  getChartLegendShellClasses,
  isChartActivationKey,
  nextChartSelectedIndex,
  resolveChartActiveIndex,
  resolveChartIndex,
  shouldTrackChartPointer,
  tooltipPositionFromEvent,
  type ChartLegendPosition,
  type ChartPointerMoveScheduler
} from '@expcat/tigercat-core'

export interface UseChartInteractionOptions<T = unknown> {
  hoverable: boolean
  showTooltip?: boolean
  hoveredIndexProp?: number | null
  selectable: boolean
  selectedIndexProp?: number | null
  activeOpacity: number
  inactiveOpacity: number
  legendPosition?: ChartLegendPosition
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  getData?: (index: number) => T | undefined
  onHover?: (index: number | null, datum: T | null) => void
  onClick?: (index: number, datum: T | undefined) => void
}

export interface UseChartInteractionReturn<T = unknown> {
  tooltipPosition: { x: number; y: number }
  resolvedHoveredIndex: number | null
  resolvedSelectedIndex: number | null
  activeIndex: number | null
  getElementOpacity: (index: number) => number | undefined
  handleMouseEnter: (index: number, event: React.MouseEvent | React.FocusEvent) => void
  handleMouseMove: (event: React.MouseEvent) => void
  handleMouseLeave: () => void
  handleClick: (index: number) => void
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void
  handleLegendClick: (index: number) => void
  handleLegendHover: (index: number, _item?: unknown, event?: React.SyntheticEvent) => void
  handleLegendLeave: () => void
  wrapperClasses: string
}

export function useChartInteraction<T = unknown>(
  options: UseChartInteractionOptions<T>
): UseChartInteractionReturn<T> {
  const {
    hoverable,
    showTooltip = true,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition = 'bottom',
    onHoveredIndexChange,
    onSelectedIndexChange,
    getData,
    onHover,
    onClick
  } = options

  const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipScheduler] = useState<ChartPointerMoveScheduler>(() =>
    createChartPointerMoveScheduler({
      onPositionChange: setTooltipPosition
    })
  )

  useEffect(() => {
    return () => tooltipScheduler.cancel()
  }, [tooltipScheduler])

  const resolvedHoveredIndex = resolveChartIndex(hoveredIndexProp, localHoveredIndex)
  const resolvedSelectedIndex = resolveChartIndex(selectedIndexProp, localSelectedIndex)
  const activeIndex = useMemo(
    () => resolveChartActiveIndex(resolvedSelectedIndex, resolvedHoveredIndex, hoverable),
    [resolvedSelectedIndex, resolvedHoveredIndex, hoverable]
  )

  const getElementOpacity = useCallback(
    (index: number): number | undefined => {
      return getChartElementOpacity(index, activeIndex, {
        activeOpacity,
        inactiveOpacity
      })
    },
    [activeIndex, activeOpacity, inactiveOpacity]
  )

  const applyHover = useCallback(
    (index: number | null, position?: { x: number; y: number }) => {
      if (!shouldTrackChartPointer(hoverable, showTooltip)) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(index)
      }
      if (position) setTooltipPosition(position)
      if (!hoverable) return
      onHoveredIndexChange?.(index)
      onHover?.(index, index !== null ? (getData?.(index) ?? null) : null)
    },
    [hoverable, showTooltip, hoveredIndexProp, onHoveredIndexChange, onHover, getData]
  )

  const handleMouseEnter = useCallback(
    (index: number, event: React.MouseEvent | React.FocusEvent) => {
      applyHover(index, tooltipPositionFromEvent(event))
    },
    [applyHover]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!shouldTrackChartPointer(hoverable, showTooltip)) return
      tooltipScheduler.schedule({ x: event.clientX, y: event.clientY })
    },
    [hoverable, showTooltip, tooltipScheduler]
  )

  const handleMouseLeave = useCallback(() => {
    tooltipScheduler.cancel()
    applyHover(null)
  }, [tooltipScheduler, applyHover])

  const handleClick = useCallback(
    (index: number) => {
      onClick?.(index, getData?.(index))
      if (!selectable) return
      const nextIndex = nextChartSelectedIndex(resolvedSelectedIndex, index)
      if (selectedIndexProp === undefined) {
        setLocalSelectedIndex(nextIndex)
      }
      onSelectedIndexChange?.(nextIndex)
    },
    [selectable, resolvedSelectedIndex, selectedIndexProp, onSelectedIndexChange, onClick, getData]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (!isChartActivationKey(event.key)) return
      event.preventDefault()
      if (shouldTrackChartPointer(hoverable, showTooltip)) {
        applyHover(index, tooltipPositionFromEvent(event))
      }
      handleClick(index)
    },
    [hoverable, showTooltip, applyHover, handleClick]
  )

  const handleLegendClick = useCallback(
    (index: number) => {
      handleClick(index)
    },
    [handleClick]
  )

  const handleLegendHover = useCallback(
    (index: number, _item?: unknown, event?: React.SyntheticEvent) => {
      applyHover(index, event ? tooltipPositionFromEvent(event) : undefined)
    },
    [applyHover]
  )

  const handleLegendLeave = useCallback(() => {
    handleMouseLeave()
  }, [handleMouseLeave])

  const wrapperClasses = useMemo(() => getChartLegendShellClasses(legendPosition), [legendPosition])

  return {
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
    wrapperClasses
  }
}
