import { ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import {
  findNearestSeriesPoint,
  isChartNavigationKey,
  mapPointerToPlotPoint,
  nextChartPointRef,
  queryChartPointElement,
  type ChartPointRef
} from '@expcat/tigercat-core'

export interface UseCartesianSeriesPointsOptions<T> {
  showTooltip: MaybeRefOrGetter<boolean>
  hoverable: MaybeRefOrGetter<boolean>
  innerRect: MaybeRefOrGetter<{ width: number; height: number }>
  getSeriesPoints: () => Array<{ points: Array<{ x: number; y: number }> }>
  getDatum: (seriesIndex: number, pointIndex: number) => T | undefined
  getSeriesKeys: () => string[]
  getFlatPoints: () => ChartPointRef[]
  onPointHover?: (seriesIndex: number | null, pointIndex: number | null, datum: T | null) => void
  onPointActivate: (seriesIndex: number, pointIndex: number) => void
  pointClickable: MaybeRefOrGetter<boolean>
}

export function useCartesianSeriesPoints<T>(options: UseCartesianSeriesPointsOptions<T>) {
  const hoveredPointInfo: Ref<ChartPointRef | null> = ref(null)
  const tooltipPosition = ref({ x: 0, y: 0 })

  const trackHover = () => toValue(options.showTooltip) || toValue(options.hoverable)

  const handlePointMouseEnter = (seriesIndex: number, pointIndex: number, event: MouseEvent) => {
    hoveredPointInfo.value = { seriesIndex, pointIndex }
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
    if (toValue(options.hoverable)) {
      options.onPointHover?.(
        seriesIndex,
        pointIndex,
        options.getDatum(seriesIndex, pointIndex) ?? null
      )
    }
  }

  const handlePointMouseMove = (event: MouseEvent) => {
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
  }

  const handlePointMouseLeave = () => {
    hoveredPointInfo.value = null
    if (toValue(options.hoverable)) {
      options.onPointHover?.(null, null, null)
    }
  }

  const showPointTooltipFromElement = (
    el: SVGGraphicsElement,
    seriesIndex: number,
    pointIndex: number
  ) => {
    if (!trackHover()) return
    const rect = el.getBoundingClientRect()
    hoveredPointInfo.value = { seriesIndex, pointIndex }
    tooltipPosition.value = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    options.onPointHover?.(
      seriesIndex,
      pointIndex,
      options.getDatum(seriesIndex, pointIndex) ?? null
    )
  }

  const handlePlotMouseMove = (event: MouseEvent) => {
    if (!trackHover()) return
    const target = event.currentTarget as SVGGraphicsElement
    const mapped = mapPointerToPlotPoint(
      event.clientX,
      event.clientY,
      target.getBoundingClientRect(),
      toValue(options.innerRect)
    )
    if (!mapped) return
    const nearest = findNearestSeriesPoint(
      options.getSeriesPoints().map((sd) => sd.points),
      mapped.x,
      mapped.y
    )
    if (!nearest) return
    hoveredPointInfo.value = nearest
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
  }

  const handlePointKeydown = (event: KeyboardEvent, seriesIndex: number, pointIndex: number) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const next = nextChartPointRef(
        { seriesIndex, pointIndex },
        event.key,
        options.getFlatPoints()
      )
      if (!next) return
      const node = queryChartPointElement(
        (event.currentTarget as SVGElement).ownerSVGElement,
        options.getSeriesKeys()[next.seriesIndex],
        next.pointIndex
      )
      node?.focus()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      if (toValue(options.pointClickable)) {
        options.onPointActivate(seriesIndex, pointIndex)
      } else {
        showPointTooltipFromElement(
          event.currentTarget as unknown as SVGGraphicsElement,
          seriesIndex,
          pointIndex
        )
      }
    } else if (event.key === 'Escape' && trackHover()) {
      handlePointMouseLeave()
    }
  }

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
