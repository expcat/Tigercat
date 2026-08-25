import { useCallback, useMemo, useState } from 'react'
import {
  getChartInnerRect,
  resolveResponsiveChartSize,
  type ChartCanvasSize,
  type ChartPadding
} from '@expcat/tigercat-core'

export interface ResponsiveChartLayout {
  plotSize: ChartCanvasSize
  innerRect: ReturnType<typeof getChartInnerRect>
  onResolvedSizeChange: (size: ChartCanvasSize) => void
}

/**
 * Plot size for cartesian charts that share ChartCanvas's ResizeObserver.
 * First paint uses the width/height props; observed size is applied after
 * ChartCanvas reports it. `responsive={false}` ignores any stored observation.
 */
export function useResponsiveChartSize(
  width: number,
  height: number,
  padding: ChartPadding,
  responsive: boolean
): ResponsiveChartLayout {
  const [observedSize, setObservedSize] = useState<ChartCanvasSize | null>(null)

  const plotSize = useMemo(
    () => resolveResponsiveChartSize({ width, height }, responsive ? observedSize : null),
    [width, height, responsive, observedSize]
  )

  const innerRect = useMemo(
    () => getChartInnerRect(plotSize.width, plotSize.height, padding),
    [plotSize.width, plotSize.height, padding]
  )

  const onResolvedSizeChange = useCallback((size: ChartCanvasSize) => {
    setObservedSize((prev) => {
      if (prev && prev.width === size.width && prev.height === size.height) return prev
      return size
    })
  }, [])

  return { plotSize, innerRect, onResolvedSizeChange }
}
