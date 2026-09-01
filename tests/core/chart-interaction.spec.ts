import { describe, it, expect, vi } from 'vitest'
import {
  createChartInteractionHandlers,
  createChartPointerMoveScheduler,
  getChartElementOpacity,
  nextChartSelectedIndex,
  resolveChartActiveIndex,
  shouldTrackChartPointer,
  type ChartInteractionState
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

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

  describe('resolveChartActiveIndex', () => {
    it('returns null when nothing is selected or hovered', () => {
      expect(resolveChartActiveIndex(null, null, true)).toBeNull()
    })

    it('prefers selected over hovered', () => {
      expect(resolveChartActiveIndex(2, 1, true)).toBe(2)
    })

    it('uses hovered only when hoverable', () => {
      expect(resolveChartActiveIndex(null, 1, true)).toBe(1)
      expect(resolveChartActiveIndex(null, 1, false)).toBeNull()
    })
  })

  describe('nextChartSelectedIndex', () => {
    it('toggles the same index off', () => {
      expect(nextChartSelectedIndex(1, 1)).toBeNull()
      expect(nextChartSelectedIndex(null, 1)).toBe(1)
    })
  })

  describe('shouldTrackChartPointer', () => {
    it('tracks when tooltip or hover is on', () => {
      expect(shouldTrackChartPointer(false, true)).toBe(true)
      expect(shouldTrackChartPointer(true, false)).toBe(true)
      expect(shouldTrackChartPointer(false, false)).toBe(false)
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
      it('does nothing when hoverable and tooltip are off', () => {
        const state = createState()
        const handlers = createChartInteractionHandlers(data, state, {
          hoverable: false,
          showTooltip: false
        })

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
      it('fires click without selecting when selectable is false', () => {
        const state = createState()
        const onItemClick = vi.fn()
        const handlers = createChartInteractionHandlers(data, state, {
          selectable: false,
          onItemClick
        })
        const event = { key: 'Enter', preventDefault: vi.fn() }

        handlers.onKeyDown(event, 1, data[1])
        expect(state.selectedIndex).toBeNull()
        expect(onItemClick).toHaveBeenCalledWith(1, data[1])
        expect(event.preventDefault).toHaveBeenCalled()
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

  describe('createChartPointerMoveScheduler', () => {
    it('batches pointer positions to one animation frame', () => {
      const scheduler = createFrameScheduler()
      const onPositionChange = vi.fn()
      const controller = createChartPointerMoveScheduler({
        onPositionChange,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame
      })

      controller.schedule({ x: 10, y: 20 })
      controller.schedule({ x: 30, y: 40 })
      controller.schedule({ x: 50, y: 60 })

      expect(controller.isPending()).toBe(true)
      expect(scheduler.pendingCount()).toBe(1)
      expect(onPositionChange).not.toHaveBeenCalled()

      scheduler.flush()

      expect(controller.isPending()).toBe(false)
      expect(onPositionChange).toHaveBeenCalledTimes(1)
      expect(onPositionChange).toHaveBeenCalledWith({ x: 50, y: 60 })
    })

    it('cancels queued pointer updates', () => {
      const scheduler = createFrameScheduler()
      const onPositionChange = vi.fn()
      const controller = createChartPointerMoveScheduler({
        onPositionChange,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame
      })

      controller.schedule({ x: 10, y: 20 })
      controller.cancel()
      scheduler.flush()

      expect(controller.isPending()).toBe(false)
      expect(onPositionChange).not.toHaveBeenCalled()
    })

    it('flushes queued pointer updates immediately', () => {
      const scheduler = createFrameScheduler()
      const onPositionChange = vi.fn()
      const controller = createChartPointerMoveScheduler({
        onPositionChange,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame
      })

      controller.schedule({ x: 15, y: 25 })
      controller.flush()

      expect(controller.isPending()).toBe(false)
      expect(scheduler.pendingCount()).toBe(0)
      expect(onPositionChange).toHaveBeenCalledWith({ x: 15, y: 25 })
    })
  })
})
