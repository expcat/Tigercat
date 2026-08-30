import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  reactive,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter
} from 'vue'
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
  createDragState,
  createListReorderController,
  isSameContainerDrag,
  isCrossContainerDrag
} from '@expcat/tigercat-core'

export type { UseDragOptions }

export interface UseDragReturn {
  state: DragState
  isDragging: ComputedRef<boolean>
  draggedItem: ComputedRef<DragItem | null>
  startDrag: (item: DragItem, event?: DragEvent) => void
  dragOver: (item: DragItem | null, event?: DragEvent) => void
  drop: (event?: DragEvent) => DragDropEvent | null
  endDrag: (cancelled?: boolean) => void
  reorder: <T extends DragItem>(items: readonly T[]) => DragReorderResult<T> | null
  moveBetween: <T extends DragItem>(
    sourceItems: readonly T[],
    targetItems: readonly T[]
  ) => DragMoveResult<T> | null
  isSameContainer: ComputedRef<boolean>
  isCrossContainer: ComputedRef<boolean>
  getDragItemAttrs: (item: DragItem) => Record<string, unknown>
  getDropZoneAttrs: () => Record<string, unknown>
}

function callbacksOf(options: UseDragOptions): DragCallbacks {
  return {
    onDragStart: options.onDragStart,
    onDragOver: options.onDragOver,
    onDrop: options.onDrop,
    onDragEnd: options.onDragEnd
  }
}

export function useDrag(options: MaybeRefOrGetter<UseDragOptions> = {}): UseDragReturn {
  const getOptions = (): UseDragOptions => toValue(options)
  const state = reactive(createDragState())

  const controller = createListReorderController({
    getContainerId: () => getOptions().containerId ?? 'default',
    getConfig: () => getOptions().config,
    getCallbacks: () => callbacksOf(getOptions())
  })

  const syncState = () => {
    Object.assign(state, controller.getState())
  }

  const unsubscribe = controller.subscribe(syncState)
  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      unsubscribe()
      controller.dispose()
    })
  }

  function startDrag(item: DragItem, event?: DragEvent) {
    controller.startDrag(item, event)
  }

  function dragOver(item: DragItem | null, event?: DragEvent) {
    controller.dragOver(item, event)
  }

  function drop(event?: DragEvent): DragDropEvent | null {
    return controller.drop(event)
  }

  function endDrag(cancelled?: boolean) {
    controller.endDrag(cancelled)
  }

  function getDragItemAttrs(item: DragItem): Record<string, unknown> {
    const bindings = controller.getItemBindings(item)
    const { extraClass, onDragStart, onDragOver, onDrop, onDragEnd, onPointerDown, ...rest } =
      bindings
    return {
      ...rest,
      class: extraClass,
      onDragstart: onDragStart,
      onDragover: onDragOver,
      onDrop,
      onDragend: onDragEnd,
      onPointerdown: onPointerDown
    }
  }

  function getDropZoneAttrs(): Record<string, unknown> {
    const bindings = controller.getZoneBindings()
    return {
      onDragover: bindings.onDragOver,
      onDrop: bindings.onDrop
    }
  }

  return {
    state,
    isDragging: computed(() => state.isDragging),
    draggedItem: computed(() => state.draggedItem),
    startDrag,
    dragOver,
    drop,
    endDrag,
    reorder: (items) => controller.reorder(items),
    moveBetween: (sourceItems, targetItems) => controller.moveBetween(sourceItems, targetItems),
    isSameContainer: computed(() => isSameContainerDrag(state)),
    isCrossContainer: computed(() => isCrossContainerDrag(state)),
    getDragItemAttrs,
    getDropZoneAttrs
  }
}
