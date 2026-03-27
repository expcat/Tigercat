import { useState, useCallback, useMemo } from 'react'
import type {
  DragItem,
  DragConfig,
  DragState,
  DragCallbacks,
  DragDropEvent,
  DragReorderResult,
  DragMoveResult
} from '@expcat/tigercat-core'
import {
  createDragState,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  reorderItems,
  moveItemBetweenContainers,
  resolveDragConfig,
  isDragEnabled,
  isValidDragHandle,
  isSameContainerDrag,
  isCrossContainerDrag
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Options / Return Types
// ---------------------------------------------------------------------------

export interface UseDragOptions extends DragCallbacks {
  /** Drag configuration */
  config?: DragConfig
  /** Container id (for cross-container scenarios) */
  containerId?: string
}

export interface UseDragReturn {
  /** Current drag state */
  state: DragState
  /** Whether a drag is currently active */
  isDragging: boolean
  /** The item currently being dragged */
  draggedItem: DragItem | null
  /** Start a drag operation */
  startDrag: (item: DragItem, event?: React.DragEvent) => void
  /** Handle drag over an item */
  dragOver: (item: DragItem | null, event?: React.DragEvent) => void
  /** Handle drop */
  drop: (event?: React.DragEvent) => DragDropEvent | null
  /** Cancel or end drag */
  endDrag: (cancelled?: boolean) => void
  /** Reorder items in the current list */
  reorder: <T extends DragItem>(items: readonly T[]) => DragReorderResult<T> | null
  /** Move item between two containers */
  moveBetween: <T extends DragItem>(
    sourceItems: readonly T[],
    targetItems: readonly T[]
  ) => DragMoveResult<T> | null
  /** Check if current drag is within same container */
  isSameContainer: boolean
  /** Check if current drag crosses containers */
  isCrossContainer: boolean
  /** HTML attribute bindings for a draggable item */
  getDragItemProps: (item: DragItem) => Record<string, unknown>
  /** HTML attribute bindings for a drop zone */
  getDropZoneProps: () => Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDrag(options: UseDragOptions = {}): UseDragReturn {
  const config = useMemo(() => resolveDragConfig(options.config), [options.config])
  const containerId = options.containerId ?? 'default'
  const callbacks: DragCallbacks = useMemo(
    () => ({
      onDragStart: options.onDragStart,
      onDragOver: options.onDragOver,
      onDrop: options.onDrop,
      onDragEnd: options.onDragEnd
    }),
    [options.onDragStart, options.onDragOver, options.onDrop, options.onDragEnd]
  )

  // State — we use functional updates to get latest state
  const [state, setState] = useState<DragState>(createDragState)

  // Helper to mutate a copy and set it
  const updateState = useCallback((updater: (draft: DragState) => void) => {
    setState((prev) => {
      const next = { ...prev }
      updater(next)
      return next
    })
  }, [])

  const startDrag = useCallback(
    (item: DragItem, event?: React.DragEvent) => {
      if (!isDragEnabled(config)) return
      if (event) {
        const target = event.target as Element
        if (!isValidDragHandle(target, config)) return
      }
      updateState((s) => handleDragStart(s, item, containerId, callbacks))
    },
    [config, containerId, callbacks, updateState]
  )

  const dragOver = useCallback(
    (item: DragItem | null, event?: React.DragEvent) => {
      if (event) event.preventDefault()
      updateState((s) => handleDragOver(s, item, containerId, callbacks))
    },
    [containerId, callbacks, updateState]
  )

  const drop = useCallback(
    (event?: React.DragEvent): DragDropEvent | null => {
      if (event) event.preventDefault()
      let result: DragDropEvent | null = null
      setState((prev) => {
        const next = { ...prev }
        result = handleDrop(next, callbacks)
        return next
      })
      return result
    },
    [callbacks]
  )

  const endDrag = useCallback(
    (cancelled = false) => {
      updateState((s) => handleDragEnd(s, cancelled, callbacks))
    },
    [callbacks, updateState]
  )

  const reorder = useCallback(
    <T extends DragItem>(items: readonly T[]): DragReorderResult<T> | null => {
      if (!state.isDragging) return null
      return reorderItems(items, state.sourceIndex, state.targetIndex)
    },
    [state.isDragging, state.sourceIndex, state.targetIndex]
  )

  const moveBetween = useCallback(
    <T extends DragItem>(
      sourceItems: readonly T[],
      targetItems: readonly T[]
    ): DragMoveResult<T> | null => {
      if (!state.isDragging) return null
      return moveItemBetweenContainers(
        sourceItems,
        targetItems,
        state.sourceIndex,
        state.targetIndex
      )
    },
    [state.isDragging, state.sourceIndex, state.targetIndex]
  )

  const getDragItemProps = useCallback(
    (item: DragItem): Record<string, unknown> => ({
      draggable: !config.disabled,
      'data-drag-id': item.id,
      'data-drag-index': item.index,
      className:
        state.isDragging && state.draggedItem?.id === item.id ? config.dragClass : undefined,
      'aria-grabbed': state.isDragging && state.draggedItem?.id === item.id,
      role: 'listitem',
      onDragStart: (e: React.DragEvent) => startDrag(item, e),
      onDragOver: (e: React.DragEvent) => dragOver(item, e),
      onDragEnd: () => endDrag(false)
    }),
    [config, state.isDragging, state.draggedItem, startDrag, dragOver, endDrag]
  )

  const getDropZoneProps = useCallback(
    (): Record<string, unknown> => ({
      'aria-dropeffect': state.isDragging ? 'move' : 'none',
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        dragOver(null, e)
      },
      onDrop: (e: React.DragEvent) => drop(e)
    }),
    [state.isDragging, dragOver, drop]
  )

  return {
    state,
    isDragging: state.isDragging,
    draggedItem: state.draggedItem,
    startDrag,
    dragOver,
    drop,
    endDrag,
    reorder,
    moveBetween,
    isSameContainer: isSameContainerDrag(state),
    isCrossContainer: isCrossContainerDrag(state),
    getDragItemProps,
    getDropZoneProps
  }
}
