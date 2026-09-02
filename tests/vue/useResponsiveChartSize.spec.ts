import { describe, expect, it } from 'vitest'
import { useResponsiveChartSize } from '@expcat/tigercat-vue/useResponsiveChartSize'
import { DEFAULT_CHART_PADDING } from '@expcat/tigercat-core'

describe('useResponsiveChartSize', () => {
  it('uses fallback size until Canvas reports an observation', () => {
    const layout = useResponsiveChartSize(
      () => 320,
      () => 200,
      () => DEFAULT_CHART_PADDING,
      () => true
    )
    expect(layout.plotSize.value).toEqual({ width: 320, height: 200 })
    layout.onResolvedSizeChange({ width: 480, height: 260 })
    expect(layout.plotSize.value).toEqual({ width: 480, height: 260 })
  })

  it('ignores observations when responsive is false', () => {
    const layout = useResponsiveChartSize(
      () => 320,
      () => 200,
      () => DEFAULT_CHART_PADDING,
      () => false
    )
    layout.onResolvedSizeChange({ width: 480, height: 260 })
    expect(layout.plotSize.value).toEqual({ width: 320, height: 200 })
  })
})
