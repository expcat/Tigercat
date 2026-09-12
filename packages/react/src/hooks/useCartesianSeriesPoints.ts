import { useCallback, useState } from 'react'
import {
  findNearestSeriesPoint,
  isChartNavigationKey,
  mapPointerToPlotPoint,
  nextChartPointRef,
  queryChartPointElement,
  type ChartPointRef
} from '@expcat/tigercat-core'

export interface UseCartesianSeriesPointsOptions<T> {
  showTooltip: boolean
  hoverable: boolean
  innerRect: { width: number; height: number }
  getSeriesPoints: () => Array<{ points: Array<{ x: number; y: number }> }>
  getDatum: (seriesIndex: number, pointIndex: number) => T | undefined
  getSeriesKeys: () => string[]
  getFlatPoints: () => ChartPointRef[]
  onPointHover?: (seriesIndex: number | null, pointIndex: number | null, datum: T | null) => void
  onPointActivate: (seriesIndex: number, pointIndex: number) => void
  pointClickable: boolean
}

export function useCartesianSeriesPoints<T>({
  showTooltip,
  hoverable,
  innerRect,
  getSeriesPoints,
  getDatum,
  getSeriesKeys,
  getFlatPoints,
  onPointHover,
  onPointActivate,
  pointClickable
}: UseCartesianSeriesPointsOptions<T>) {
  const [hoveredPointInfo, setHoveredPointInfo] = useState<ChartPointRef | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const trackHover = showTooltip || hoverable

  const handlePointMouseEnter = useCallback(
    (seriesIndex: number, pointIndex: number, event: React.MouseEvent) => {
      setHoveredPointInfo({ seriesIndex, pointIndex })
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      if (hoverable) {
        onPointHover?.(seriesIndex, pointIndex, getDatum(seriesIndex, pointIndex) ?? null)
      }
    },
    [getDatum, hoverable, onPointHover]
  )

  const handlePointMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handlePointMouseLeave = useCallback(() => {
    setHoveredPointInfo(null)
    if (hoverable) {
      onPointHover?.(null, null, null)
    }
  }, [hoverable, onPointHover])

  const showPointTooltipFromElement = useCallback(
    (el: SVGGraphicsElement, seriesIndex: number, pointIndex: number) => {
      if (!trackHover) return
      const rect = el.getBoundingClientRect()
      setHoveredPointInfo({ seriesIndex, pointIndex })
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      onPointHover?.(seriesIndex, pointIndex, getDatum(seriesIndex, pointIndex) ?? null)
    },
    [getDatum, onPointHover, trackHover]
  )

  const handlePlotMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      if (!trackHover) return
      const mapped = mapPointerToPlotPoint(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
        innerRect
      )
      if (!mapped) return
      const nearest = findNearestSeriesPoint(
        getSeriesPoints().map((sd) => sd.points),
        mapped.x,
        mapped.y
      )
      if (!nearest) return
      setHoveredPointInfo(nearest)
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    },
    [getSeriesPoints, innerRect, trackHover]
  )

  const handlePointKeydown = useCallback(
    (event: React.KeyboardEvent<SVGElement>, seriesIndex: number, pointIndex: number) => {
      if (isChartNavigationKey(event.key)) {
        event.preventDefault()
        const next = nextChartPointRef({ seriesIndex, pointIndex }, event.key, getFlatPoints())
        if (!next) return
        queryChartPointElement(
          event.currentTarget.ownerSVGElement,
          getSeriesKeys()[next.seriesIndex],
          next.pointIndex
        )?.focus()
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        if (pointClickable) {
          onPointActivate(seriesIndex, pointIndex)
        } else {
          showPointTooltipFromElement(
            event.currentTarget as SVGGraphicsElement,
            seriesIndex,
            pointIndex
          )
        }
      } else if (event.key === 'Escape' && trackHover) {
        handlePointMouseLeave()
      }
    },
    [
      getFlatPoints,
      getSeriesKeys,
      handlePointMouseLeave,
      onPointActivate,
      pointClickable,
      showPointTooltipFromElement,
      trackHover
    ]
  )

  return {
    hoveredPointInfo,
    tooltipPosition,
    handlePointMouseEnter,
    handlePointMouseMove,
    handlePointMouseLeave,
    showPointTooltipFromElement,
    handlePlotMouseMove,
    handlePointKeydown
  }
}
