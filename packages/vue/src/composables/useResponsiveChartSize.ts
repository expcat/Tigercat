import { computed, ref, type ComputedRef } from 'vue'
import {
  getChartInnerRect,
  resolveResponsiveChartSize,
  type ChartCanvasSize,
  type ChartPadding
} from '@expcat/tigercat-core'

export interface ResponsiveChartLayout {
  plotSize: ComputedRef<ChartCanvasSize>
  innerRect: ComputedRef<ReturnType<typeof getChartInnerRect>>
  onResolvedSizeChange: (size: ChartCanvasSize) => void
}

/**
 * Plot size for cartesian charts that share ChartCanvas's ResizeObserver.
 * First paint uses the width/height props; observed size is applied after
 * ChartCanvas reports it. `responsive={false}` ignores any stored observation.
 */
export function useResponsiveChartSize(
  width: () => number,
  height: () => number,
  padding: () => ChartPadding,
  responsive: () => boolean
): ResponsiveChartLayout {
  const observedSize = ref<ChartCanvasSize | null>(null)

  const plotSize = computed(() =>
    resolveResponsiveChartSize(
      { width: width(), height: height() },
      responsive() ? observedSize.value : null
    )
  )

  const innerRect = computed(() =>
    getChartInnerRect(plotSize.value.width, plotSize.value.height, padding())
  )

  function onResolvedSizeChange(size: ChartCanvasSize): void {
    const prev = observedSize.value
    if (prev && prev.width === size.width && prev.height === size.height) return
    observedSize.value = size
  }

  return { plotSize, innerRect, onResolvedSizeChange }
}
