/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  clearActiveListDrag,
  createListReorderController,
  reorderSequence,
  type DragItem
} from '@expcat/tigercat-core'

function items(): DragItem[] {
  return [
    { id: 'a', index: 0, containerId: 'left' },
    { id: 'b', index: 1, containerId: 'left' },
    { id: 'c', index: 2, containerId: 'left' }
  ]
}

function dataTransfer() {
  return {
    setData: vi.fn(),
    effectAllowed: 'none' as string,
    dropEffect: 'none' as string
  }
}

describe('reorderSequence', () => {
  it('moves an item without requiring DragItem fields', () => {
    expect(reorderSequence(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })

  it('returns a copy when indexes are unchanged or out of range', () => {
    const list = ['a', 'b']
    expect(reorderSequence(list, 0, 0)).toEqual(['a', 'b'])
    expect(reorderSequence(list, -1, 0)).toEqual(['a', 'b'])
    expect(list).toEqual(['a', 'b'])
  })
})

describe('createListReorderController', () => {
  beforeEach(() => {
    clearActiveListDrag()
  })

  it('sets dataTransfer payload and effectAllowed on drag start', () => {
    const dt = dataTransfer()
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({}),
      getCallbacks: () => ({})
    })
    const event = {
      preventDefault: vi.fn(),
      target: document.createElement('div'),
      dataTransfer: dt
    }
    controller.startDrag(items()[0], event)
    expect(dt.setData).toHaveBeenCalledWith('text/plain', 'a')
    expect(dt.effectAllowed).toBe('move')
    expect(controller.getState().isDragging).toBe(true)
  })

  it('prevents native drag when the handle selector does not match', () => {
    const preventDefault = vi.fn()
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({ handleSelector: '.handle' }),
      getCallbacks: () => ({})
    })
    controller.startDrag(items()[0], {
      preventDefault,
      target: document.createElement('div'),
      dataTransfer: dataTransfer()
    })
    expect(preventDefault).toHaveBeenCalled()
    expect(controller.getState().isDragging).toBe(false)
  })

  it('shares targetContainerId across two controllers', () => {
    const left = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({ crossContainer: true }),
      getCallbacks: () => ({})
    })
    const right = createListReorderController({
      getContainerId: () => 'right',
      getConfig: () => ({ crossContainer: true }),
      getCallbacks: () => ({})
    })
    left.startDrag(items()[0])
    right.dragOver({ id: 'x', index: 0, containerId: 'right' })
    expect(left.getState().targetContainerId).toBe('right')
    expect(right.getState().sourceContainerId).toBe('left')
    expect(left.getState().sourceContainerId).not.toBe(left.getState().targetContainerId)
  })

  it('does not emit onDragOver when the target has not changed', () => {
    const onDragOver = vi.fn()
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({}),
      getCallbacks: () => ({ onDragOver })
    })
    const list = items()
    controller.startDrag(list[0])
    controller.dragOver(list[2])
    controller.dragOver(list[2])
    expect(onDragOver).toHaveBeenCalledTimes(1)
  })

  it('fires onDragEnd with cancelled false after a successful drop', () => {
    const onDrop = vi.fn()
    const onDragEnd = vi.fn()
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({}),
      getCallbacks: () => ({ onDrop, onDragEnd })
    })
    const list = items()
    controller.startDrag(list[0])
    controller.dragOver(list[2])
    const result = controller.drop()
    expect(result?.overItem?.id).toBe('c')
    expect(onDrop).toHaveBeenCalledTimes(1)
    expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: false }))
    controller.endDrag()
    expect(onDragEnd).toHaveBeenCalledTimes(1)
  })

  it('marks a dragend without drop as cancelled', () => {
    const onDragEnd = vi.fn()
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({}),
      getCallbacks: () => ({ onDragEnd })
    })
    controller.startDrag(items()[0])
    controller.endDrag()
    expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }))
    expect(controller.getState().isDragging).toBe(false)
  })

  it('returns null from moveBetween when the source index does not exist', () => {
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({ crossContainer: true }),
      getCallbacks: () => ({})
    })
    controller.startDrag({ id: 'missing', index: 9, containerId: 'left' })
    controller.dragOver({ id: 'x', index: 0, containerId: 'right' })
    expect(controller.moveBetween(items(), items())).toBeNull()
  })

  it('does not put listitem or deprecated ARIA on item bindings', () => {
    const controller = createListReorderController({
      getContainerId: () => 'left',
      getConfig: () => ({ dragClass: 'is-dragging' }),
      getCallbacks: () => ({})
    })
    const item = items()[0]
    controller.startDrag(item)
    const bindings = controller.getItemBindings(item)
    expect(bindings).not.toHaveProperty('role')
    expect(bindings).not.toHaveProperty('aria-grabbed')
    expect(bindings.extraClass).toBe('is-dragging')
    expect(bindings['data-dragging']).toBe(true)
    expect(controller.getZoneBindings()).not.toHaveProperty('aria-dropeffect')
  })
})
