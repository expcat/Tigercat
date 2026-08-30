import { useCallback, useEffect, useReducer, useRef } from 'react'
import type {
  DragItem,
  DragState,
  DragCallbacks,
  DragDropEvent,
  DragReorderResult,
  DragMoveResult,
  UseDragOptions
} from '@expcat/tigercat-core'
import {
  createListReorderController,
  isSameContainerDrag,
  isCrossContainerDrag,
  type ListReorderController
} from '@expcat/tigercat-core'

export type { UseDragOptions }

export interface UseDragReturn {
  state: DragState
  isDragging: boolean
  draggedItem: DragItem | null
  startDrag: (item: DragItem, event?: React.DragEvent) => void
  dragOver: (item: DragItem | null, event?: React.DragEvent) => void
  drop: (event?: React.DragEvent) => DragDropEvent | null
  endDrag: (cancelled?: boolean) => void
  reorder: <T extends DragItem>(items: readonly T[]) => DragReorderResult<T> | null
  moveBetween: <T extends DragItem>(
    sourceItems: readonly T[],
    targetItems: readonly T[]
  ) => DragMoveResult<T> | null
  isSameContainer: boolean
  isCrossContainer: boolean
  getDragItemProps: (item: DragItem) => Record<string, unknown>
  getDropZoneProps: () => Record<string, unknown>
}

function callbacksOf(options: UseDragOptions): DragCallbacks {
  return {
    onDragStart: options.onDragStart,
    onDragOver: options.onDragOver,
    onDrop: options.onDrop,
    onDragEnd: options.onDragEnd
  }
}

export function useDrag(options: UseDragOptions = {}): UseDragReturn {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const controllerRef = useRef<ListReorderController | null>(null)
  if (controllerRef.current === null) {
    controllerRef.current = createListReorderController({
      getContainerId: () => optionsRef.current.containerId ?? 'default',
      getConfig: () => optionsRef.current.config,
      getCallbacks: () => callbacksOf(optionsRef.current)
    })
  }

  const [, rerender] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return undefined
    const unsubscribe = controller.subscribe(rerender)
    return () => {
      unsubscribe()
      controller.dispose()
    }
  }, [])

  const controller = controllerRef.current
  const state = controller.getState()

  const startDrag = useCallback((item: DragItem, event?: React.DragEvent) => {
    controllerRef.current?.startDrag(item, event)
  }, [])

  const dragOver = useCallback((item: DragItem | null, event?: React.DragEvent) => {
    controllerRef.current?.dragOver(item, event)
  }, [])

  const drop = useCallback((event?: React.DragEvent): DragDropEvent | null => {
    return controllerRef.current?.drop(event) ?? null
  }, [])

  const endDrag = useCallback((cancelled?: boolean) => {
    controllerRef.current?.endDrag(cancelled)
  }, [])

  const reorder = useCallback(<T extends DragItem>(items: readonly T[]) => {
    return controllerRef.current?.reorder(items) ?? null
  }, [])

  const moveBetween = useCallback(
    <T extends DragItem>(sourceItems: readonly T[], targetItems: readonly T[]) => {
      return controllerRef.current?.moveBetween(sourceItems, targetItems) ?? null
    },
    []
  )

  const getDragItemProps = useCallback((item: DragItem): Record<string, unknown> => {
    const bindings = controllerRef.current?.getItemBindings(item)
    if (!bindings) return {}
    const { extraClass, onPointerDown, ...rest } = bindings
    return {
      ...rest,
      className: extraClass,
      onPointerDown
    }
  }, [])

  const getDropZoneProps = useCallback((): Record<string, unknown> => {
    return controllerRef.current?.getZoneBindings() ?? {}
  }, [])

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
