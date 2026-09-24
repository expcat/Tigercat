import { useCallback, useEffect, useRef, useState } from 'react'
import {
  chartPointerRemainsInside,
  createChartFrameCoalescer,
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
  onPointActivate
}: UseCartesianSeriesPointsOptions<T>) {
  const [hoveredPointInfo, setHoveredPointInfo] = useState<ChartPointRef | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const trackHover = showTooltip || hoverable
  const scanRef = useRef({ getSeriesPoints, getDatum, hoverable, onPointHover })
  scanRef.current = { getSeriesPoints, getDatum, hoverable, onPointHover }
  const [plotScan] = useState(() =>
    createChartFrameCoalescer<{ x: number; y: number; clientX: number; clientY: number }>({
      onFrame: (sample) => {
        const current = scanRef.current
        const nearest = findNearestSeriesPoint(
          current.getSeriesPoints().map((sd) => sd.points),
          sample.x,
          sample.y
        )
        if (!nearest) return
        setHoveredPointInfo(nearest)
        setTooltipPosition({ x: sample.clientX, y: sample.clientY })
        if (current.hoverable) {
          current.onPointHover?.(
            nearest.seriesIndex,
            nearest.pointIndex,
            current.getDatum(nearest.seriesIndex, nearest.pointIndex) ?? null
          )
        }
      }
    })
  )

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

  const handlePointMouseLeave = useCallback(
    (event?: React.MouseEvent) => {
      if (event && chartPointerRemainsInside(event.currentTarget, event.relatedTarget)) return
      plotScan.cancel()
      setHoveredPointInfo(null)
      if (hoverable) {
        onPointHover?.(null, null, null)
      }
    },
    [hoverable, onPointHover, plotScan]
  )

  const showPointTooltipFromElement = useCallback(
    (el: SVGElement, seriesIndex: number, pointIndex: number) => {
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
      plotScan.schedule({
        x: mapped.x,
        y: mapped.y,
        clientX: event.clientX,
        clientY: event.clientY
      })
    },
    [innerRect, plotScan, trackHover]
  )

  useEffect(() => () => plotScan.cancel(), [plotScan])

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
        onPointActivate(seriesIndex, pointIndex)
      } else if (event.key === 'Escape' && trackHover) {
        handlePointMouseLeave()
      }
    },
    [getFlatPoints, getSeriesKeys, handlePointMouseLeave, onPointActivate, trackHover]
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
