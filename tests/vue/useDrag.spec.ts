/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { useDrag } from '@expcat/tigercat-vue'
import type { DragItem } from '@expcat/tigercat-core'

// Helper to call composable outside of setup()
function setupDrag(options = {}) {
  let result!: ReturnType<typeof useDrag>
  // useDrag uses reactive/computed which work outside components
  result = useDrag(options)
  return result
}

const item1: DragItem = { id: 'a', index: 0 }
const item2: DragItem = { id: 'b', index: 1 }
const item3: DragItem = { id: 'c', index: 2 }

describe('useDrag (Vue composable)', () => {
  describe('Initial state', () => {
    it('returns idle state by default', () => {
      const { state, isDragging, draggedItem } = setupDrag()
      expect(isDragging.value).toBe(false)
      expect(draggedItem.value).toBeNull()
      expect(state.isDragging).toBe(false)
    })

    it('isSameContainer and isCrossContainer are computed refs', () => {
      const { isSameContainer, isCrossContainer } = setupDrag()
      expect(isSameContainer.value).toBe(true) // same default containerId
      expect(isCrossContainer.value).toBe(false)
    })
  })

  describe('startDrag', () => {
    it('sets dragging state with an item', () => {
      const { startDrag, isDragging, draggedItem, state } = setupDrag()
      startDrag(item1)
      expect(isDragging.value).toBe(true)
      expect(draggedItem.value).toMatchObject({ id: 'a', index: 0 })
      expect(state.sourceIndex).toBe(0)
    })

    it('invokes onDragStart callback', () => {
      const onDragStart = vi.fn()
      const { startDrag } = setupDrag({ onDragStart })
      startDrag(item1)
      expect(onDragStart).toHaveBeenCalledWith(
        expect.objectContaining({ item: expect.objectContaining({ id: 'a' }) })
      )
    })

    it('does not start drag when config.disabled is true', () => {
      const { startDrag, isDragging } = setupDrag({ config: { disabled: true } })
      startDrag(item1)
      expect(isDragging.value).toBe(false)
    })

    it('validates drag handle when event is provided', () => {
      const { startDrag, isDragging } = setupDrag({
        config: { handleSelector: '.drag-handle' }
      })
      const el = document.createElement('div')
      const event = { target: el } as unknown as DragEvent
      startDrag(item1, event)
      // el does not match .drag-handle, so drag should not start
      expect(isDragging.value).toBe(false)
    })
  })

  describe('dragOver', () => {
    it('updates target item and index', () => {
      const { startDrag, dragOver, state } = setupDrag()
      startDrag(item1)
      dragOver(item2)
      expect(state.targetIndex).toBe(1)
      expect(state.hoveredItem).toMatchObject({ id: 'b' })
    })

    it('accepts null item (hovering over empty area)', () => {
      const { startDrag, dragOver, state } = setupDrag()
      startDrag(item1)
      dragOver(null)
      expect(state.hoveredItem).toBeNull()
    })

    it('invokes onDragOver callback', () => {
      const onDragOver = vi.fn()
      const { startDrag, dragOver } = setupDrag({ onDragOver })
      startDrag(item1)
      dragOver(item2)
      expect(onDragOver).toHaveBeenCalled()
    })

    it('calls event.preventDefault when DragEvent provided', () => {
      const { startDrag, dragOver } = setupDrag()
      startDrag(item1)
      const event = { preventDefault: vi.fn() } as unknown as DragEvent
      dragOver(item2, event)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('drop', () => {
    it('returns DragDropEvent with from/to data', () => {
      const { startDrag, dragOver, drop } = setupDrag()
      startDrag(item1)
      dragOver(item2)
      const result = drop()
      expect(result).toMatchObject({
        fromIndex: 0,
        toIndex: 1
      })
    })

    it('resets state after drop', () => {
      const { startDrag, dragOver, drop, isDragging } = setupDrag()
      startDrag(item1)
      dragOver(item2)
      drop()
      expect(isDragging.value).toBe(false)
    })

    it('invokes onDrop callback', () => {
      const onDrop = vi.fn()
      const { startDrag, dragOver, drop } = setupDrag({ onDrop })
      startDrag(item1)
      dragOver(item2)
      drop()
      expect(onDrop).toHaveBeenCalled()
    })

    it('calls event.preventDefault when DragEvent provided', () => {
      const { startDrag, drop } = setupDrag()
      startDrag(item1)
      const event = { preventDefault: vi.fn() } as unknown as DragEvent
      drop(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('returns null when not dragging', () => {
      const { drop } = setupDrag()
      expect(drop()).toBeNull()
    })
  })

  describe('endDrag', () => {
    it('resets drag state', () => {
      const { startDrag, endDrag, isDragging } = setupDrag()
      startDrag(item1)
      endDrag()
      expect(isDragging.value).toBe(false)
    })

    it('invokes onDragEnd callback with cancelled flag', () => {
      const onDragEnd = vi.fn()
      const { startDrag, endDrag } = setupDrag({ onDragEnd })
      startDrag(item1)
      endDrag(true)
      expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }))
    })
  })

  describe('reorder', () => {
    it('reorders items array based on drag state', () => {
      const items = [item1, item2, item3]
      const { startDrag, dragOver, reorder } = setupDrag()
      startDrag(item1) // sourceIndex = 0
      dragOver(item3) // targetIndex = 2
      const result = reorder(items)
      expect(result).not.toBeNull()
      expect(result!.items.map((i) => i.id)).toEqual(['b', 'c', 'a'])
    })

    it('returns null when not dragging', () => {
      const { reorder } = setupDrag()
      expect(reorder([item1, item2])).toBeNull()
    })
  })

  describe('moveBetween', () => {
    it('moves item between containers', () => {
      const source = [item1, item2]
      const target = [item3]
      const { startDrag, dragOver, moveBetween, state } = setupDrag()
      startDrag(item1) // sourceIndex = 0
      // Manually set targetIndex for cross-container scenario
      dragOver(item3)
      state.targetIndex = 1 // insert after item3
      const result = moveBetween(source, target)
      expect(result).not.toBeNull()
      expect(result!.sourceItems).toHaveLength(1)
      expect(result!.targetItems).toHaveLength(2)
    })

    it('returns null when not dragging', () => {
      const { moveBetween } = setupDrag()
      expect(moveBetween([item1], [item2])).toBeNull()
    })
  })

  describe('getDragItemAttrs', () => {
    it('returns draggable attributes for an item', () => {
      const { getDragItemAttrs } = setupDrag()
      const attrs = getDragItemAttrs(item1)
      expect(attrs.draggable).toBe(true)
      expect(attrs['data-drag-id']).toBe('a')
      expect(attrs['data-drag-index']).toBe(0)
      expect(attrs.role).toBe('listitem')
    })

    it('sets draggable false when config.disabled', () => {
      const { getDragItemAttrs } = setupDrag({ config: { disabled: true } })
      const attrs = getDragItemAttrs(item1)
      expect(attrs.draggable).toBe(false)
    })

    it('marks aria-grabbed for currently dragged item', () => {
      const { startDrag, getDragItemAttrs } = setupDrag()
      startDrag(item1)
      const attrs1 = getDragItemAttrs(item1)
      const attrs2 = getDragItemAttrs(item2)
      expect(attrs1['aria-grabbed']).toBe(true)
      expect(attrs2['aria-grabbed']).toBe(false)
    })

    it('applies dragClass to dragged item', () => {
      const { startDrag, getDragItemAttrs } = setupDrag({
        config: { dragClass: 'is-dragging' }
      })
      startDrag(item1)
      expect(getDragItemAttrs(item1).class).toBe('is-dragging')
      expect(getDragItemAttrs(item2).class).toBeUndefined()
    })
  })

  describe('getDropZoneAttrs', () => {
    it('returns drop zone attributes when idle', () => {
      const { getDropZoneAttrs } = setupDrag()
      const attrs = getDropZoneAttrs()
      expect(attrs['aria-dropeffect']).toBe('none')
    })

    it('returns move dropeffect when dragging', () => {
      const { startDrag, getDropZoneAttrs } = setupDrag()
      startDrag(item1)
      const attrs = getDropZoneAttrs()
      expect(attrs['aria-dropeffect']).toBe('move')
    })
  })

  describe('container identification', () => {
    it('uses custom containerId', () => {
      const onDragStart = vi.fn()
      const { startDrag } = setupDrag({ containerId: 'list-a', onDragStart })
      startDrag(item1)
      expect(onDragStart).toHaveBeenCalledWith(expect.objectContaining({ containerId: 'list-a' }))
    })

    it('isSameContainer is true for same container drag', () => {
      const { startDrag, dragOver, isSameContainer } = setupDrag({ containerId: 'x' })
      startDrag(item1)
      dragOver(item2)
      expect(isSameContainer.value).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { state, getDropZoneAttrs } = setupDrag()
      expect(state.isDragging).toBe(false)
      expect(getDropZoneAttrs()['aria-dropeffect']).toBe('none')
    })
  })
})
