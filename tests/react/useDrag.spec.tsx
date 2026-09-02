/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, renderHook, fireEvent } from '@testing-library/react'
import React from 'react'
import { useDrag } from '@expcat/tigercat-react/useDrag'
import { clearActiveListDrag, type DragItem } from '@expcat/tigercat-core'

function makeItems(containerId = 'list-a'): DragItem[] {
  return [
    { id: 'a', index: 0, containerId, data: { label: 'A' } },
    { id: 'b', index: 1, containerId, data: { label: 'B' } },
    { id: 'c', index: 2, containerId, data: { label: 'C' } }
  ]
}

function makeDragEvent(target: Element = document.createElement('div')) {
  const dataTransfer = {
    setData: vi.fn(),
    effectAllowed: 'none',
    dropEffect: 'none'
  }
  return {
    target,
    preventDefault: vi.fn(),
    dataTransfer
  } as unknown as React.DragEvent
}

function DragList({
  items,
  containerId = 'list-a',
  config,
  onDrop
}: {
  items: DragItem[]
  containerId?: string
  config?: { disabled?: boolean; handleSelector?: string; dragClass?: string }
  onDrop?: () => void
}) {
  const drag = useDrag({
    containerId,
    config,
    onDrop: () => {
      onDrop?.()
    }
  })
  return (
    <ul role="list" {...drag.getDropZoneProps()}>
      {items.map((item) => {
        const props = drag.getDragItemProps(item)
        return (
          <li key={item.id} {...props}>
            {String(item.id)}
          </li>
        )
      })}
    </ul>
  )
}

describe('useDrag', () => {
  beforeEach(() => {
    clearActiveListDrag()
  })

  it('returns idle state without listitem or deprecated ARIA', () => {
    const { result } = renderHook(() => useDrag())
    const item = makeItems()[0]
    const props = result.current.getDragItemProps(item)
    expect(result.current.isDragging).toBe(false)
    expect(result.current.draggedItem).toBeNull()
    expect(props.role).toBeUndefined()
    expect(props['aria-grabbed']).toBeUndefined()
    expect(result.current.getDropZoneProps()['aria-dropeffect']).toBeUndefined()
    expect(result.current.reorder(makeItems())).toBeNull()
  })

  it('starts, hovers, drops, and fires onDragEnd as not cancelled', () => {
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
    expect(callbacks.onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ item: expect.objectContaining({ id: 'a' }), containerId: 'list-a' })
    )

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
    expect(callbacks.onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: false }))
    expect(result.current.isDragging).toBe(false)

    act(() => result.current.endDrag())
    expect(callbacks.onDragEnd).toHaveBeenCalledTimes(1)
  })

  it('updates targetContainerId from the hovered item', () => {
    const source = makeItems('source')
    const { result } = renderHook(() =>
      useDrag({ containerId: 'source', config: { crossContainer: true } })
    )

    act(() => result.current.startDrag(source[0]))
    act(() => result.current.dragOver({ id: 'x', index: 0, containerId: 'target' }))

    expect(result.current.isCrossContainer).toBe(true)
    expect(result.current.isSameContainer).toBe(false)
    expect(result.current.state.targetContainerId).toBe('target')
  })

  it('ignores disabled drag and invalid drag handles', () => {
    const handle = document.createElement('button')
    handle.className = 'drag-handle'
    const wrongHandle = document.createElement('button')
    const item = makeItems()[0]
    const disabled = renderHook(() => useDrag({ config: { disabled: true } }))
    const restricted = renderHook(() => useDrag({ config: { handleSelector: '.drag-handle' } }))

    act(() => disabled.result.current.startDrag(item, makeDragEvent()))
    expect(disabled.result.current.isDragging).toBe(false)

    const blocked = makeDragEvent(wrongHandle)
    act(() => restricted.result.current.startDrag(item, blocked))
    expect(restricted.result.current.isDragging).toBe(false)
    expect(blocked.preventDefault).toHaveBeenCalled()

    act(() => restricted.result.current.startDrag(item, makeDragEvent(handle)))
    expect(restricted.result.current.isDragging).toBe(true)
  })

  it('appends dragClass and sets data-dragging while the item is dragged', () => {
    const items = makeItems()
    const { result } = renderHook(() => useDrag({ config: { dragClass: 'dragging' } }))

    act(() => {
      const props = result.current.getDragItemProps(items[0])
      ;(props.onDragStart as (event: React.DragEvent) => void)(makeDragEvent())
    })
    expect(result.current.getDragItemProps(items[0]).className).toBe('dragging')
    expect(result.current.getDragItemProps(items[0])['data-dragging']).toBe(true)

    act(() => {
      const props = result.current.getDragItemProps(items[1])
      ;(props.onDragOver as (event: React.DragEvent) => void)(makeDragEvent())
    })
    expect(result.current.state.targetIndex).toBe(1)

    act(() => {
      const zone = result.current.getDropZoneProps()
      ;(zone.onDrop as (event: React.DragEvent) => void)(makeDragEvent())
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('binds attrs to DOM, calls setData, and drops onto another item', () => {
    const items = makeItems()
    const onDrop = vi.fn()
    const { getByText } = render(<DragList items={items} onDrop={onDrop} />)
    const first = getByText('a')
    const third = getByText('c')
    const dataTransfer = { setData: vi.fn(), effectAllowed: 'none', dropEffect: 'none' }

    fireEvent.dragStart(first, { dataTransfer })
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'a')
    fireEvent.dragOver(third, { dataTransfer })
    fireEvent.drop(third, { dataTransfer })

    expect(onDrop).toHaveBeenCalledTimes(1)
  })

  it('reports cancelled when drag ends without a drop', () => {
    const onDragEnd = vi.fn()
    const item = makeItems()[0]
    const { result } = renderHook(() => useDrag({ onDragEnd }))

    act(() => result.current.startDrag(item))
    act(() => result.current.endDrag())

    expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }))
    expect(result.current.isDragging).toBe(false)
  })

  it('reacts to disabled flipping after mount', () => {
    const item = makeItems()[0]
    const { result, rerender } = renderHook(
      ({ disabled }: { disabled: boolean }) => useDrag({ config: { disabled } }),
      { initialProps: { disabled: false } }
    )
    rerender({ disabled: true })
    act(() => result.current.startDrag(item, makeDragEvent()))
    expect(result.current.isDragging).toBe(false)
    expect(result.current.getDragItemProps(item).draggable).toBe(false)
  })
})
