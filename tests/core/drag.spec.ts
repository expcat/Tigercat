import { describe, it, expect, vi } from 'vitest'
import {
  createDragState,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  updateDragOffset,
  reorderItems,
  moveItemBetweenContainers,
  isSameContainerDrag,
  isCrossContainerDrag,
  isValidDragHandle,
  isDragEnabled,
  toDragItems,
  getDefaultDragConfig,
  resolveDragConfig
} from '@expcat/tigercat-core'
import type { DragItem, DragState, DragCallbacks, DragConfig } from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItems(count: number, containerId = 'list-1'): DragItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    index: i,
    containerId,
    data: { label: `Item ${i}` }
  }))
}

// ---------------------------------------------------------------------------
// createDragState
// ---------------------------------------------------------------------------

describe('createDragState', () => {
  it('returns default state with all fields initialized', () => {
    const state = createDragState()
    expect(state.isDragging).toBe(false)
    expect(state.draggedItem).toBeNull()
    expect(state.hoveredItem).toBeNull()
    expect(state.sourceContainerId).toBeNull()
    expect(state.targetContainerId).toBeNull()
    expect(state.sourceIndex).toBe(-1)
    expect(state.targetIndex).toBe(-1)
    expect(state.offsetX).toBe(0)
    expect(state.offsetY).toBe(0)
  })

  it('returns a new object each time', () => {
    const a = createDragState()
    const b = createDragState()
    expect(a).not.toBe(b)
  })
})

// ---------------------------------------------------------------------------
// handleDragStart
// ---------------------------------------------------------------------------

describe('handleDragStart', () => {
  it('sets isDragging to true and stores item info', () => {
    const state = createDragState()
    const item = makeItems(1)[0]
    handleDragStart(state, item, 'container-a')

    expect(state.isDragging).toBe(true)
    expect(state.draggedItem).toEqual(item)
    expect(state.sourceContainerId).toBe('container-a')
    expect(state.targetContainerId).toBe('container-a')
    expect(state.sourceIndex).toBe(0)
    expect(state.targetIndex).toBe(0)
  })

  it('calls onDragStart callback', () => {
    const state = createDragState()
    const item = makeItems(1)[0]
    const cb: DragCallbacks = {
      onDragStart: vi.fn()
    }
    handleDragStart(state, item, 'c1', cb)

    expect(cb.onDragStart).toHaveBeenCalledOnce()
    expect(cb.onDragStart).toHaveBeenCalledWith({
      item: expect.objectContaining({ id: 'item-0' }),
      containerId: 'c1'
    })
  })

  it('copies item to prevent external mutation', () => {
    const state = createDragState()
    const item = makeItems(1)[0]
    handleDragStart(state, item, 'c1')
    item.index = 999
    expect(state.draggedItem?.index).toBe(0)
  })

  it('resets offsets to zero', () => {
    const state = createDragState()
    state.offsetX = 100
    state.offsetY = 200
    handleDragStart(state, makeItems(1)[0], 'c1')
    expect(state.offsetX).toBe(0)
    expect(state.offsetY).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// handleDragOver
// ---------------------------------------------------------------------------

describe('handleDragOver', () => {
  it('updates target index and hovered item', () => {
    const state = createDragState()
    const items = makeItems(5)
    handleDragStart(state, items[0], 'c1')
    handleDragOver(state, items[3], 'c1')

    expect(state.targetIndex).toBe(3)
    expect(state.hoveredItem?.id).toBe('item-3')
  })

  it('does nothing if not dragging', () => {
    const state = createDragState()
    const items = makeItems(3)
    handleDragOver(state, items[1], 'c1')
    expect(state.targetIndex).toBe(-1)
    expect(state.hoveredItem).toBeNull()
  })

  it('handles null overItem gracefully', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDragOver(state, null, 'c1')
    expect(state.hoveredItem).toBeNull()
  })

  it('updates target container for cross-container drag', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDragOver(state, { id: 'x', index: 2, containerId: 'c2' }, 'c2')
    expect(state.targetContainerId).toBe('c2')
  })

  it('calls onDragOver callback', () => {
    const state = createDragState()
    const cb: DragCallbacks = { onDragOver: vi.fn() }
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDragOver(state, { id: 'x', index: 2 }, 'c1', cb)
    expect(cb.onDragOver).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// handleDrop
// ---------------------------------------------------------------------------

describe('handleDrop', () => {
  it('returns drop event with correct from/to info', () => {
    const state = createDragState()
    const items = makeItems(5)
    handleDragStart(state, items[1], 'c1')
    handleDragOver(state, items[3], 'c1')

    const event = handleDrop(state)
    expect(event).not.toBeNull()
    expect(event?.fromIndex).toBe(1)
    expect(event?.toIndex).toBe(3)
    expect(event?.fromContainerId).toBe('c1')
    expect(event?.toContainerId).toBe('c1')
    expect(event?.item.id).toBe('item-1')
  })

  it('resets state after drop', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDrop(state)
    expect(state.isDragging).toBe(false)
    expect(state.draggedItem).toBeNull()
  })

  it('returns null if not dragging', () => {
    const state = createDragState()
    expect(handleDrop(state)).toBeNull()
  })

  it('calls onDrop callback', () => {
    const state = createDragState()
    const cb: DragCallbacks = { onDrop: vi.fn() }
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDrop(state, cb)
    expect(cb.onDrop).toHaveBeenCalledOnce()
  })

  it('handles cross-container drop', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1, 'c1')[0], 'c1')
    handleDragOver(state, { id: 'target', index: 2, containerId: 'c2' }, 'c2')
    const event = handleDrop(state)
    expect(event?.fromContainerId).toBe('c1')
    expect(event?.toContainerId).toBe('c2')
  })
})

// ---------------------------------------------------------------------------
// handleDragEnd
// ---------------------------------------------------------------------------

describe('handleDragEnd', () => {
  it('resets state and fires callback', () => {
    const state = createDragState()
    const cb: DragCallbacks = { onDragEnd: vi.fn() }
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDragEnd(state, true, cb)

    expect(state.isDragging).toBe(false)
    expect(cb.onDragEnd).toHaveBeenCalledWith({
      item: expect.objectContaining({ id: 'item-0' }),
      cancelled: true
    })
  })

  it('does nothing if not dragging', () => {
    const state = createDragState()
    const cb: DragCallbacks = { onDragEnd: vi.fn() }
    handleDragEnd(state, false, cb)
    expect(cb.onDragEnd).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// updateDragOffset
// ---------------------------------------------------------------------------

describe('updateDragOffset', () => {
  it('updates offset values', () => {
    const state = createDragState()
    updateDragOffset(state, 50, 75)
    expect(state.offsetX).toBe(50)
    expect(state.offsetY).toBe(75)
  })
})

// ---------------------------------------------------------------------------
// reorderItems
// ---------------------------------------------------------------------------

describe('reorderItems', () => {
  it('moves item forward in the list', () => {
    const items = makeItems(5)
    const result = reorderItems(items, 1, 3)
    expect(result.items.map((i) => i.id)).toEqual([
      'item-0',
      'item-2',
      'item-3',
      'item-1',
      'item-4'
    ])
  })

  it('moves item backward in the list', () => {
    const items = makeItems(5)
    const result = reorderItems(items, 3, 1)
    expect(result.items.map((i) => i.id)).toEqual([
      'item-0',
      'item-3',
      'item-1',
      'item-2',
      'item-4'
    ])
  })

  it('updates indices correctly after reorder', () => {
    const items = makeItems(3)
    const result = reorderItems(items, 0, 2)
    result.items.forEach((item, i) => {
      expect(item.index).toBe(i)
    })
  })

  it('returns unchanged array when fromIndex === toIndex', () => {
    const items = makeItems(3)
    const result = reorderItems(items, 1, 1)
    expect(result.items.map((i) => i.id)).toEqual(['item-0', 'item-1', 'item-2'])
  })

  it('returns unchanged array for out-of-bounds fromIndex', () => {
    const items = makeItems(3)
    const result = reorderItems(items, -1, 2)
    expect(result.items).toHaveLength(3)
  })

  it('returns unchanged array for out-of-bounds toIndex', () => {
    const items = makeItems(3)
    const result = reorderItems(items, 0, 10)
    expect(result.items).toHaveLength(3)
  })

  it('does not mutate original array', () => {
    const items = makeItems(3)
    const originalIds = items.map((i) => i.id)
    reorderItems(items, 0, 2)
    expect(items.map((i) => i.id)).toEqual(originalIds)
  })

  it('handles single-item array', () => {
    const items = makeItems(1)
    const result = reorderItems(items, 0, 0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe('item-0')
  })

  it('handles empty array', () => {
    const result = reorderItems([], 0, 0)
    expect(result.items).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// moveItemBetweenContainers
// ---------------------------------------------------------------------------

describe('moveItemBetweenContainers', () => {
  it('moves item from source to target', () => {
    const source = makeItems(3, 'src')
    const target = makeItems(2, 'tgt')
    const result = moveItemBetweenContainers(source, target, 1, 0)

    expect(result.sourceItems).toHaveLength(2)
    expect(result.targetItems).toHaveLength(3)
    expect(result.movedItem.id).toBe('item-1')
    expect(result.targetItems[0].id).toBe('item-1')
  })

  it('updates indices in both containers', () => {
    const source = makeItems(3, 'src')
    const target = makeItems(2, 'tgt')
    const result = moveItemBetweenContainers(source, target, 0, 1)

    result.sourceItems.forEach((item, i) => expect(item.index).toBe(i))
    result.targetItems.forEach((item, i) => expect(item.index).toBe(i))
  })

  it('clamps toIndex to target length', () => {
    const source = makeItems(2, 'src')
    const target = makeItems(1, 'tgt')
    const result = moveItemBetweenContainers(source, target, 0, 100)

    expect(result.targetItems).toHaveLength(2)
    expect(result.movedItem.index).toBe(1) // clamped to end
  })

  it('handles move to empty target', () => {
    const source = makeItems(3, 'src')
    const result = moveItemBetweenContainers(source, [], 0, 0)

    expect(result.sourceItems).toHaveLength(2)
    expect(result.targetItems).toHaveLength(1)
    expect(result.targetItems[0].id).toBe('item-0')
  })

  it('handles invalid fromIndex gracefully', () => {
    const source = makeItems(2)
    const target = makeItems(2)
    const result = moveItemBetweenContainers(source, target, -1, 0)
    expect(result.sourceItems).toHaveLength(2) // unchanged
    expect(result.targetItems).toHaveLength(2) // unchanged
  })

  it('does not mutate original arrays', () => {
    const source = makeItems(3)
    const target = makeItems(2)
    const sourceLen = source.length
    const targetLen = target.length
    moveItemBetweenContainers(source, target, 0, 0)
    expect(source).toHaveLength(sourceLen)
    expect(target).toHaveLength(targetLen)
  })
})

// ---------------------------------------------------------------------------
// State Inspection Helpers
// ---------------------------------------------------------------------------

describe('isSameContainerDrag', () => {
  it('returns true when source equals target', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1)[0], 'c1')
    expect(isSameContainerDrag(state)).toBe(true)
  })

  it('returns false when containers differ', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDragOver(state, { id: 'x', index: 0 }, 'c2')
    expect(isSameContainerDrag(state)).toBe(false)
  })
})

describe('isCrossContainerDrag', () => {
  it('returns true when containers differ', () => {
    const state = createDragState()
    handleDragStart(state, makeItems(1)[0], 'c1')
    handleDragOver(state, { id: 'x', index: 0 }, 'c2')
    expect(isCrossContainerDrag(state)).toBe(true)
  })

  it('returns false when not dragging', () => {
    const state = createDragState()
    expect(isCrossContainerDrag(state)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Config Helpers
// ---------------------------------------------------------------------------

describe('isDragEnabled', () => {
  it('returns true with no config', () => {
    expect(isDragEnabled()).toBe(true)
  })

  it('returns true when disabled is false', () => {
    expect(isDragEnabled({ disabled: false })).toBe(true)
  })

  it('returns false when disabled is true', () => {
    expect(isDragEnabled({ disabled: true })).toBe(false)
  })
})

describe('isValidDragHandle', () => {
  it('returns true when no handleSelector', () => {
    const el = document.createElement('div')
    expect(isValidDragHandle(el)).toBe(true)
  })

  it('returns true when element matches handleSelector', () => {
    const parent = document.createElement('div')
    const handle = document.createElement('span')
    handle.className = 'drag-handle'
    parent.appendChild(handle)
    expect(isValidDragHandle(handle, { handleSelector: '.drag-handle' })).toBe(true)
  })

  it('returns false when element does not match handleSelector', () => {
    const el = document.createElement('div')
    el.className = 'not-a-handle'
    expect(isValidDragHandle(el, { handleSelector: '.drag-handle' })).toBe(false)
  })
})

describe('getDefaultDragConfig', () => {
  it('returns an object with all required keys', () => {
    const config = getDefaultDragConfig()
    expect(config.direction).toBe('vertical')
    expect(config.disabled).toBe(false)
    expect(config.scrollSpeed).toBeGreaterThan(0)
    expect(config.dragThreshold).toBeGreaterThan(0)
    expect(typeof config.dragClass).toBe('string')
    expect(typeof config.ghostClass).toBe('string')
  })
})

describe('resolveDragConfig', () => {
  it('merges user config with defaults', () => {
    const config = resolveDragConfig({ direction: 'horizontal', disabled: true })
    expect(config.direction).toBe('horizontal')
    expect(config.disabled).toBe(true)
    expect(config.scrollSpeed).toBe(10) // default
  })

  it('returns defaults when no config provided', () => {
    const config = resolveDragConfig()
    expect(config).toEqual(getDefaultDragConfig())
  })
})

// ---------------------------------------------------------------------------
// toDragItems
// ---------------------------------------------------------------------------

describe('toDragItems', () => {
  it('creates DragItem array from plain objects', () => {
    const data = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' }
    ]
    const items = toDragItems(data)
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('a')
    expect(items[0].index).toBe(0)
    expect(items[0].data).toEqual({ id: 'a', name: 'Alpha' })
    expect(items[1].id).toBe('b')
    expect(items[1].index).toBe(1)
  })

  it('uses custom id key', () => {
    const data = [{ uid: 'x', val: 1 }]
    const items = toDragItems(data, 'uid')
    expect(items[0].id).toBe('x')
  })

  it('falls back to index when id key is missing', () => {
    const data = [{ name: 'no-id' }]
    const items = toDragItems(data)
    expect(items[0].id).toBe('0')
  })

  it('attaches containerId when provided', () => {
    const data = [{ id: '1' }]
    const items = toDragItems(data, 'id', 'my-list')
    expect(items[0].containerId).toBe('my-list')
  })
})

// ---------------------------------------------------------------------------
// Full Drag Flow Integration
// ---------------------------------------------------------------------------

describe('full drag flow', () => {
  it('completes a single-container reorder flow', () => {
    const state = createDragState()
    const items = makeItems(5)
    const onDrop = vi.fn()

    handleDragStart(state, items[0], 'list')
    handleDragOver(state, items[3], 'list')
    handleDrop(state, { onDrop })

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        fromIndex: 0,
        toIndex: 3,
        fromContainerId: 'list',
        toContainerId: 'list'
      })
    )
    expect(state.isDragging).toBe(false)
  })

  it('completes a cross-container move flow', () => {
    const state = createDragState()
    const source = makeItems(3, 'left')
    const target = makeItems(2, 'right')
    const onDrop = vi.fn()

    handleDragStart(state, source[1], 'left')
    handleDragOver(state, target[0], 'right')
    handleDrop(state, { onDrop })

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        fromContainerId: 'left',
        toContainerId: 'right'
      })
    )
  })

  it('handles cancelled drag flow', () => {
    const state = createDragState()
    const onDragEnd = vi.fn()

    handleDragStart(state, makeItems(1)[0], 'list')
    handleDragEnd(state, true, { onDragEnd })

    expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }))
    expect(state.isDragging).toBe(false)
  })

  it('supports multiple sequential drags', () => {
    const state = createDragState()
    const items = makeItems(3)

    // First drag
    handleDragStart(state, items[0], 'list')
    handleDrop(state)
    expect(state.isDragging).toBe(false)

    // Second drag
    handleDragStart(state, items[2], 'list')
    expect(state.isDragging).toBe(true)
    expect(state.draggedItem?.id).toBe('item-2')
    handleDrop(state)
    expect(state.isDragging).toBe(false)
  })
})
