/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDrag } from '@expcat/tigercat-react'
import type { DragItem } from '@expcat/tigercat-core'

function makeItems(containerId = 'list-a'): DragItem[] {
  return [
    { id: 'a', index: 0, containerId, data: { label: 'A' } },
    { id: 'b', index: 1, containerId, data: { label: 'B' } },
    { id: 'c', index: 2, containerId, data: { label: 'C' } }
  ]
}

function makeDragEvent(target: Element = document.createElement('div')) {
  return {
    target,
    preventDefault: vi.fn()
  } as unknown as React.DragEvent
}

describe('useDrag', () => {
  it('returns the default idle state and prop helpers', () => {
    const { result } = renderHook(() => useDrag())
    const item = makeItems()[0]

    expect(result.current.isDragging).toBe(false)
    expect(result.current.draggedItem).toBeNull()
    expect(result.current.isSameContainer).toBe(true)
    expect(result.current.isCrossContainer).toBe(false)
    expect(result.current.reorder(makeItems())).toBeNull()
    expect(result.current.moveBetween(makeItems(), makeItems('list-b'))).toBeNull()
    expect(result.current.getDragItemProps(item)).toMatchObject({
      draggable: true,
      'data-drag-id': 'a',
      'data-drag-index': 0,
      'aria-grabbed': false,
      role: 'listitem'
    })
    expect(result.current.getDropZoneProps()).toMatchObject({
      'aria-dropeffect': 'none'
    })
  })

  it('starts, hovers, drops, and resets a same-container drag', () => {
    const callbacks = {
      onDragStart: vi.fn(),
      onDragOver: vi.fn(),
      onDrop: vi.fn(),
      onDragEnd: vi.fn()
    }
    const items = makeItems()
    const { result } = renderHook(() => useDrag({ ...callbacks, containerId: 'list-a' }))

    act(() => result.current.startDrag(items[0]))
    expect(result.current.isDragging).toBe(true)
    expect(result.current.draggedItem?.id).toBe('a')
    expect(callbacks.onDragStart).toHaveBeenCalledWith({ item: items[0], containerId: 'list-a' })

    act(() => result.current.dragOver(items[2], makeDragEvent()))
    expect(callbacks.onDragOver).toHaveBeenCalled()
    expect(result.current.isSameContainer).toBe(true)
    expect(result.current.reorder(items)?.items.map((item) => item.id)).toEqual(['b', 'c', 'a'])

    let dropResult = null as ReturnType<typeof result.current.drop>
    act(() => {
      dropResult = result.current.drop(makeDragEvent())
    })

    expect(dropResult).toMatchObject({
      item: expect.objectContaining({ id: 'a' }),
      fromIndex: 0,
      toIndex: 2,
      fromContainerId: 'list-a',
      toContainerId: 'list-a'
    })
    expect(callbacks.onDrop).toHaveBeenCalledWith(dropResult)
    expect(result.current.isDragging).toBe(false)

    act(() => result.current.endDrag(true))
    expect(callbacks.onDragEnd).not.toHaveBeenCalled()
  })

  it('moves between source and target arrays using current drag indexes', () => {
    const source = makeItems('source')
    const target = makeItems('target')
    const { result } = renderHook(() => useDrag({ containerId: 'source' }))

    act(() => result.current.startDrag(source[1]))
    act(() => result.current.dragOver({ id: 'target-b', index: 1, containerId: 'source' }))

    expect(result.current.isSameContainer).toBe(true)
    expect(result.current.isCrossContainer).toBe(false)
    const moveResult = result.current.moveBetween(source, target)
    expect(moveResult?.sourceItems.map((item) => item.id)).toEqual(['a', 'c'])
    expect(moveResult?.targetItems.map((item) => item.id)).toEqual(['a', 'b', 'b', 'c'])
    expect(moveResult?.movedItem.id).toBe('b')
  })

  it('ignores disabled drag and invalid drag handles', () => {
    const handle = document.createElement('button')
    handle.className = 'drag-handle'
    const wrongHandle = document.createElement('button')
    const item = makeItems()[0]
    const disabled = renderHook(() => useDrag({ config: { disabled: true } }))
    const restricted = renderHook(() => useDrag({ config: { handleSelector: '.drag-handle' } }))

    act(() => disabled.result.current.startDrag(item))
    expect(disabled.result.current.isDragging).toBe(false)

    act(() => restricted.result.current.startDrag(item, makeDragEvent(wrongHandle)))
    expect(restricted.result.current.isDragging).toBe(false)

    act(() => restricted.result.current.startDrag(item, makeDragEvent(handle)))
    expect(restricted.result.current.isDragging).toBe(true)
  })

  it('wire drag item and drop zone handlers to hook actions', () => {
    const items = makeItems()
    const { result } = renderHook(() => useDrag({ config: { dragClass: 'dragging' } }))

    act(() => {
      const props = result.current.getDragItemProps(items[0])
      ;(props.onDragStart as (event: React.DragEvent) => void)(makeDragEvent())
    })
    expect(result.current.getDragItemProps(items[0]).className).toBe('dragging')
    expect(result.current.getDragItemProps(items[0])['aria-grabbed']).toBe(true)
    expect(result.current.getDropZoneProps()['aria-dropeffect']).toBe('move')

    act(() => {
      const props = result.current.getDragItemProps(items[1])
      const onDragOver = props.onDragOver as (event: React.DragEvent) => void
      onDragOver(makeDragEvent())
    })
    expect(result.current.state.targetIndex).toBe(1)

    act(() => {
      const props = result.current.getDropZoneProps()
      const onDragOver = props.onDragOver as (event: React.DragEvent) => void
      const onDrop = props.onDrop as (event: React.DragEvent) => void
      onDragOver(makeDragEvent())
      onDrop(makeDragEvent())
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('ends active drags through item props', () => {
    const item = makeItems()[0]
    const onDragEnd = vi.fn()
    const { result } = renderHook(() => useDrag({ onDragEnd }))

    act(() => result.current.startDrag(item))
    act(() => {
      const props = result.current.getDragItemProps(item)
      const onDragEndProp = props.onDragEnd as () => void
      onDragEndProp()
    })

    expect(result.current.isDragging).toBe(false)
    expect(onDragEnd).toHaveBeenCalledWith({ item, cancelled: false })
  })

  describe('Edge Cases', () => {
    it('returns null when dropping without an active drag', () => {
      const { result } = renderHook(() => useDrag())
      let dropResult = null as ReturnType<typeof result.current.drop>
      act(() => {
        dropResult = result.current.drop(makeDragEvent())
      })
      expect(dropResult).toBeNull()
    })

    it('ignores drag over without an active drag', () => {
      const onDragOver = vi.fn()
      const { result } = renderHook(() => useDrag({ onDragOver }))
      act(() => result.current.dragOver(makeItems()[1], makeDragEvent()))
      expect(onDragOver).not.toHaveBeenCalled()
      expect(result.current.state.targetIndex).toBe(-1)
    })

    it('reports cancelled drag endings', () => {
      const onDragEnd = vi.fn()
      const item = makeItems()[0]
      const { result } = renderHook(() => useDrag({ onDragEnd }))

      act(() => result.current.startDrag(item))
      act(() => result.current.endDrag(true))

      expect(onDragEnd).toHaveBeenCalledWith({ item, cancelled: true })
      expect(result.current.isDragging).toBe(false)
    })

    it('keeps container flags stable for unresolved cross-container targets', () => {
      const source = makeItems('source')
      const { result } = renderHook(() => useDrag({ containerId: 'source' }))

      act(() => result.current.startDrag(source[0]))
      act(() => result.current.dragOver({ id: 'x', index: 0, containerId: 'target' }))

      expect(result.current.isCrossContainer).toBe(false)
      expect(result.current.isSameContainer).toBe(true)
      expect(result.current.reorder(source)?.items.map((item) => item.id)).toEqual(['a', 'b', 'c'])
    })

    it('falls back to source indexes when moving an out-of-range dragged item', () => {
      const { result } = renderHook(() => useDrag({ containerId: 'source' }))

      act(() => result.current.startDrag({ id: 'missing', index: 9, containerId: 'source' }))
      act(() => result.current.dragOver({ id: 'target', index: 0, containerId: 'target' }))

      const moveResult = result.current.moveBetween(makeItems('source'), makeItems('target'))
      expect(moveResult?.movedItem.id).toBe('a')
      expect(moveResult?.targetItems).toHaveLength(3)
    })

    it('applies custom class names to dragged items and drop zones', () => {
      const item = makeItems()[0]
      const { result } = renderHook(() =>
        useDrag({ config: { dragClass: 'dragging', dropZoneClass: 'drop-zone' } })
      )

      expect(result.current.getDropZoneProps().className).toBeUndefined()
      act(() => result.current.startDrag(item))
      expect(result.current.getDragItemProps(item).className).toBe('dragging')
      expect(result.current.getDropZoneProps().className).toBeUndefined()
    })

    it('uses default target values when dropping before dragOver', () => {
      const onDrop = vi.fn()
      const { result } = renderHook(() => useDrag({ onDrop }))

      act(() => result.current.startDrag(makeItems()[0]))
      act(() => result.current.drop(makeDragEvent()))

      expect(onDrop).toHaveBeenCalledWith(
        expect.objectContaining({ fromIndex: 0, toIndex: 0, toContainerId: 'default' })
      )
    })
  })

  describe('Accessibility', () => {
    it('exposes listitem drag state and drop effect semantics', () => {
      const item = makeItems()[0]
      const { result } = renderHook(() => useDrag())

      expect(result.current.getDragItemProps(item)).toMatchObject({
        role: 'listitem',
        'aria-grabbed': false
      })

      act(() => result.current.startDrag(item))

      expect(result.current.getDragItemProps(item)['aria-grabbed']).toBe(true)
      expect(result.current.getDropZoneProps()['aria-dropeffect']).toBe('move')
    })

    it('removes drop effects after drag completion', () => {
      const item = makeItems()[0]
      const { result } = renderHook(() => useDrag())

      act(() => result.current.startDrag(item))
      act(() => result.current.endDrag(false))

      expect(result.current.getDropZoneProps()['aria-dropeffect']).toBe('none')
    })
  })
})
