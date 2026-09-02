import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope, ref } from 'vue'
import { useChartInteraction } from '@expcat/tigercat-vue/useChartInteraction'
import { installFrameScheduler } from '../utils/frame-scheduler'

function withSetup<T>(factory: () => T): T {
  const scope = effectScope()
  const result = scope.run(factory)
  if (result === undefined) throw new Error('setup returned undefined')
  afterEach(() => scope.stop())
  return result
}

describe('useChartInteraction (Vue)', () => {
  const mockData = [
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
    { label: 'C', value: 30 }
  ]

  const createTestOptions = (overrides: Record<string, unknown> = {}) => ({
    hoverable: true,
    selectable: true,
    activeOpacity: 1,
    inactiveOpacity: 0.3,
    legendPosition: 'bottom' as const,
    getData: (index: number) => mockData[index],
    onHoveredIndexChange: vi.fn(),
    onSelectedIndexChange: vi.fn(),
    onHover: vi.fn(),
    onClick: vi.fn(),
    ...overrides
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('starts with null indices', () => {
    const { resolvedHoveredIndex, resolvedSelectedIndex, activeIndex } = withSetup(() =>
      useChartInteraction(createTestOptions())
    )
    expect(resolvedHoveredIndex.value).toBe(null)
    expect(resolvedSelectedIndex.value).toBe(null)
    expect(activeIndex.value).toBe(null)
  })

  it('tracks hover and tooltip position', () => {
    const options = createTestOptions()
    const { resolvedHoveredIndex, tooltipPosition, handleMouseEnter } = withSetup(() =>
      useChartInteraction(options)
    )
    handleMouseEnter(1, new MouseEvent('mouseenter', { clientX: 100, clientY: 200 }))
    expect(resolvedHoveredIndex.value).toBe(1)
    expect(tooltipPosition.value).toEqual({ x: 100, y: 200 })
    expect(options.onHoveredIndexChange).toHaveBeenCalledWith(1)
    expect(options.onHover).toHaveBeenCalledWith(1, mockData[1])
  })

  it('batches tooltip moves', () => {
    const scheduler = installFrameScheduler()
    const { tooltipPosition, handleMouseMove } = withSetup(() =>
      useChartInteraction(createTestOptions())
    )
    handleMouseMove(new MouseEvent('mousemove', { clientX: 300, clientY: 400 }))
    handleMouseMove(new MouseEvent('mousemove', { clientX: 350, clientY: 450 }))
    expect(tooltipPosition.value).toEqual({ x: 0, y: 0 })
    scheduler.flush()
    expect(tooltipPosition.value).toEqual({ x: 350, y: 450 })
  })

  it('fires click without selecting when selectable is false', () => {
    const options = createTestOptions({ selectable: false })
    const { resolvedSelectedIndex, handleClick } = withSetup(() => useChartInteraction(options))
    handleClick(1)
    expect(resolvedSelectedIndex.value).toBe(null)
    expect(options.onSelectedIndexChange).not.toHaveBeenCalled()
    expect(options.onClick).toHaveBeenCalledWith(1, mockData[1])
  })

  it('toggles selection and still emits the original click index', () => {
    const options = createTestOptions()
    const { resolvedSelectedIndex, handleClick } = withSetup(() => useChartInteraction(options))
    handleClick(1)
    expect(resolvedSelectedIndex.value).toBe(1)
    handleClick(1)
    expect(resolvedSelectedIndex.value).toBe(null)
    expect(options.onClick).toHaveBeenLastCalledWith(1, mockData[1])
    expect(options.onSelectedIndexChange).toHaveBeenLastCalledWith(null)
  })

  it('opens tooltip from keyboard when only showTooltip is on', () => {
    const options = createTestOptions({ hoverable: false, selectable: false })
    const { resolvedHoveredIndex, handleKeyDown } = withSetup(() => useChartInteraction(options))
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent
    handleKeyDown(event, 2)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(resolvedHoveredIndex.value).toBe(2)
    expect(options.onClick).toHaveBeenCalledWith(2, mockData[2])
  })

  it('reads legendPosition from a ref via toValue', () => {
    const legendPosition = ref<'right' | 'bottom'>('right')
    const { wrapperClasses } = withSetup(() =>
      useChartInteraction(createTestOptions({ legendPosition }))
    )
    expect(wrapperClasses.value).toContain('flex-row')
    legendPosition.value = 'bottom'
    expect(wrapperClasses.value).toContain('flex-col')
  })
})
