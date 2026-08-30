/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { render, fireEvent } from '@testing-library/vue'
import { useDrag } from '@expcat/tigercat-vue'
import { clearActiveListDrag, type DragItem } from '@expcat/tigercat-core'

function setupDrag(options = {}) {
  return useDrag(options)
}

const item1: DragItem = { id: 'a', index: 0, containerId: 'default' }
const item2: DragItem = { id: 'b', index: 1, containerId: 'default' }
const item3: DragItem = { id: 'c', index: 2, containerId: 'default' }

function makeDragEvent(target: Element = document.createElement('div')) {
  return {
    target,
    preventDefault: vi.fn(),
    dataTransfer: {
      setData: vi.fn(),
      effectAllowed: 'none',
      dropEffect: 'none'
    }
  } as unknown as DragEvent
}

describe('useDrag (Vue composable)', () => {
  beforeEach(() => {
    clearActiveListDrag()
  })

  describe('Initial state', () => {
    it('returns idle state without listitem or deprecated ARIA', () => {
      const { state, isDragging, draggedItem, getDragItemAttrs, getDropZoneAttrs } = setupDrag()
      expect(isDragging.value).toBe(false)
      expect(draggedItem.value).toBeNull()
      expect(state.isDragging).toBe(false)
      expect(getDragItemAttrs(item1).role).toBeUndefined()
      expect(getDragItemAttrs(item1)['aria-grabbed']).toBeUndefined()
      expect(getDropZoneAttrs()['aria-dropeffect']).toBeUndefined()
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
      startDrag(item1, makeDragEvent())
      expect(isDragging.value).toBe(false)
    })

    it('prevents native drag when the handle selector does not match', () => {
      const { startDrag, isDragging } = setupDrag({
        config: { handleSelector: '.drag-handle' }
      })
      const event = makeDragEvent()
      startDrag(item1, event)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(isDragging.value).toBe(false)
    })
  })

  describe('dragOver and drop', () => {
    it('updates target item and index', () => {
      const { startDrag, dragOver, state } = setupDrag()
      startDrag(item1)
      dragOver(item2)
      expect(state.targetIndex).toBe(1)
      expect(state.hoveredItem).toMatchObject({ id: 'b' })
    })

    it('calls event.preventDefault when DragEvent provided', () => {
      const { startDrag, dragOver } = setupDrag()
      startDrag(item1)
      const event = makeDragEvent()
      dragOver(item2, event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('returns drop payload and fires onDragEnd as not cancelled', () => {
      const onDrop = vi.fn()
      const onDragEnd = vi.fn()
      const { startDrag, dragOver, drop, isDragging, endDrag } = setupDrag({ onDrop, onDragEnd })
      startDrag(item1)
      dragOver(item2)
      const result = drop()
      expect(result).toMatchObject({
        fromIndex: 0,
        toIndex: 1,
        overItem: expect.objectContaining({ id: 'b' })
      })
      expect(onDrop).toHaveBeenCalled()
      expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: false }))
      expect(isDragging.value).toBe(false)
      endDrag()
      expect(onDragEnd).toHaveBeenCalledTimes(1)
    })
  })

  describe('endDrag', () => {
    it('invokes onDragEnd callback with cancelled flag', () => {
      const onDragEnd = vi.fn()
      const { startDrag, endDrag, isDragging } = setupDrag({ onDragEnd })
      startDrag(item1)
      endDrag()
      expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }))
      expect(isDragging.value).toBe(false)
    })
  })

  describe('reorder', () => {
    it('reorders items array based on drag state', () => {
      const list = [item1, item2, item3]
      const { startDrag, dragOver, reorder } = setupDrag()
      startDrag(item1)
      dragOver(item3)
      const result = reorder(list)
      expect(result).not.toBeNull()
      expect(result!.items.map((i) => i.id)).toEqual(['b', 'c', 'a'])
    })
  })

  describe('cross-container', () => {
    it('updates targetContainerId from the hovered item', () => {
      const { startDrag, dragOver, isCrossContainer, isSameContainer, state } = setupDrag({
        containerId: 'source',
        config: { crossContainer: true }
      })
      startDrag({ id: 'a', index: 0, containerId: 'source' })
      dragOver({ id: 'x', index: 0, containerId: 'target' })
      expect(isCrossContainer.value).toBe(true)
      expect(isSameContainer.value).toBe(false)
      expect(state.targetContainerId).toBe('target')
    })
  })

  describe('live config', () => {
    it('picks up disabled after it changes on the same options object', () => {
      const options = { config: { disabled: false } }
      const { startDrag, isDragging, endDrag } = setupDrag(options)
      startDrag(item1)
      expect(isDragging.value).toBe(true)
      endDrag()
      options.config.disabled = true
      startDrag(item1, makeDragEvent())
      expect(isDragging.value).toBe(false)
    })
  })

  describe('DOM bindings', () => {
    it('calls setData on dragstart and emits drop on another item', async () => {
      const onDrop = vi.fn()
      const items = ref([item1, item2, item3])
      const Comp = defineComponent({
        setup() {
          const drag = useDrag({
            containerId: 'default',
            onDrop: () => onDrop()
          })
          return () =>
            h(
              'ul',
              { role: 'list', ...drag.getDropZoneAttrs() },
              items.value.map((item) => {
                const attrs = drag.getDragItemAttrs(item)
                return h('li', { ...attrs, key: item.id }, String(item.id))
              })
            )
        }
      })
      const { getByText } = render(Comp)
      await nextTick()
      const first = getByText('a')
      const third = getByText('c')
      const dataTransfer = { setData: vi.fn(), effectAllowed: 'none', dropEffect: 'none' }
      await fireEvent.dragStart(first, { dataTransfer })
      expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'a')
      await fireEvent.dragOver(third, { dataTransfer })
      await fireEvent.drop(third, { dataTransfer })
      expect(onDrop).toHaveBeenCalledTimes(1)
    })
  })
})
