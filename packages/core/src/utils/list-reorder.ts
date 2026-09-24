/**
 * Shared list reorder controller — HTML5 DnD + touch pointer + drop bindings.
 *
 * Each controller owns its drag session. `drop` / `endDrag` finish only that
 * session. A second list can drag at the same time. Cross-container hover
 * updates the source session and is visible to the list currently targeted.
 */

import type {
  DragBindingEvent,
  DragCallbacks,
  DragConfig,
  DragDropEvent,
  DragItem,
  DragKeyBindingEvent,
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
  isDragEnabled,
  isValidDragHandle,
  moveItemBetweenContainers,
  reorderItems,
  resolveDragConfig,
  updateDragOffset
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
  style?: { transform: string }
  onDragStart: (event: DragBindingEvent) => void
  onDragOver: (event: DragBindingEvent) => void
  onDrop: (event: DragBindingEvent) => void
  onDragEnd: () => void
  onPointerDown: (event: DragPointerBindingEvent) => void
  onKeyDown: (event: DragKeyBindingEvent) => void
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

interface ControllerSession {
  state: DragState
  getConfig: () => DragConfig | undefined
  getCallbacks: () => DragCallbacks
  didDrop: boolean
  endedAfterDrop: boolean
  lastDropItem: DragItem | null
}

interface RegisteredController {
  getContainerId: () => string
  allowsCross: () => boolean
  getSession: () => ControllerSession | null
  clearSession: () => void
  applyDragOver: (
    item: DragItem | null,
    event?: DragBindingEvent,
    containerId?: string
  ) => void
  finishDrop: (event?: DragBindingEvent) => DragDropEvent | null
  notify: () => void
}

const registries = new WeakMap<Document, Set<RegisteredController>>()

function registryFor(doc: Document): Set<RegisteredController> {
  let set = registries.get(doc)
  if (!set) {
    set = new Set()
    registries.set(doc, set)
  }
  return set
}

function activeRegistry(): Set<RegisteredController> | null {
  if (!isBrowser()) return null
  return registryFor(document)
}

function resolveLockAxis(config: DragConfig): 'x' | 'y' | undefined {
  if (config.lockAxis) return config.lockAxis
  if (config.axis === 'horizontal') return 'x'
  if (config.axis === 'vertical') return 'y'
  return undefined
}

function ownerDocumentOf(target: EventTarget | null): Document | undefined {
  if (target instanceof Element) return target.ownerDocument
  return isBrowser() ? document : undefined
}

function draggingPeers(
  registry: Set<RegisteredController> | null,
  self: RegisteredController
): RegisteredController[] {
  if (!registry) return []
  const peers: RegisteredController[] = []
  for (const peer of registry) {
    if (peer === self) continue
    if (!peer.getSession()?.state.isDragging) continue
    if (!peer.allowsCross()) continue
    peers.push(peer)
  }
  return peers
}

export function createListReorderController(
  options: ListReorderControllerOptions
): ListReorderController {
  let session: ControllerSession | null = null
  let pointerSession: DocumentDragSession | null = null
  const listeners = new Set<() => void>()
  const registry = activeRegistry()

  const configOf = () => resolveDragConfig(options.getConfig())
  const callbacksOf = () => options.getCallbacks()
  const containerOf = () => options.getContainerId()

  const emit = () => {
    for (const listener of listeners) listener()
  }

  const clearSession = () => {
    session = null
    emit()
  }

  const visibleState = (): DragState => {
    if (session) return { ...session.state }
    if (!registry) return createDragState()
    const containerId = containerOf()
    for (const peer of registry) {
      if (peer === record) continue
      const peerSession = peer.getSession()
      if (!peerSession?.state.isDragging) continue
      if (peerSession.state.targetContainerId === containerId) {
        return { ...peerSession.state }
      }
    }
    return createDragState()
  }

  const applyDragOver = (
    item: DragItem | null,
    event?: DragBindingEvent,
    containerId?: string
  ) => {
    if (!session) return
    const config = resolveDragConfig(session.getConfig())
    const nextContainerId = item?.containerId ?? containerId ?? containerOf()
    if (!config.crossContainer && nextContainerId !== session.state.sourceContainerId) {
      return
    }
    if (event) {
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    }
    handleDragOver(session.state, item, nextContainerId, session.getCallbacks())
    emit()
  }

  const finishDrop = (event?: DragBindingEvent): DragDropEvent | null => {
    if (event) event.preventDefault()
    if (!session?.state.isDragging) return null
    const callbacks = session.getCallbacks()
    const result = handleDrop(session.state, callbacks)
    session.didDrop = result != null
    session.lastDropItem = result?.item ?? null
    if (result) {
      callbacks.onDragEnd?.({ item: result.item, cancelled: false })
      session.endedAfterDrop = true
      session = null
    }
    emit()
    return result
  }

  const record: RegisteredController = {
    getContainerId: containerOf,
    allowsCross: () => Boolean(configOf().crossContainer),
    getSession: () => session,
    clearSession,
    applyDragOver,
    finishDrop,
    notify: emit
  }
  registry?.add(record)

  const getState = (): DragState => visibleState()

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

    if (session?.state.isDragging) {
      handleDragEnd(session.state, true, session.getCallbacks())
    }

    const state = createDragState()
    const sourceContainerId = item.containerId ?? containerOf()
    handleDragStart(state, item, sourceContainerId, callbacksOf())
    session = {
      state,
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
    if (session?.state.isDragging) {
      applyDragOver(item, event, containerId)
      return
    }
    if (!configOf().crossContainer) return
    const peers = draggingPeers(registry, record)
    if (peers.length !== 1) return
    peers[0].applyDragOver(item, event, containerId ?? containerOf())
    emit()
  }

  const drop = (event?: DragBindingEvent): DragDropEvent | null => {
    if (session?.state.isDragging) return finishDrop(event)
    if (!configOf().crossContainer) {
      if (event) event.preventDefault()
      return null
    }
    const peers = draggingPeers(registry, record).filter((peer) => {
      const peerSession = peer.getSession()
      return peerSession?.state.targetContainerId === containerOf()
    })
    if (peers.length !== 1) {
      if (event) event.preventDefault()
      return null
    }
    return peers[0].finishDrop(event)
  }

  const endDrag = (cancelled?: boolean): void => {
    if (!session) return
    if (session.endedAfterDrop || !session.state.isDragging) {
      session = null
      emit()
      return
    }
    const isCancelled = cancelled ?? !session.didDrop
    handleDragEnd(session.state, isCancelled, session.getCallbacks())
    session = null
    emit()
  }

  const hitTestDrag = (doc: Document | undefined, x: number, y: number): void => {
    if (!doc || typeof doc.elementFromPoint !== 'function') return
    const el = doc.elementFromPoint(x, y)
    const node = el?.closest('[data-drag-index]')
    if (!(node instanceof HTMLElement)) return
    const index = Number(node.getAttribute('data-drag-index'))
    if (Number.isNaN(index)) return
    const id = node.getAttribute('data-drag-id') ?? String(index)
    const containerId = node.getAttribute('data-drag-container') ?? containerOf()
    dragOver({ id, index, containerId })
  }

  const startPointerReorder = (item: DragItem, event: DragPointerBindingEvent): void => {
    if (event.button !== 0) return
    const host = event.currentTarget instanceof Element ? event.currentTarget : null
    if (event.pointerType === 'mouse' && host instanceof HTMLElement && host.draggable) {
      return
    }
    const config = configOf()
    if (!isDragEnabled(config)) return
    const hit = event.target instanceof Element ? event.target : null
    if (!isValidDragHandle(hit, config)) return
    const doc = ownerDocumentOf(event.currentTarget)
    pointerSession?.dispose()
    let activated = false
    const threshold = config.dragThreshold
    if (threshold <= 0) {
      event.preventDefault()
      startDrag(item)
      activated = true
    }
    pointerSession = createDocumentDragSession({
      startX: event.clientX,
      startY: event.clientY,
      ownerDocument: doc,
      pointerId: event.pointerId,
      pointerTarget: host,
      dragThreshold: threshold,
      activateOnThreshold: threshold > 0,
      lockAxis: resolveLockAxis(config),
      onMove: ({ currentX, currentY, deltaX, deltaY }) => {
        if (!activated) {
          activated = true
          startDrag(item)
        }
        if (session) updateDragOffset(session.state, deltaX, deltaY)
        emit()
        hitTestDrag(doc, currentX, currentY)
      },
      onEnd: ({ cancelled, deltaX, deltaY }) => {
        pointerSession = null
        if (!activated || cancelled) {
          if (activated) endDrag(true)
          return
        }
        if (session && (deltaX !== 0 || deltaY !== 0)) {
          updateDragOffset(session.state, deltaX, deltaY)
        }
        drop()
      }
    })
  }

  const onItemKeyDown = (item: DragItem, event: DragKeyBindingEvent): void => {
    if (!session?.state.isDragging) return
    if (session.state.draggedItem?.id !== item.id) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      endDrag(true)
      return
    }
    const axis = resolveDragConfig(session.getConfig()).axis
    let delta = 0
    if (event.key === 'ArrowUp') delta = axis === 'horizontal' ? 0 : -1
    else if (event.key === 'ArrowDown') delta = axis === 'horizontal' ? 0 : 1
    else if (event.key === 'ArrowLeft') delta = axis === 'vertical' ? 0 : -1
    else if (event.key === 'ArrowRight') delta = axis === 'vertical' ? 0 : 1
    if (delta === 0) return
    event.preventDefault()
    const next = Math.max(0, session.state.targetIndex + delta)
    const containerId = session.state.targetContainerId ?? containerOf()
    const doc = isBrowser() ? document : undefined
    const selector = `[data-drag-container="${containerId}"][data-drag-index="${next}"]`
    const node = doc?.querySelector(selector)
    if (node instanceof HTMLElement) {
      const id = node.getAttribute('data-drag-id') ?? String(next)
      dragOver({ id, index: next, containerId })
      return
    }
    dragOver(
      { id: session.state.draggedItem?.id ?? next, index: next, containerId },
      undefined,
      containerId
    )
  }

  const getItemBindings = (item: DragItem): ListDragItemBindings => {
    const config = configOf()
    const state = getState()
    const isThis = state.isDragging && state.draggedItem?.id === item.id
    const preview =
      isThis && (state.offsetX !== 0 || state.offsetY !== 0)
        ? { transform: `translate(${state.offsetX}px, ${state.offsetY}px)` }
        : undefined
    return {
      draggable: !config.disabled,
      'data-drag-id': item.id,
      'data-drag-index': item.index,
      'data-drag-container': item.containerId ?? containerOf(),
      'data-dragging': isThis || undefined,
      extraClass: isThis ? config.dragClass : undefined,
      style: preview,
      onDragStart: (event) => startDrag(item, event),
      onDragOver: (event) => dragOver(item, event),
      onDrop: (event) => {
        drop(event)
      },
      onDragEnd: () => endDrag(),
      onPointerDown: (event) => startPointerReorder(item, event),
      onKeyDown: (event) => onItemKeyDown(item, event)
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
      registry?.delete(record)
      if (session) {
        session = null
        emit()
      }
      listeners.clear()
    }
  }
}

interface DragContainerItems {
  getItems: () => readonly DragItem[]
  commit: (items: DragItem[]) => void
}

const dragContainerItems = new Map<string, DragContainerItems>()

/** Remember one list so a cross-container drop can rewrite both arrays. */
export function bindDragContainerItems(
  containerId: string,
  source: DragContainerItems
): () => void {
  dragContainerItems.set(containerId, source)
  return () => {
    if (dragContainerItems.get(containerId) === source) dragContainerItems.delete(containerId)
  }
}

/**
 * Apply a cross-container drop to both registered lists.
 * Returns false when either side is missing or the move is inside one list.
 */
export function commitCrossContainerDrop(event: DragDropEvent): boolean {
  if (!event.fromContainerId || event.fromContainerId === event.toContainerId) return false
  const source = dragContainerItems.get(event.fromContainerId)
  const target = dragContainerItems.get(event.toContainerId)
  if (!source || !target) return false
  const result = moveItemBetweenContainers(
    source.getItems(),
    target.getItems(),
    event.fromIndex,
    event.toIndex
  )
  if (!result) return false
  source.commit(result.sourceItems)
  target.commit(result.targetItems)
  return true
}

/** End every live session in this document. Tests use this between cases. */
export function clearActiveListDrag(): void {
  const registry = activeRegistry()
  if (!registry) return
  for (const controller of registry) {
    controller.clearSession()
  }
}
