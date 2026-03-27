import { reactive, computed, type ComputedRef } from 'vue'
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
  /** Reactive drag state */
  state: DragState
  /** Whether a drag is currently active */
  isDragging: ComputedRef<boolean>
  /** The item currently being dragged */
  draggedItem: ComputedRef<DragItem | null>
  /** Start a drag operation */
  startDrag: (item: DragItem, event?: DragEvent) => void
  /** Handle drag over an item */
  dragOver: (item: DragItem | null, event?: DragEvent) => void
  /** Handle drop */
  drop: (event?: DragEvent) => DragDropEvent | null
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
  isSameContainer: ComputedRef<boolean>
  /** Check if current drag crosses containers */
  isCrossContainer: ComputedRef<boolean>
  /** HTML attribute bindings for a draggable item */
  getDragItemAttrs: (item: DragItem) => Record<string, unknown>
  /** HTML attribute bindings for a drop zone */
  getDropZoneAttrs: () => Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useDrag(options: UseDragOptions = {}): UseDragReturn {
  const config = resolveDragConfig(options.config)
  const containerId = options.containerId ?? 'default'
  const callbacks: DragCallbacks = {
    onDragStart: options.onDragStart,
    onDragOver: options.onDragOver,
    onDrop: options.onDrop,
    onDragEnd: options.onDragEnd
  }

  // Reactive state
  const state = reactive(createDragState())

  // Derived computeds
  const isDragging = computed(() => state.isDragging)
  const draggedItem = computed(() => state.draggedItem)
  const isSameContainer = computed(() => isSameContainerDrag(state))
  const isCrossContainer = computed(() => isCrossContainerDrag(state))

  // Actions
  function startDrag(item: DragItem, event?: DragEvent) {
    if (!isDragEnabled(config)) return
    if (event) {
      const target = event.target as Element
      if (!isValidDragHandle(target, config)) return
    }
    handleDragStart(state, item, containerId, callbacks)
  }

  function dragOver(item: DragItem | null, event?: DragEvent) {
    if (event) {
      event.preventDefault()
    }
    handleDragOver(state, item, containerId, callbacks)
  }

  function drop(event?: DragEvent): DragDropEvent | null {
    if (event) {
      event.preventDefault()
    }
    return handleDrop(state, callbacks)
  }

  function endDrag(cancelled = false) {
    handleDragEnd(state, cancelled, callbacks)
  }

  function reorder<T extends DragItem>(items: readonly T[]): DragReorderResult<T> | null {
    if (!state.isDragging) return null
    return reorderItems(items, state.sourceIndex, state.targetIndex)
  }

  function moveBetween<T extends DragItem>(
    sourceItems: readonly T[],
    targetItems: readonly T[]
  ): DragMoveResult<T> | null {
    if (!state.isDragging) return null
    return moveItemBetweenContainers(sourceItems, targetItems, state.sourceIndex, state.targetIndex)
  }

  function getDragItemAttrs(item: DragItem): Record<string, unknown> {
    return {
      draggable: !config.disabled,
      'data-drag-id': item.id,
      'data-drag-index': item.index,
      class: state.isDragging && state.draggedItem?.id === item.id ? config.dragClass : undefined,
      'aria-grabbed': state.isDragging && state.draggedItem?.id === item.id,
      role: 'listitem',
      onDragstart: (e: DragEvent) => startDrag(item, e),
      onDragover: (e: DragEvent) => dragOver(item, e),
      onDragend: () => endDrag(false)
    }
  }

  function getDropZoneAttrs(): Record<string, unknown> {
    return {
      'aria-dropeffect': state.isDragging ? 'move' : 'none',
      onDragover: (e: DragEvent) => {
        e.preventDefault()
        dragOver(null, e)
      },
      onDrop: (e: DragEvent) => drop(e)
    }
  }

  return {
    state,
    isDragging,
    draggedItem,
    startDrag,
    dragOver,
    drop,
    endDrag,
    reorder,
    moveBetween,
    isSameContainer,
    isCrossContainer,
    getDragItemAttrs,
    getDropZoneAttrs
  }
}
