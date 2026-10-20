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
  createDragContainerId,
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
  containerId: string
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

  const ownIdRef = useRef<string | null>(null)
  if (ownIdRef.current === null) ownIdRef.current = createDragContainerId()

  const createController = () =>
    createListReorderController({
      getContainerId: () => optionsRef.current.containerId ?? ownIdRef.current ?? 'tiger-drag',
      getConfig: () => optionsRef.current.config,
      getCallbacks: () => callbacksOf(optionsRef.current)
    })

  // Created during render so SSR and the first commit already expose complete
  // bindings and state. Construction has no global side effects; the controller
  // joins the cross-container registry only once the effect below subscribes.
  const controllerRef = useRef<ListReorderController | null>(null)
  if (controllerRef.current === null) {
    controllerRef.current = createController()
  }
  const [, rerender] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return undefined
    const unsubscribe = controller.subscribe(rerender)
    // Align the render snapshot with the live controller: StrictMode replays
    // this effect after the cleanup replaced the disposed render-time instance,
    // and the next render must read the replacement.
    rerender()
    return () => {
      unsubscribe()
      controller.dispose()
      // Never leave a disposed instance behind: a replayed effect (StrictMode)
      // or a later render must find a live controller. The replacement stays
      // inert until the next effect subscribes it.
      controllerRef.current = createController()
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
    const { extraClass, onPointerDown, onKeyDown, style, ...rest } = bindings
    return {
      ...rest,
      className: extraClass,
      style,
      onPointerDown,
      onKeyDown
    }
  }, [])

  const getDropZoneProps = useCallback((): Record<string, unknown> => {
    const bindings = controllerRef.current?.getZoneBindings()
    if (!bindings) return {}
    return {
      onDragOver: bindings.onDragOver,
      onDrop: bindings.onDrop
    }
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
    getDropZoneProps,
    containerId: options.containerId ?? ownIdRef.current ?? 'tiger-drag'
  }
}
