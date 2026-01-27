import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useChartInteraction } from '@expcat/tigercat-vue'

describe('useChartInteraction (Vue)', () => {
  const createMockEmit = () => vi.fn()
  const mockData = [
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
    { label: 'C', value: 30 }
  ]

  const createTestOptions = (overrides = {}) => ({
    hoverable: true,
    selectable: true,
    activeOpacity: 1,
    inactiveOpacity: 0.3,
    legendPosition: 'bottom' as const,
    emit: createMockEmit(),
    getData: (index: number) => mockData[index],
    eventNames: { hover: 'series-hover', click: 'series-click' },
    ...overrides
  })

  describe('initialization', () => {
    it('should initialize with null indices', () => {
      const options = createTestOptions()
      const {
        localHoveredIndex,
        localSelectedIndex,
        resolvedHoveredIndex,
        resolvedSelectedIndex,
        activeIndex
      } = useChartInteraction(options)

      expect(localHoveredIndex.value).toBe(null)
      expect(localSelectedIndex.value).toBe(null)
      expect(resolvedHoveredIndex.value).toBe(null)
      expect(resolvedSelectedIndex.value).toBe(null)
      expect(activeIndex.value).toBe(null)
    })

    it('should initialize tooltip position', () => {
      const options = createTestOptions()
      const { tooltipPosition } = useChartInteraction(options)

      expect(tooltipPosition.value).toEqual({ x: 0, y: 0 })
    })
  })

  describe('hover interaction', () => {
    it('should update local hovered index on mouse enter', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localHoveredIndex, handleMouseEnter } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })
      handleMouseEnter(1, mockEvent)

      expect(localHoveredIndex.value).toBe(1)
      expect(emit).toHaveBeenCalledWith('update:hoveredIndex', 1)
      expect(emit).toHaveBeenCalledWith('series-hover', 1, mockData[1])
    })

    it('should update tooltip position on mouse enter', () => {
      const options = createTestOptions()
      const { tooltipPosition, handleMouseEnter } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 150, clientY: 250 })
      handleMouseEnter(0, mockEvent)

      expect(tooltipPosition.value).toEqual({ x: 150, y: 250 })
    })

    it('should update tooltip position on mouse move', () => {
      const options = createTestOptions()
      const { tooltipPosition, handleMouseMove } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mousemove', { clientX: 300, clientY: 400 })
      handleMouseMove(mockEvent)

      expect(tooltipPosition.value).toEqual({ x: 300, y: 400 })
    })

    it('should clear hovered index on mouse leave', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localHoveredIndex, handleMouseEnter, handleMouseLeave } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })
      handleMouseEnter(1, mockEvent)
      expect(localHoveredIndex.value).toBe(1)

      handleMouseLeave()
      expect(localHoveredIndex.value).toBe(null)
      expect(emit).toHaveBeenCalledWith('update:hoveredIndex', null)
      expect(emit).toHaveBeenCalledWith('series-hover', null, null)
    })

    it('should not update when hoverable is false', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ hoverable: false, emit })
      const { localHoveredIndex, handleMouseEnter } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })
      handleMouseEnter(1, mockEvent)

      expect(localHoveredIndex.value).toBe(null)
      expect(emit).not.toHaveBeenCalledWith('update:hoveredIndex', expect.anything())
    })

    it('should support hoverable as ref', async () => {
      const hoverableRef = ref(false)
      const emit = createMockEmit()
      const options = createTestOptions({ hoverable: hoverableRef, emit })
      const { localHoveredIndex, handleMouseEnter } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })

      // Should not update when false
      handleMouseEnter(1, mockEvent)
      expect(localHoveredIndex.value).toBe(null)

      // Enable hoverable
      hoverableRef.value = true
      handleMouseEnter(1, mockEvent)
      expect(localHoveredIndex.value).toBe(1)
    })
  })

  describe('controlled hover mode', () => {
    it('should not update local state when controlled', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ hoveredIndexProp: 0, emit })
      const { localHoveredIndex, resolvedHoveredIndex, handleMouseEnter } =
        useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })
      handleMouseEnter(2, mockEvent)

      // Local state unchanged (controlled mode)
      expect(localHoveredIndex.value).toBe(null)
      // Resolved uses prop value
      expect(resolvedHoveredIndex.value).toBe(0)
      // But still emits update event for parent to handle
      expect(emit).toHaveBeenCalledWith('update:hoveredIndex', 2)
    })
  })

  describe('click selection', () => {
    it('should update selected index on click', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localSelectedIndex, handleClick } = useChartInteraction(options)

      handleClick(1)

      expect(localSelectedIndex.value).toBe(1)
      expect(emit).toHaveBeenCalledWith('update:selectedIndex', 1)
      expect(emit).toHaveBeenCalledWith('series-click', 1, mockData[1])
    })

    it('should toggle selection on repeated click', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localSelectedIndex, handleClick } = useChartInteraction(options)

      handleClick(1)
      expect(localSelectedIndex.value).toBe(1)

      handleClick(1)
      expect(localSelectedIndex.value).toBe(null)
      expect(emit).toHaveBeenCalledWith('update:selectedIndex', null)
    })

    it('should not update when selectable is false', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ selectable: false, emit })
      const { localSelectedIndex, handleClick } = useChartInteraction(options)

      handleClick(1)

      expect(localSelectedIndex.value).toBe(null)
      expect(emit).not.toHaveBeenCalledWith('update:selectedIndex', expect.anything())
    })
  })

  describe('keyboard interaction', () => {
    it('should select on Enter key', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localSelectedIndex, handleKeyDown } = useChartInteraction(options)

      const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      vi.spyOn(mockEvent, 'preventDefault')

      handleKeyDown(mockEvent, 2)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(localSelectedIndex.value).toBe(2)
    })

    it('should select on Space key', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localSelectedIndex, handleKeyDown } = useChartInteraction(options)

      const mockEvent = new KeyboardEvent('keydown', { key: ' ' })
      vi.spyOn(mockEvent, 'preventDefault')

      handleKeyDown(mockEvent, 1)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(localSelectedIndex.value).toBe(1)
    })

    it('should ignore other keys', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localSelectedIndex, handleKeyDown } = useChartInteraction(options)

      const mockEvent = new KeyboardEvent('keydown', { key: 'Tab' })

      handleKeyDown(mockEvent, 1)

      expect(localSelectedIndex.value).toBe(null)
    })
  })

  describe('legend handlers', () => {
    it('should handle legend click as series click', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localSelectedIndex, handleLegendClick } = useChartInteraction(options)

      handleLegendClick(2)

      expect(localSelectedIndex.value).toBe(2)
      expect(emit).toHaveBeenCalledWith('series-click', 2, mockData[2])
    })

    it('should handle legend hover', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localHoveredIndex, handleLegendHover } = useChartInteraction(options)

      handleLegendHover(1)

      expect(localHoveredIndex.value).toBe(1)
      expect(emit).toHaveBeenCalledWith('update:hoveredIndex', 1)
    })

    it('should handle legend leave', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit })
      const { localHoveredIndex, handleLegendHover, handleLegendLeave } =
        useChartInteraction(options)

      handleLegendHover(1)
      expect(localHoveredIndex.value).toBe(1)

      handleLegendLeave()
      expect(localHoveredIndex.value).toBe(null)
    })
  })

  describe('activeIndex computation', () => {
    it('should prioritize selectedIndex over hoveredIndex', () => {
      const options = createTestOptions()
      const { activeIndex, handleMouseEnter, handleClick } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })

      // Hover on index 0
      handleMouseEnter(0, mockEvent)
      expect(activeIndex.value).toBe(0)

      // Select index 2
      handleClick(2)
      expect(activeIndex.value).toBe(2) // Selected takes priority
    })

    it('should return null when nothing is active', () => {
      const options = createTestOptions({ hoverable: false })
      const { activeIndex } = useChartInteraction(options)

      expect(activeIndex.value).toBe(null)
    })
  })

  describe('getElementOpacity', () => {
    it('should return undefined when no active index', () => {
      const options = createTestOptions()
      const { getElementOpacity } = useChartInteraction(options)

      expect(getElementOpacity(0)).toBe(undefined)
      expect(getElementOpacity(1)).toBe(undefined)
    })

    it('should return activeOpacity for active element', () => {
      const options = createTestOptions({ activeOpacity: 1, inactiveOpacity: 0.3 })
      const { getElementOpacity, handleClick } = useChartInteraction(options)

      handleClick(1)

      expect(getElementOpacity(1)).toBe(1)
    })

    it('should return inactiveOpacity for inactive elements', () => {
      const options = createTestOptions({ activeOpacity: 1, inactiveOpacity: 0.3 })
      const { getElementOpacity, handleClick } = useChartInteraction(options)

      handleClick(1)

      expect(getElementOpacity(0)).toBe(0.3)
      expect(getElementOpacity(2)).toBe(0.3)
    })
  })

  describe('wrapperClasses', () => {
    it('should generate correct classes for bottom legend', () => {
      const options = createTestOptions({ legendPosition: 'bottom' })
      const { wrapperClasses } = useChartInteraction(options)

      expect(wrapperClasses.value).toContain('flex-col')
      expect(wrapperClasses.value).toContain('gap-2')
    })

    it('should generate correct classes for top legend', () => {
      const options = createTestOptions({ legendPosition: 'top' })
      const { wrapperClasses } = useChartInteraction(options)

      expect(wrapperClasses.value).toContain('flex-col-reverse')
      expect(wrapperClasses.value).toContain('gap-2')
    })

    it('should generate correct classes for right legend', () => {
      const options = createTestOptions({ legendPosition: 'right' })
      const { wrapperClasses } = useChartInteraction(options)

      expect(wrapperClasses.value).toContain('flex-row')
      expect(wrapperClasses.value).toContain('items-start')
      expect(wrapperClasses.value).toContain('gap-4')
    })

    it('should generate correct classes for left legend', () => {
      const options = createTestOptions({ legendPosition: 'left' })
      const { wrapperClasses } = useChartInteraction(options)

      expect(wrapperClasses.value).toContain('flex-row-reverse')
      expect(wrapperClasses.value).toContain('items-start')
      expect(wrapperClasses.value).toContain('gap-4')
    })

    it('should support legendPosition as ref', async () => {
      const positionRef = ref<'bottom' | 'top' | 'left' | 'right'>('bottom')
      const options = createTestOptions({ legendPosition: positionRef })
      const { wrapperClasses } = useChartInteraction(options)

      expect(wrapperClasses.value).toContain('flex-col')

      positionRef.value = 'right'
      await nextTick()
      expect(wrapperClasses.value).toContain('flex-row')
    })
  })

  describe('createLegendItems', () => {
    it('should create legend items from data', () => {
      const options = createTestOptions()
      const { createLegendItems } = useChartInteraction(options)

      const items = [
        { label: 'Series A', color: '#ff0000' },
        { label: 'Series B', color: '#00ff00' },
        { label: 'Series C' }
      ]
      const palette = ['#0000ff', '#ffff00', '#ff00ff']

      const result = createLegendItems(items, palette)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        index: 0,
        label: 'Series A',
        color: '#ff0000',
        active: true
      })
      expect(result[1]).toEqual({
        index: 1,
        label: 'Series B',
        color: '#00ff00',
        active: true
      })
      expect(result[2]).toEqual({
        index: 2,
        label: 'Series C',
        color: '#ff00ff', // Falls back to palette
        active: true
      })
    })

    it('should mark inactive items when there is an active index', () => {
      const options = createTestOptions()
      const { createLegendItems, handleClick } = useChartInteraction(options)

      // Select index 1
      handleClick(1)

      const items = [{ label: 'A' }, { label: 'B' }, { label: 'C' }]
      const palette = ['#f00', '#0f0', '#00f']

      const result = createLegendItems(items, palette)

      expect(result[0].active).toBe(false)
      expect(result[1].active).toBe(true)
      expect(result[2].active).toBe(false)
    })

    it('should support custom label formatter', () => {
      const options = createTestOptions()
      const { createLegendItems } = useChartInteraction(options)

      const items = [{ x: 'Mon' }, { x: 'Tue' }, { x: 'Wed' }]
      const palette = ['#f00', '#0f0', '#00f']
      const formatter = (item: unknown, index: number) =>
        `Day ${index + 1}: ${(item as { x: string }).x}`

      const result = createLegendItems(items, palette, formatter)

      expect(result[0].label).toBe('Day 1: Mon')
      expect(result[1].label).toBe('Day 2: Tue')
      expect(result[2].label).toBe('Day 3: Wed')
    })

    it('should fallback to x property or index for label', () => {
      const options = createTestOptions()
      const { createLegendItems } = useChartInteraction(options)

      const items = [{ x: 'Monday' }, { label: 'Custom' }, {}]
      const palette = ['#f00', '#0f0', '#00f']

      const result = createLegendItems(items, palette)

      expect(result[0].label).toBe('Monday')
      expect(result[1].label).toBe('Custom')
      expect(result[2].label).toBe('2') // Falls back to index
    })
  })

  describe('custom event names', () => {
    it('should use custom hover event name', () => {
      const emit = createMockEmit()
      const options = createTestOptions({
        emit,
        eventNames: { hover: 'custom-hover', click: 'custom-click' }
      })
      const { handleMouseEnter, handleMouseLeave } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })
      handleMouseEnter(1, mockEvent)

      expect(emit).toHaveBeenCalledWith('custom-hover', 1, mockData[1])

      handleMouseLeave()
      expect(emit).toHaveBeenCalledWith('custom-hover', null, null)
    })

    it('should use custom click event name', () => {
      const emit = createMockEmit()
      const options = createTestOptions({
        emit,
        eventNames: { hover: 'custom-hover', click: 'custom-click' }
      })
      const { handleClick } = useChartInteraction(options)

      handleClick(2)

      expect(emit).toHaveBeenCalledWith('custom-click', 2, mockData[2])
    })

    it('should skip event if no event name provided', () => {
      const emit = createMockEmit()
      const options = createTestOptions({ emit, eventNames: undefined })
      const { handleMouseEnter, handleClick } = useChartInteraction(options)

      const mockEvent = new MouseEvent('mouseenter', { clientX: 100, clientY: 200 })
      handleMouseEnter(1, mockEvent)
      handleClick(1)

      // Should still emit update events
      expect(emit).toHaveBeenCalledWith('update:hoveredIndex', 1)
      expect(emit).toHaveBeenCalledWith('update:selectedIndex', 1)
      // But not custom events
      expect(emit).not.toHaveBeenCalledWith('series-hover', expect.anything(), expect.anything())
      expect(emit).not.toHaveBeenCalledWith('series-click', expect.anything(), expect.anything())
    })
  })
})
