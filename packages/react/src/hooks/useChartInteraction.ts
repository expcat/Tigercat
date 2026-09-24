import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  createChartInteractionHandlers,
  createChartPointerMoveScheduler,
  getChartElementOpacity,
  getChartLegendShellClasses,
  isChartActivationKey,
  resolveChartActiveIndex,
  resolveChartIndex,
  shouldTrackChartPointer,
  toggleLegendHidden,
  isLegendHidden,
  tooltipPositionFromEvent,
  type ChartInteractionState,
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

export interface UseChartInteractionReturn {
  tooltipPosition: { x: number; y: number }
  resolvedHoveredIndex: number | null
  resolvedSelectedIndex: number | null
  activeIndex: number | null
  getElementOpacity: (index: number) => number | undefined
  handleMouseEnter: (
    index: number,
    event: React.MouseEvent | React.FocusEvent | React.KeyboardEvent
  ) => void
  handleMouseMove: (event: React.MouseEvent) => void
  handleMouseLeave: () => void
  handleClick: (index: number) => void
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void
  handleLegendClick: (index: number) => void
  handleLegendHover: (index: number, _item?: unknown, event?: React.SyntheticEvent) => void
  handleLegendLeave: () => void
  wrapperClasses: string
  legendHiddenKeys: string[]
  isLegendIndexHidden: (index: number) => boolean
}

export function useChartInteraction<T = unknown>(
  options: UseChartInteractionOptions<T>
): UseChartInteractionReturn {
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
  const [legendHiddenKeys, setLegendHiddenKeys] = useState<string[]>([])
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

  const stateRef = useRef<ChartInteractionState>({ hoveredIndex: null, selectedIndex: null })
  stateRef.current = {
    get hoveredIndex() {
      return localHoveredIndex
    },
    set hoveredIndex(value) {
      setLocalHoveredIndex(value)
    },
    get selectedIndex() {
      return localSelectedIndex
    },
    set selectedIndex(value) {
      setLocalSelectedIndex(value)
    }
  }

  const handlersFor = useCallback(() => {
    return createChartInteractionHandlers([], stateRef.current, {
      hoverable,
      showTooltip,
      selectable,
      hoveredIndex: hoveredIndexProp,
      selectedIndex: selectedIndexProp,
      onHoverChange: (index, datum) => {
        onHoveredIndexChange?.(index)
        onHover?.(index, datum)
      },
      onSelectChange: (index) => onSelectedIndexChange?.(index),
      onItemClick: (index, datum) => onClick?.(index, datum)
    })
  }, [
    hoverable,
    showTooltip,
    selectable,
    hoveredIndexProp,
    selectedIndexProp,
    onHoveredIndexChange,
    onHover,
    onSelectedIndexChange,
    onClick
  ])

  const handleMouseEnter = useCallback(
    (index: number, event: React.MouseEvent | React.FocusEvent | React.KeyboardEvent) => {
      const position = tooltipPositionFromEvent(event)
      if (shouldTrackChartPointer(hoverable, showTooltip)) setTooltipPosition(position)
      handlersFor().onMouseEnter(index, getData?.(index), position)
    },
    [handlersFor, hoverable, showTooltip, getData]
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
    handlersFor().onMouseLeave()
  }, [tooltipScheduler, handlersFor])

  const handleClick = useCallback(
    (index: number) => {
      handlersFor().onClick(index, getData?.(index))
    },
    [handlersFor, getData]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (!isChartActivationKey(event.key)) return
      const position = tooltipPositionFromEvent(event)
      if (shouldTrackChartPointer(hoverable, showTooltip)) setTooltipPosition(position)
      handlersFor().onKeyDown(event, index, getData?.(index), position)
    },
    [handlersFor, hoverable, showTooltip, getData]
  )

  const handleLegendClick = useCallback((index: number) => {
    setLegendHiddenKeys((current) => toggleLegendHidden(current, String(index)))
  }, [])

  const isLegendIndexHidden = useCallback(
    (index: number) => isLegendHidden(legendHiddenKeys, String(index)),
    [legendHiddenKeys]
  )

  const handleLegendHover = useCallback(
    (index: number, _item?: unknown, event?: React.SyntheticEvent) => {
      const position = event ? tooltipPositionFromEvent(event) : undefined
      if (position && shouldTrackChartPointer(hoverable, showTooltip)) setTooltipPosition(position)
      handlersFor().onMouseEnter(index, getData?.(index), position)
    },
    [handlersFor, hoverable, showTooltip, getData]
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
    wrapperClasses,
    legendHiddenKeys,
    isLegendIndexHidden
  }
}
