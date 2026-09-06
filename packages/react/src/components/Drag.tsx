import React from 'react'
import {
  classNames,
  reorderSequence,
  type DragItem,
  type DragProps as CoreDragProps
} from '@expcat/tigercat-core'
import { useDrag } from '../hooks/useDrag'

export interface DragRenderContext {
  dragItemProps: Record<string, unknown>
  isDragging: boolean
}

export interface DragProps<T extends DragItem = DragItem> extends CoreDragProps<T> {
  children?: (item: T, context: DragRenderContext) => React.ReactNode
  renderItem?: (item: T, context: DragRenderContext) => React.ReactNode
}

export function Drag<T extends DragItem = DragItem>({
  items = [],
  onItemsChange,
  config,
  containerId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  className,
  children,
  renderItem
}: DragProps<T>) {
  const itemsRef = React.useRef(items)
  itemsRef.current = items
  const onItemsChangeRef = React.useRef(onItemsChange)
  onItemsChangeRef.current = onItemsChange
  const onDropRef = React.useRef(onDrop)
  onDropRef.current = onDrop

  const drag = useDrag({
    config,
    containerId,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop: (event) => {
      onDropRef.current?.(event)
      if (event.fromIndex === event.toIndex) return
      const next = reorderSequence(itemsRef.current, event.fromIndex, event.toIndex).map(
        (item, index) => ({ ...item, index })
      )
      onItemsChangeRef.current?.(next)
    }
  })

  const render = children ?? renderItem
  const zoneProps = drag.getDropZoneProps()

  return (
    <ul
      {...zoneProps}
      className={classNames('m-0 list-none p-0', className)}
      data-tiger-drag=""
      role="list">
      {items.map((item) => {
        const itemProps = drag.getDragItemProps(item)
        const node = render?.(item, {
          dragItemProps: itemProps,
          isDragging: drag.draggedItem?.id === item.id
        })
        return (
          <React.Fragment key={item.id}>
            {node ?? (
              <li {...itemProps} role="listitem">
                {String(item.id)}
              </li>
            )}
          </React.Fragment>
        )
      })}
    </ul>
  )
}

Drag.displayName = 'Drag'

export default Drag
