/**
 * Shared list reorder controller — HTML5 DnD + touch pointer + drop bindings.
 *
 * One module-level active session so two `useDrag` / List instances can
 * complete a cross-container move. Vue / React only map bindings to
 * class vs className and subscribe for rerenders.
 */

import type {
  DragBindingEvent,
  DragCallbacks,
  DragConfig,
  DragDropEvent,
  DragItem,
  DragMoveResult,
  DragPointerBindingEvent,
  DragReorderResult,
  DragState,
  DocumentDragSession
} from '../types/drag'
import { isBrowser } from './env'
import {
  createDocumentDragSession,
  createDragState,
  handleDragEnd,
  handleDragOver,
  handleDragStart,
  handleDrop,
  isCrossContainerDrag,
  isDragEnabled,
  isSameContainerDrag,
  isValidDragHandle,
  moveItemBetweenContainers,
  reorderItems,
  resolveDragConfig
} from './drag'

export interface ListReorderControllerOptions {
  getContainerId: () => string
  getConfig: () => DragConfig | undefined
  getCallbacks: () => DragCallbacks
}

export interface ListDragItemBindings {
  draggable: boolean
  'data-drag-id': string | number
  'data-drag-index': number
  'data-drag-container': string
  'data-dragging'?: true
  extraClass?: string
  onDragStart: (event: DragBindingEvent) => void
  onDragOver: (event: DragBindingEvent) => void
  onDrop: (event: DragBindingEvent) => void
  onDragEnd: () => void
  onPointerDown: (event: DragPointerBindingEvent) => void
}

export interface ListDragZoneBindings {
  onDragOver: (event: DragBindingEvent) => void
  onDrop: (event: DragBindingEvent) => void
}

export interface ListReorderController {
  getState(): DragState
  subscribe(listener: () => void): () => void
  startDrag(item: DragItem, event?: DragBindingEvent): void
  dragOver(item: DragItem | null, event?: DragBindingEvent, containerId?: string): void
  drop(event?: DragBindingEvent): DragDropEvent | null
  endDrag(cancelled?: boolean): void
  reorder<T extends DragItem>(items: readonly T[]): DragReorderResult<T> | null
  moveBetween<T extends DragItem>(
    sourceItems: readonly T[],
    targetItems: readonly T[]
  ): DragMoveResult<T> | null
  getItemBindings(item: DragItem): ListDragItemBindings
  getZoneBindings(): ListDragZoneBindings
  dispose(): void
}

interface ActiveListDrag {
  state: DragState
  ownerId: number
  getConfig: () => DragConfig | undefined
  getCallbacks: () => DragCallbacks
  didDrop: boolean
  endedAfterDrop: boolean
  lastDropItem: DragItem | null
}

let nextControllerId = 1
let activeDrag: ActiveListDrag | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function resolveLockAxis(config: DragConfig): 'x' | 'y' | undefined {
  if (config.lockAxis) return config.lockAxis
  if (config.direction === 'horizontal') return 'x'
  if (config.direction === 'vertical') return 'y'
  return undefined
}

function ownerDocumentOf(target: EventTarget | null): Document | undefined {
  if (target instanceof Element) return target.ownerDocument
  return isBrowser() ? document : undefined
}

export function createListReorderController(
  options: ListReorderControllerOptions
): ListReorderController {
  const ownerId = nextControllerId++
  let pointerSession: DocumentDragSession | null = null

  const configOf = () => resolveDragConfig(options.getConfig())
  const callbacksOf = () => options.getCallbacks()
  const containerOf = () => options.getContainerId()

  const getState = (): DragState => (activeDrag ? { ...activeDrag.state } : createDragState())

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const startDrag = (item: DragItem, event?: DragBindingEvent): void => {
    const config = configOf()
    if (!isDragEnabled(config)) {
      event?.preventDefault()
      return
    }
    if (event) {
      const target = event.target as Element | null
      if (target && !isValidDragHandle(target, config)) {
        event.preventDefault()
        return
      }
      if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', String(item.id))
        event.dataTransfer.effectAllowed = 'move'
      }
    }

    const state = createDragState()
    const sourceContainerId = item.containerId ?? containerOf()
    handleDragStart(state, item, sourceContainerId, callbacksOf())
    activeDrag = {
      state,
      ownerId,
      getConfig: options.getConfig,
      getCallbacks: options.getCallbacks,
      didDrop: false,
      endedAfterDrop: false,
      lastDropItem: null
    }
    emit()
  }

  const dragOver = (
    item: DragItem | null,
    event?: DragBindingEvent,
    containerId?: string
  ): void => {
    if (!activeDrag) return
    const config = resolveDragConfig(activeDrag.getConfig())
    const nextContainerId = item?.containerId ?? containerId ?? containerOf()
    if (!config.crossContainer && nextContainerId !== activeDrag.state.sourceContainerId) {
      return
    }
    if (event) {
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    }
    handleDragOver(activeDrag.state, item, nextContainerId, activeDrag.getCallbacks())
    emit()
  }

  const drop = (event?: DragBindingEvent): DragDropEvent | null => {
    if (event) event.preventDefault()
    if (!activeDrag?.state.isDragging) return null
    const callbacks = activeDrag.getCallbacks()
    const result = handleDrop(activeDrag.state, callbacks)
    activeDrag.didDrop = result != null
    activeDrag.lastDropItem = result?.item ?? null
    if (result) {
      callbacks.onDragEnd?.({ item: result.item, cancelled: false })
      activeDrag.endedAfterDrop = true
    }
    emit()
    return result
  }

  const endDrag = (cancelled?: boolean): void => {
    if (!activeDrag) return
    if (activeDrag.endedAfterDrop) {
      activeDrag = null
      emit()
      return
    }
    if (!activeDrag.state.isDragging) {
      activeDrag = null
      emit()
      return
    }
    const isCancelled = cancelled ?? !activeDrag.didDrop
    handleDragEnd(activeDrag.state, isCancelled, activeDrag.getCallbacks())
    activeDrag = null
    emit()
  }

  const startPointerReorder = (item: DragItem, event: DragPointerBindingEvent): void => {
    if (event.pointerType === 'mouse' || event.button !== 0) return
    const config = configOf()
    if (!isDragEnabled(config)) return
    const target = event.currentTarget as Element | null
    if (target && !isValidDragHandle(target, config)) return
    event.preventDefault()
    startDrag(item)
    const doc = ownerDocumentOf(event.currentTarget)
    pointerSession?.dispose()
    pointerSession = createDocumentDragSession({
      startX: event.clientX,
      startY: event.clientY,
      ownerDocument: doc,
      pointerId: event.pointerId,
      pointerTarget: target,
      dragThreshold: config.dragThreshold,
      lockAxis: resolveLockAxis(config),
      onMove: ({ currentX, currentY }) => {
        if (!doc) return
        const el = doc.elementFromPoint(currentX, currentY)
        const node = el?.closest('[data-drag-index]')
        if (!(node instanceof HTMLElement)) return
        const index = Number(node.getAttribute('data-drag-index'))
        if (Number.isNaN(index)) return
        const id = node.getAttribute('data-drag-id') ?? String(index)
        const containerId = node.getAttribute('data-drag-container') ?? containerOf()
        dragOver({ id, index, containerId })
      },
      onEnd: ({ cancelled }) => {
        pointerSession = null
        if (cancelled) endDrag(true)
        else drop()
      }
    })
  }

  const getItemBindings = (item: DragItem): ListDragItemBindings => {
    const config = configOf()
    const state = getState()
    const isThis = state.isDragging && state.draggedItem?.id === item.id
    return {
      draggable: !config.disabled,
      'data-drag-id': item.id,
      'data-drag-index': item.index,
      'data-drag-container': item.containerId ?? containerOf(),
      'data-dragging': isThis || undefined,
      extraClass: isThis ? config.dragClass : undefined,
      onDragStart: (event) => startDrag(item, event),
      onDragOver: (event) => dragOver(item, event),
      onDrop: (event) => {
        drop(event)
      },
      onDragEnd: () => endDrag(),
      onPointerDown: (event) => startPointerReorder(item, event)
    }
  }

  const getZoneBindings = (): ListDragZoneBindings => ({
    onDragOver: (event) => {
      dragOver(null, event, containerOf())
    },
    onDrop: (event) => {
      drop(event)
    }
  })

  return {
    getState,
    subscribe,
    startDrag,
    dragOver,
    drop,
    endDrag,
    reorder: <T extends DragItem>(items: readonly T[]): DragReorderResult<T> | null => {
      const state = getState()
      if (!state.isDragging) return null
      return reorderItems(items, state.sourceIndex, state.targetIndex)
    },
    moveBetween: <T extends DragItem>(
      sourceItems: readonly T[],
      targetItems: readonly T[]
    ): DragMoveResult<T> | null => {
      const state = getState()
      if (!state.isDragging) return null
      return moveItemBetweenContainers(
        sourceItems,
        targetItems,
        state.sourceIndex,
        state.targetIndex
      )
    },
    getItemBindings,
    getZoneBindings,
    dispose: () => {
      pointerSession?.dispose()
      pointerSession = null
      if (activeDrag?.ownerId === ownerId) {
        activeDrag = null
        emit()
      }
    }
  }
}

export function isActiveListDragSameContainer(): boolean {
  return activeDrag ? isSameContainerDrag(activeDrag.state) : true
}

export function isActiveListDragCrossContainer(): boolean {
  return activeDrag ? isCrossContainerDrag(activeDrag.state) : false
}

/** Reset the shared session. Used by tests so files do not leak an in-flight drag. */
export function clearActiveListDrag(): void {
  activeDrag = null
  emit()
}
