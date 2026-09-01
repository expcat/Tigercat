import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChartInteraction } from '@expcat/tigercat-react'
import type { UseChartInteractionOptions } from '@expcat/tigercat-react'
import { installFrameScheduler } from '../utils/frame-scheduler'

describe('useChartInteraction (React)', () => {
  const mockData = [
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
    { label: 'C', value: 30 }
  ]

  const createMockCallbacks = () => ({
    onHoveredIndexChange: vi.fn(),
    onSelectedIndexChange: vi.fn(),
    onHover: vi.fn(),
    onClick: vi.fn()
  })

  const createTestOptions = (
    callbacks = createMockCallbacks(),
    overrides: Partial<UseChartInteractionOptions<(typeof mockData)[0]>> = {}
  ): UseChartInteractionOptions<(typeof mockData)[0]> => ({
    hoverable: true,
    selectable: true,
    activeOpacity: 1,
    inactiveOpacity: 0.3,
    legendPosition: 'bottom',
    onHoveredIndexChange: callbacks.onHoveredIndexChange,
    onSelectedIndexChange: callbacks.onSelectedIndexChange,
    onHover: callbacks.onHover,
    onClick: callbacks.onClick,
    getData: (index: number) => mockData[index],
    ...overrides
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with null indices', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      expect(result.current.resolvedHoveredIndex).toBe(null)
      expect(result.current.resolvedSelectedIndex).toBe(null)
      expect(result.current.activeIndex).toBe(null)
    })

    it('should initialize tooltip position', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      expect(result.current.tooltipPosition).toEqual({ x: 0, y: 0 })
    })
  })

  describe('hover interaction', () => {
    it('should update hovered index on mouse enter', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(1, mockEvent)
      })

      expect(result.current.resolvedHoveredIndex).toBe(1)
      expect(callbacks.onHoveredIndexChange).toHaveBeenCalledWith(1)
      expect(callbacks.onHover).toHaveBeenCalledWith(1, mockData[1])
    })

    it('should update tooltip position on mouse enter', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 150,
          clientY: 250
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(0, mockEvent)
      })

      expect(result.current.tooltipPosition).toEqual({ x: 150, y: 250 })
    })

    it('should batch tooltip position updates on mouse move', () => {
      const scheduler = installFrameScheduler()
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      act(() => {
        const mockEvent = new MouseEvent('mousemove', {
          clientX: 300,
          clientY: 400
        }) as unknown as React.MouseEvent
        result.current.handleMouseMove(mockEvent)
        const nextEvent = new MouseEvent('mousemove', {
          clientX: 350,
          clientY: 450
        }) as unknown as React.MouseEvent
        result.current.handleMouseMove(nextEvent)
      })

      expect(result.current.tooltipPosition).toEqual({ x: 0, y: 0 })
      expect(scheduler.pendingCount()).toBe(1)
      expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1)

      act(() => {
        scheduler.flush()
      })

      expect(result.current.tooltipPosition).toEqual({ x: 350, y: 450 })
    })

    it('should cancel queued tooltip updates on mouse leave', () => {
      const scheduler = installFrameScheduler()
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      act(() => {
        const enterEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(0, enterEvent)
        const moveEvent = new MouseEvent('mousemove', {
          clientX: 300,
          clientY: 400
        }) as unknown as React.MouseEvent
        result.current.handleMouseMove(moveEvent)
        result.current.handleMouseLeave()
      })

      act(() => {
        scheduler.flush()
      })

      expect(result.current.tooltipPosition).toEqual({ x: 100, y: 200 })
      expect(scheduler.cancelAnimationFrame).toHaveBeenCalledTimes(1)
    })

    it('should clear hovered index on mouse leave', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(1, mockEvent)
      })
      expect(result.current.resolvedHoveredIndex).toBe(1)

      act(() => {
        result.current.handleMouseLeave()
      })

      expect(result.current.resolvedHoveredIndex).toBe(null)
      expect(callbacks.onHoveredIndexChange).toHaveBeenLastCalledWith(null)
      expect(callbacks.onHover).toHaveBeenLastCalledWith(null, null)
    })

    it('should not update when hoverable is false', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(callbacks, { hoverable: false }))
      )

      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(1, mockEvent)
      })

      expect(result.current.resolvedHoveredIndex).toBe(1)
      expect(result.current.tooltipPosition).toEqual({ x: 100, y: 200 })
      expect(result.current.activeIndex).toBe(null)
      expect(callbacks.onHoveredIndexChange).not.toHaveBeenCalled()
      expect(callbacks.onHover).not.toHaveBeenCalled()
    })

    it('should not track hover when hoverable and showTooltip are false', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(callbacks, { hoverable: false, showTooltip: false }))
      )

      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(1, mockEvent)
      })

      expect(result.current.resolvedHoveredIndex).toBe(null)
      expect(result.current.tooltipPosition).toEqual({ x: 0, y: 0 })
      expect(callbacks.onHoveredIndexChange).not.toHaveBeenCalled()
      expect(callbacks.onHover).not.toHaveBeenCalled()
    })
  })

  describe('controlled hover mode', () => {
    it('should use controlled hovered index', () => {
      const callbacks = createMockCallbacks()
      const { result, rerender } = renderHook(
        ({ hoveredIndexProp }) =>
          useChartInteraction(createTestOptions(callbacks, { hoveredIndexProp })),
        { initialProps: { hoveredIndexProp: 0 as number | undefined } }
      )

      expect(result.current.resolvedHoveredIndex).toBe(0)

      // Attempt to change via handler
      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(2, mockEvent)
      })

      expect(result.current.resolvedHoveredIndex).toBe(0)
      // But callback is called for parent to handle
      expect(callbacks.onHoveredIndexChange).toHaveBeenCalledWith(2)

      // Parent updates prop
      rerender({ hoveredIndexProp: 2 })
      expect(result.current.resolvedHoveredIndex).toBe(2)
    })
  })

  describe('click selection', () => {
    it('should update selected index on click', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleClick(1)
      })

      expect(result.current.resolvedSelectedIndex).toBe(1)
      expect(callbacks.onSelectedIndexChange).toHaveBeenCalledWith(1)
      expect(callbacks.onClick).toHaveBeenCalledWith(1, mockData[1])
    })

    it('should toggle selection on repeated click', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleClick(1)
      })
      expect(result.current.resolvedSelectedIndex).toBe(1)

      act(() => {
        result.current.handleClick(1)
      })
      expect(result.current.resolvedSelectedIndex).toBe(null)
      expect(callbacks.onSelectedIndexChange).toHaveBeenLastCalledWith(null)
    })

    it('fires click without selecting when selectable is false', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(callbacks, { selectable: false }))
      )

      act(() => {
        result.current.handleClick(1)
      })

      expect(result.current.resolvedSelectedIndex).toBe(null)
      expect(callbacks.onSelectedIndexChange).not.toHaveBeenCalled()
      expect(callbacks.onClick).toHaveBeenCalledWith(1, mockData[1])
    })
  })

  describe('keyboard interaction', () => {
    it('should select on Enter key', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        const mockEvent = {
          key: 'Enter',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent
        result.current.handleKeyDown(mockEvent, 2)
      })

      expect(result.current.resolvedSelectedIndex).toBe(2)
    })

    it('should select on Space key', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        const mockEvent = {
          key: ' ',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent
        result.current.handleKeyDown(mockEvent, 1)
      })

      expect(result.current.resolvedSelectedIndex).toBe(1)
    })

    it('should ignore other keys', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        const mockEvent = {
          key: 'Tab',
          preventDefault: vi.fn()
        } as unknown as React.KeyboardEvent
        result.current.handleKeyDown(mockEvent, 1)
      })

      expect(result.current.resolvedSelectedIndex).toBe(null)
    })
  })

  describe('legend handlers', () => {
    it('should handle legend click as series click', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleLegendClick(2)
      })

      expect(result.current.resolvedSelectedIndex).toBe(2)
      expect(callbacks.onClick).toHaveBeenCalledWith(2, mockData[2])
    })

    it('should handle legend hover', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleLegendHover(1)
      })

      expect(result.current.resolvedHoveredIndex).toBe(1)
      expect(callbacks.onHoveredIndexChange).toHaveBeenCalledWith(1)
    })

    it('should handle legend leave', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleLegendHover(1)
      })
      expect(result.current.resolvedHoveredIndex).toBe(1)

      act(() => {
        result.current.handleLegendLeave()
      })
      expect(result.current.resolvedHoveredIndex).toBe(null)
    })
  })

  describe('activeIndex computation', () => {
    it('should prioritize selectedIndex over hoveredIndex', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      // Hover on index 0
      act(() => {
        const mockEvent = new MouseEvent('mouseenter', {
          clientX: 100,
          clientY: 200
        }) as unknown as React.MouseEvent
        result.current.handleMouseEnter(0, mockEvent)
      })
      expect(result.current.activeIndex).toBe(0)

      // Select index 2
      act(() => {
        result.current.handleClick(2)
      })
      expect(result.current.activeIndex).toBe(2) // Selected takes priority
    })

    it('should return null when nothing is active', () => {
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(createMockCallbacks(), { hoverable: false }))
      )

      expect(result.current.activeIndex).toBe(null)
    })
  })

  // getElementOpacity — pure delegation to core getChartElementOpacity,
  // covered by tests/core/chart-interaction.spec.ts

  describe('wrapperClasses', () => {
    it('should generate correct classes for bottom legend', () => {
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(createMockCallbacks(), { legendPosition: 'bottom' }))
      )

      expect(result.current.wrapperClasses).toContain('flex-col')
      expect(result.current.wrapperClasses).toContain('gap-2')
    })

    it('should generate correct classes for top legend', () => {
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(createMockCallbacks(), { legendPosition: 'top' }))
      )

      expect(result.current.wrapperClasses).toContain('flex-col-reverse')
      expect(result.current.wrapperClasses).toContain('gap-2')
    })

    it('should generate correct classes for right legend', () => {
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(createMockCallbacks(), { legendPosition: 'right' }))
      )

      expect(result.current.wrapperClasses).toContain('flex-row')
      expect(result.current.wrapperClasses).toContain('items-start')
      expect(result.current.wrapperClasses).toContain('gap-4')
    })

    it('should generate correct classes for left legend', () => {
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(createMockCallbacks(), { legendPosition: 'left' }))
      )

      expect(result.current.wrapperClasses).toContain('flex-row-reverse')
      expect(result.current.wrapperClasses).toContain('items-start')
      expect(result.current.wrapperClasses).toContain('gap-4')
    })
  })
})
