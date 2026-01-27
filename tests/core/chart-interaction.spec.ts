import { describe, it, expect, vi } from 'vitest'
import {
  createChartInteractionHandlers,
  getActiveIndex,
  getChartElementOpacity,
  defaultTooltipFormatter,
  getChartAnimationStyle,
  getChartEntranceTransform,
  chartInteractiveClasses,
  type ChartInteractionState
} from '@expcat/tigercat-core'

describe('chart-interaction', () => {
  // ==========================================================================
  // getChartElementOpacity
  // ==========================================================================

  describe('getChartElementOpacity', () => {
    it('returns undefined when no active index', () => {
      expect(getChartElementOpacity(0, null)).toBeUndefined()
    })

    it('returns defaultOpacity when no active index and default provided', () => {
      expect(getChartElementOpacity(0, null, { defaultOpacity: 0.8 })).toBe(0.8)
    })

    it('returns activeOpacity for matching index', () => {
      expect(getChartElementOpacity(2, 2)).toBe(1)
      expect(getChartElementOpacity(2, 2, { activeOpacity: 0.9 })).toBe(0.9)
    })

    it('returns inactiveOpacity for non-matching index', () => {
      expect(getChartElementOpacity(0, 2)).toBe(0.25)
      expect(getChartElementOpacity(0, 2, { inactiveOpacity: 0.3 })).toBe(0.3)
    })
  })

  // ==========================================================================
  // getActiveIndex
  // ==========================================================================

  describe('getActiveIndex', () => {
    it('returns null when all indices are null', () => {
      expect(getActiveIndex(null, null)).toBeNull()
    })

    it('prioritizes controlled selected over all', () => {
      expect(getActiveIndex(1, 2, 3, 4)).toBe(4)
    })

    it('uses uncontrolled selected when controlled selected is null', () => {
      expect(getActiveIndex(1, 2, 3, null)).toBe(2)
      expect(getActiveIndex(1, 2, 3, undefined)).toBe(2)
    })

    it('uses controlled hovered when no selection', () => {
      expect(getActiveIndex(1, null, 3, null)).toBe(3)
    })

    it('uses uncontrolled hovered as last resort', () => {
      expect(getActiveIndex(1, null, null, null)).toBe(1)
      expect(getActiveIndex(1, null, undefined, undefined)).toBe(1)
    })
  })

  // ==========================================================================
  // createChartInteractionHandlers
  // ==========================================================================

  describe('createChartInteractionHandlers', () => {
    const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]

    const createState = (): ChartInteractionState => ({
      hoveredIndex: null,
      selectedIndex: null
    })

    describe('hover behavior', () => {
      it('does nothing when hoverable is false', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { hoverable: false })

        handlers.onMouseEnter(1, data[1])
        expect(state.hoveredIndex).toBeNull()

        handlers.onMouseLeave()
        expect(state.hoveredIndex).toBeNull()
      })

      it('updates local state in uncontrolled mode', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { hoverable: true })

        handlers.onMouseEnter(1, data[1])
        expect(state.hoveredIndex).toBe(1)

        handlers.onMouseLeave()
        expect(state.hoveredIndex).toBeNull()
      })

      it('calls onHoverChange in controlled mode', () => {
        const state = createState()
        const onHoverChange = vi.fn()
        const handlers = createChartInteractionHandlers(data, state, {
          hoverable: true,
          hoveredIndex: 0, // controlled
          onHoverChange
        })

        handlers.onMouseEnter(2, data[2])
        expect(onHoverChange).toHaveBeenCalledWith(2, data[2])
        expect(state.hoveredIndex).toBeNull() // not updated locally

        handlers.onMouseLeave()
        expect(onHoverChange).toHaveBeenCalledWith(null, null)
      })
    })

    describe('selection behavior', () => {
      it('does nothing when selectable is false', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { selectable: false })

        handlers.onClick(1, data[1])
        expect(state.selectedIndex).toBeNull()
      })

      it('toggles selection in uncontrolled mode', () => {
        const state = createState()
        const onSelectChange = vi.fn()
        const handlers = createChartInteractionHandlers(data, state, {
          selectable: true,
          onSelectChange
        })

        handlers.onClick(1, data[1])
        expect(state.selectedIndex).toBe(1)
        expect(onSelectChange).toHaveBeenCalledWith(1, data[1])

        // Click same item again to deselect
        handlers.onClick(1, data[1])
        expect(state.selectedIndex).toBeNull()
        expect(onSelectChange).toHaveBeenCalledWith(null, null)
      })

      it('calls onSelectChange in controlled mode without local update', () => {
        const state = createState()
        const onSelectChange = vi.fn()
        const handlers = createChartInteractionHandlers(data, state, {
          selectable: true,
          selectedIndex: 0, // controlled
          onSelectChange
        })

        handlers.onClick(2, data[2])
        expect(onSelectChange).toHaveBeenCalledWith(2, data[2])
        expect(state.selectedIndex).toBeNull() // not updated locally
      })

      it('calls onItemClick regardless of selectable state', () => {
        const state = createState()
        const onItemClick = vi.fn()
        const handlers = createChartInteractionHandlers(data, state, {
          selectable: false,
          onItemClick
        })

        handlers.onClick(1, data[1])
        expect(onItemClick).toHaveBeenCalledWith(1, data[1])
      })
    })

    describe('keyboard behavior', () => {
      it('does nothing when selectable is false', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { selectable: false })
        const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent

        handlers.onKeyDown(event, 1, data[1])
        expect(state.selectedIndex).toBeNull()
        expect(event.preventDefault).not.toHaveBeenCalled()
      })

      it('selects on Enter key', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { selectable: true })
        const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent

        handlers.onKeyDown(event, 1, data[1])
        expect(state.selectedIndex).toBe(1)
        expect(event.preventDefault).toHaveBeenCalled()
      })

      it('selects on Space key', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { selectable: true })
        const event = { key: ' ', preventDefault: vi.fn() } as unknown as KeyboardEvent

        handlers.onKeyDown(event, 2, data[2])
        expect(state.selectedIndex).toBe(2)
      })

      it('ignores other keys', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, { selectable: true })
        const event = { key: 'Tab', preventDefault: vi.fn() } as unknown as KeyboardEvent

        handlers.onKeyDown(event, 1, data[1])
        expect(state.selectedIndex).toBeNull()
        expect(event.preventDefault).not.toHaveBeenCalled()
      })
    })
  })

  // ==========================================================================
  // defaultTooltipFormatter
  // ==========================================================================

  describe('defaultTooltipFormatter', () => {
    it('formats basic label and value', () => {
      expect(defaultTooltipFormatter('Sales', 100)).toBe('Sales: 100')
    })

    it('includes series name prefix', () => {
      expect(defaultTooltipFormatter('Jan', 50, 'Revenue')).toBe('Revenue · Jan: 50')
    })

    it('uses index as fallback when label is undefined', () => {
      expect(defaultTooltipFormatter(undefined, 25, undefined, 3)).toBe('#4: 25')
    })

    it('uses empty string when no label or index', () => {
      expect(defaultTooltipFormatter(undefined, 10)).toBe(': 10')
    })
  })

  // ==========================================================================
  // Animation utilities
  // ==========================================================================

  describe('getChartAnimationStyle', () => {
    it('returns empty string when not animated', () => {
      expect(getChartAnimationStyle({ animated: false })).toBe('')
    })

    it('returns transition style with defaults', () => {
      const style = getChartAnimationStyle({ animated: true })
      expect(style).toBe('transition: all 300ms ease-out 0ms')
    })

    it('respects custom duration and easing', () => {
      const style = getChartAnimationStyle({
        animated: true,
        duration: 500,
        easing: 'ease-in'
      })
      expect(style).toBe('transition: all 500ms ease-in 0ms')
    })

    it('applies stagger delay based on index', () => {
      const style = getChartAnimationStyle({ animated: true, stagger: 100 }, 3)
      expect(style).toBe('transition: all 300ms ease-out 300ms')
    })
  })

  describe('getChartEntranceTransform', () => {
    it('returns scale transform', () => {
      const transform = getChartEntranceTransform('scale', 0.5, { originX: 100, originY: 50 })
      expect(transform).toContain('translate')
      expect(transform).toContain('scale(0.5)')
    })

    it('returns slide-up transform', () => {
      const transform = getChartEntranceTransform('slide-up', 0.5)
      expect(transform).toBe('translate(0, 10)')
    })

    it('returns slide-left transform', () => {
      const transform = getChartEntranceTransform('slide-left', 0.5)
      expect(transform).toBe('translate(10, 0)')
    })

    it('returns empty string for fade', () => {
      expect(getChartEntranceTransform('fade', 0.5)).toBe('')
    })
  })

  // ==========================================================================
  // CSS Classes
  // ==========================================================================

  describe('chartInteractiveClasses', () => {
    it('has hoverable class', () => {
      expect(chartInteractiveClasses.hoverable).toContain('cursor-pointer')
      expect(chartInteractiveClasses.hoverable).toContain('transition')
    })

    it('has selectable class', () => {
      expect(chartInteractiveClasses.selectable).toContain('cursor-pointer')
      expect(chartInteractiveClasses.selectable).toContain('focus')
    })

    it('has active class', () => {
      expect(chartInteractiveClasses.active).toContain('ring')
    })
  })
})
