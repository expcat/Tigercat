import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useResponsiveChartSize } from '@expcat/tigercat-react'
import { DEFAULT_CHART_PADDING } from '@expcat/tigercat-core'

describe('useResponsiveChartSize', () => {
  it('uses fallback size until Canvas reports an observation', () => {
    const { result } = renderHook(() =>
      useResponsiveChartSize(320, 200, DEFAULT_CHART_PADDING, true)
    )
    expect(result.current.plotSize).toEqual({ width: 320, height: 200 })
    act(() => {
      result.current.onResolvedSizeChange({ width: 480, height: 260 })
    })
    expect(result.current.plotSize).toEqual({ width: 480, height: 260 })
  })

  it('ignores observations when responsive is false', () => {
    const { result } = renderHook(() =>
      useResponsiveChartSize(320, 200, DEFAULT_CHART_PADDING, false)
    )
    act(() => {
      result.current.onResolvedSizeChange({ width: 480, height: 260 })
    })
    expect(result.current.plotSize).toEqual({ width: 320, height: 200 })
  })
})
