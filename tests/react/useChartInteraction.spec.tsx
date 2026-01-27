import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChartInteraction } from '@expcat/tigercat-react'
import type { UseChartInteractionOptions } from '@expcat/tigercat-react'

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
    callbacks: {
      onHover: callbacks.onHover,
      onClick: callbacks.onClick
    },
    getData: (index: number) => mockData[index],
    ...overrides
  })

  describe('initialization', () => {
    it('should initialize with null indices', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      expect(result.current.localHoveredIndex).toBe(null)
      expect(result.current.localSelectedIndex).toBe(null)
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

      expect(result.current.localHoveredIndex).toBe(1)
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

    it('should update tooltip position on mouse move', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      act(() => {
        const mockEvent = new MouseEvent('mousemove', {
          clientX: 300,
          clientY: 400
        }) as unknown as React.MouseEvent
        result.current.handleMouseMove(mockEvent)
      })

      expect(result.current.tooltipPosition).toEqual({ x: 300, y: 400 })
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
      expect(result.current.localHoveredIndex).toBe(1)

      act(() => {
        result.current.handleMouseLeave()
      })

      expect(result.current.localHoveredIndex).toBe(null)
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

      expect(result.current.localHoveredIndex).toBe(null)
      expect(callbacks.onHoveredIndexChange).not.toHaveBeenCalled()
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

      // Local state unchanged (controlled mode)
      expect(result.current.localHoveredIndex).toBe(null)
      // Resolved uses prop value
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

      expect(result.current.localSelectedIndex).toBe(1)
      expect(callbacks.onSelectedIndexChange).toHaveBeenCalledWith(1)
      expect(callbacks.onClick).toHaveBeenCalledWith(1, mockData[1])
    })

    it('should toggle selection on repeated click', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleClick(1)
      })
      expect(result.current.localSelectedIndex).toBe(1)

      act(() => {
        result.current.handleClick(1)
      })
      expect(result.current.localSelectedIndex).toBe(null)
      expect(callbacks.onSelectedIndexChange).toHaveBeenLastCalledWith(null)
    })

    it('should not update when selectable is false', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() =>
        useChartInteraction(createTestOptions(callbacks, { selectable: false }))
      )

      act(() => {
        result.current.handleClick(1)
      })

      expect(result.current.localSelectedIndex).toBe(null)
      expect(callbacks.onSelectedIndexChange).not.toHaveBeenCalled()
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

      expect(result.current.localSelectedIndex).toBe(2)
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

      expect(result.current.localSelectedIndex).toBe(1)
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

      expect(result.current.localSelectedIndex).toBe(null)
    })
  })

  describe('legend handlers', () => {
    it('should handle legend click as series click', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleLegendClick(2)
      })

      expect(result.current.localSelectedIndex).toBe(2)
      expect(callbacks.onClick).toHaveBeenCalledWith(2, mockData[2])
    })

    it('should handle legend hover', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleLegendHover(1)
      })

      expect(result.current.localHoveredIndex).toBe(1)
      expect(callbacks.onHoveredIndexChange).toHaveBeenCalledWith(1)
    })

    it('should handle legend leave', () => {
      const callbacks = createMockCallbacks()
      const { result } = renderHook(() => useChartInteraction(createTestOptions(callbacks)))

      act(() => {
        result.current.handleLegendHover(1)
      })
      expect(result.current.localHoveredIndex).toBe(1)

      act(() => {
        result.current.handleLegendLeave()
      })
      expect(result.current.localHoveredIndex).toBe(null)
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

  describe('getElementOpacity', () => {
    it('should return undefined when no active index', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      expect(result.current.getElementOpacity(0)).toBe(undefined)
      expect(result.current.getElementOpacity(1)).toBe(undefined)
    })

    it('should return activeOpacity for active element', () => {
      const { result } = renderHook(() =>
        useChartInteraction(
          createTestOptions(createMockCallbacks(), { activeOpacity: 1, inactiveOpacity: 0.3 })
        )
      )

      act(() => {
        result.current.handleClick(1)
      })

      expect(result.current.getElementOpacity(1)).toBe(1)
    })

    it('should return inactiveOpacity for inactive elements', () => {
      const { result } = renderHook(() =>
        useChartInteraction(
          createTestOptions(createMockCallbacks(), { activeOpacity: 1, inactiveOpacity: 0.3 })
        )
      )

      act(() => {
        result.current.handleClick(1)
      })

      expect(result.current.getElementOpacity(0)).toBe(0.3)
      expect(result.current.getElementOpacity(2)).toBe(0.3)
    })
  })

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

  describe('createLegendItems', () => {
    it('should create legend items from data', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      const items = [
        { label: 'Series A', color: '#ff0000' },
        { label: 'Series B', color: '#00ff00' },
        { label: 'Series C' }
      ]
      const palette = ['#0000ff', '#ffff00', '#ff00ff']

      const legendItems = result.current.createLegendItems(items, palette)

      expect(legendItems).toHaveLength(3)
      expect(legendItems[0]).toEqual({
        index: 0,
        label: 'Series A',
        color: '#ff0000',
        active: true
      })
      expect(legendItems[1]).toEqual({
        index: 1,
        label: 'Series B',
        color: '#00ff00',
        active: true
      })
      expect(legendItems[2]).toEqual({
        index: 2,
        label: 'Series C',
        color: '#ff00ff', // Falls back to palette
        active: true
      })
    })

    it('should mark inactive items when there is an active index', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      // Select index 1
      act(() => {
        result.current.handleClick(1)
      })

      const items = [{ label: 'A' }, { label: 'B' }, { label: 'C' }]
      const palette = ['#f00', '#0f0', '#00f']

      const legendItems = result.current.createLegendItems(items, palette)

      expect(legendItems[0].active).toBe(false)
      expect(legendItems[1].active).toBe(true)
      expect(legendItems[2].active).toBe(false)
    })

    it('should support custom label formatter', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      const items = [{ x: 'Mon' }, { x: 'Tue' }, { x: 'Wed' }]
      const palette = ['#f00', '#0f0', '#00f']
      const formatter = (item: unknown, index: number) =>
        `Day ${index + 1}: ${(item as { x: string }).x}`

      const legendItems = result.current.createLegendItems(items, palette, formatter)

      expect(legendItems[0].label).toBe('Day 1: Mon')
      expect(legendItems[1].label).toBe('Day 2: Tue')
      expect(legendItems[2].label).toBe('Day 3: Wed')
    })

    it('should fallback to x property or index for label', () => {
      const { result } = renderHook(() => useChartInteraction(createTestOptions()))

      const items = [{ x: 'Monday' }, { label: 'Custom' }, {}]
      const palette = ['#f00', '#0f0', '#00f']

      const legendItems = result.current.createLegendItems(items, palette)

      expect(legendItems[0].label).toBe('Monday')
      expect(legendItems[1].label).toBe('Custom')
      expect(legendItems[2].label).toBe('2') // Falls back to index
    })
  })
})
