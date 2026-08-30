/**
 * Drag & Drop Utilities — Framework-agnostic headless drag logic
 *
 * Pure functions for managing drag state, reordering items,
 * and handling cross-container moves.
 */

import type {
  DragItem,
  DragConfig,
  DragState,
  DragReorderResult,
  DragMoveResult,
  DragStartEvent,
  DragOverEvent,
  DragDropEvent,
  DragEndEvent,
  DragCallbacks,
  DocumentDragSession,
  DocumentDragSessionEvent,
  DocumentDragSessionOptions
} from '../types/drag'
import { isBrowser } from './env'

// ---------------------------------------------------------------------------
// State Factory
// ---------------------------------------------------------------------------

/**
 * Create a fresh DragState with defaults
 */
export function createDragState(): DragState {
  return {
    isDragging: false,
    draggedItem: null,
    hoveredItem: null,
    sourceContainerId: null,
    targetContainerId: null,
    sourceIndex: -1,
    targetIndex: -1,
    offsetX: 0,
    offsetY: 0
  }
}

// ---------------------------------------------------------------------------
// Drag Lifecycle Handlers
// ---------------------------------------------------------------------------

/**
 * Handle drag start — mutates the state object in place for reactivity
 */
export function handleDragStart(
  state: DragState,
  item: DragItem,
  containerId: string,
  callbacks?: DragCallbacks
): void {
  state.isDragging = true
  state.draggedItem = { ...item }
  state.hoveredItem = null
  state.sourceContainerId = containerId
  state.targetContainerId = containerId
  state.sourceIndex = item.index
  state.targetIndex = item.index
  state.offsetX = 0
  state.offsetY = 0

  callbacks?.onDragStart?.({
    item: { ...item },
    containerId
  } satisfies DragStartEvent)
}

/**
 * Handle drag over — updates target index and hovered item
 */
export function handleDragOver(
  state: DragState,
  overItem: DragItem | null,
  containerId: string,
  callbacks?: DragCallbacks
): void {
  if (!state.isDragging || !state.draggedItem) return

  const nextIndex = overItem !== null ? overItem.index : state.targetIndex
  const sameTarget =
    state.targetContainerId === containerId &&
    state.targetIndex === nextIndex &&
    ((overItem === null && state.hoveredItem === null) ||
      (overItem !== null && state.hoveredItem?.id === overItem.id))
  if (sameTarget) return

  state.hoveredItem = overItem ? { ...overItem } : null
  state.targetContainerId = containerId
  if (overItem !== null) {
    state.targetIndex = overItem.index
  }

  callbacks?.onDragOver?.({
    item: { ...state.draggedItem },
    overItem: overItem ? { ...overItem } : null,
    containerId
  } satisfies DragOverEvent)
}

/**
 * Handle drop — finalize the drag and compute results
 */
export function handleDrop(state: DragState, callbacks?: DragCallbacks): DragDropEvent | null {
  if (!state.isDragging || !state.draggedItem) return null

  const event: DragDropEvent = {
    item: { ...state.draggedItem },
    overItem: state.hoveredItem ? { ...state.hoveredItem } : null,
    fromIndex: state.sourceIndex,
    toIndex: state.targetIndex,
    fromContainerId: state.sourceContainerId ?? '',
    toContainerId: state.targetContainerId ?? ''
  }

  callbacks?.onDrop?.(event)

  // Reset state
  resetDragState(state)

  return event
}

/**
 * Handle drag end (e.g. user releases without valid drop)
 */
export function handleDragEnd(
  state: DragState,
  cancelled: boolean,
  callbacks?: DragCallbacks
): void {
  if (!state.isDragging) return

  const item = state.draggedItem
  if (item) {
    callbacks?.onDragEnd?.({
      item: { ...item },
      cancelled
    } satisfies DragEndEvent)
  }

  resetDragState(state)
}

/**
 * Update drag offset (for visual positioning of ghost element)
 */
export function updateDragOffset(state: DragState, offsetX: number, offsetY: number): void {
  state.offsetX = offsetX
  state.offsetY = offsetY
}

// ---------------------------------------------------------------------------
// Reorder / Move Logic
// ---------------------------------------------------------------------------

/**
 * Move one item in a sequence. Does not require `DragItem` (FileManager, List).
 */
export function reorderSequence<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items]
  }

  const result = [...items]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result
}

/**
 * Reorder items within a single container
 *
 * @returns New array with the item moved from fromIndex to toIndex
 */
export function reorderItems<T extends DragItem>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): DragReorderResult<T> {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return { items: [...items], fromIndex, toIndex }
  }

  return {
    items: reorderSequence(items, fromIndex, toIndex).map((item, i) => ({ ...item, index: i })),
    fromIndex,
    toIndex
  }
}

/**
 * Move an item between two containers
 *
 * @returns New source and target arrays with updated indices
 */
export function moveItemBetweenContainers<T extends DragItem>(
  sourceItems: readonly T[],
  targetItems: readonly T[],
  fromIndex: number,
  toIndex: number
): DragMoveResult<T> {
  if (fromIndex < 0 || fromIndex >= sourceItems.length) {
    return {
      sourceItems: [...sourceItems],
      targetItems: [...targetItems],
      movedItem: sourceItems[0] ?? ({ id: '', index: 0 } as T)
    }
  }

  const newSource = [...sourceItems]
  const [moved] = newSource.splice(fromIndex, 1)
  const newTarget = [...targetItems]
  const clampedTo = Math.min(toIndex, newTarget.length)
  newTarget.splice(clampedTo, 0, moved)

  return {
    sourceItems: newSource.map((item, i) => ({ ...item, index: i })),
    targetItems: newTarget.map((item, i) => ({ ...item, index: i })),
    movedItem: { ...moved, index: clampedTo }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a drag is a same-container reorder
 */
export function isSameContainerDrag(state: DragState): boolean {
  return state.sourceContainerId === state.targetContainerId
}

/**
 * Check if the drag crossed container boundaries
 */
export function isCrossContainerDrag(state: DragState): boolean {
  return (
    state.sourceContainerId !== null &&
    state.targetContainerId !== null &&
    state.sourceContainerId !== state.targetContainerId
  )
}

/**
 * Check if a handle element matches the configured handle selector
 */
export function isValidDragHandle(element: Element, config?: DragConfig): boolean {
  if (!config?.handleSelector) return true
  return element.closest(config.handleSelector) !== null
}

/**
 * Check if configuration allows dragging
 */
export function isDragEnabled(config?: DragConfig): boolean {
  return !config?.disabled
}

/**
 * Create DragItem instances from a plain array
 */
export function toDragItems<T extends Record<string, unknown>>(
  items: readonly T[],
  idKey: keyof T = 'id' as keyof T,
  containerId?: string
): DragItem[] {
  return items.map((item, index) => ({
    id: String(item[idKey] ?? index),
    data: { ...item },
    index,
    containerId
  }))
}

/**
 * Default drag config with sensible defaults
 */
export function getDefaultDragConfig(): Required<DragConfig> {
  return {
    direction: 'vertical',
    handleSelector: '',
    dragClass: 'tiger-drag-active',
    ghostClass: 'tiger-drag-ghost',
    scrollSpeed: 10,
    scrollMargin: 40,
    disabled: false,
    crossContainer: false,
    lockAxis: 'y',
    dragThreshold: 5
  }
}

/**
 * Merge user config with defaults
 */
export function resolveDragConfig(config?: DragConfig): Required<DragConfig> {
  return { ...getDefaultDragConfig(), ...config }
}

// ---------------------------------------------------------------------------
// Document Pointer Session
// ---------------------------------------------------------------------------

function isMatchingPointer(event: PointerEvent, pointerId: number | undefined): boolean {
  return pointerId == null || event.pointerId === pointerId
}

function applyLockAxis(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  lockAxis: DocumentDragSessionOptions['lockAxis']
): { currentX: number; currentY: number; deltaX: number; deltaY: number } {
  if (lockAxis === 'x') {
    return { currentX, currentY: startY, deltaX: currentX - startX, deltaY: 0 }
  }
  if (lockAxis === 'y') {
    return { currentX: startX, currentY, deltaX: 0, deltaY: currentY - startY }
  }
  return {
    currentX,
    currentY,
    deltaX: currentX - startX,
    deltaY: currentY - startY
  }
}

/**
 * Create a document-level pointer drag session with shared cleanup semantics.
 *
 * Callers start the session from `pointerdown`. The session binds
 * `pointermove` / `pointerup` / `pointercancel` plus Escape, optionally
 * captures the pointer, and restores `user-select` on dispose.
 */
export function createDocumentDragSession(
  options: DocumentDragSessionOptions
): DocumentDragSession {
  const ownerDocument = options.ownerDocument ?? (isBrowser() ? document : undefined)

  if (!ownerDocument) {
    return { dispose: () => undefined }
  }

  let disposed = false
  const threshold = options.dragThreshold ?? 0
  let passedThreshold = threshold <= 0
  const pointerId = options.pointerId
  const captureTarget = options.pointerTarget ?? null
  const root = ownerDocument.documentElement
  const previousUserSelect = root.style.userSelect
  root.style.userSelect = 'none'

  if (captureTarget && pointerId != null && typeof captureTarget.setPointerCapture === 'function') {
    try {
      captureTarget.setPointerCapture(pointerId)
    } catch {
      // Element may not be connected (tests / SSR hydrate).
    }
  }

  const createPayload = (
    event: Event,
    clientX: number,
    clientY: number,
    cancelled: boolean
  ): DocumentDragSessionEvent => {
    const locked = applyLockAxis(options.startX, options.startY, clientX, clientY, options.lockAxis)
    return {
      startX: options.startX,
      startY: options.startY,
      currentX: locked.currentX,
      currentY: locked.currentY,
      deltaX: locked.deltaX,
      deltaY: locked.deltaY,
      event,
      cancelled
    }
  }

  const dispose = () => {
    if (disposed) return
    disposed = true
    ownerDocument.removeEventListener('pointermove', handlePointerMove)
    ownerDocument.removeEventListener('pointerup', handlePointerUp)
    ownerDocument.removeEventListener('pointercancel', handlePointerCancel)
    ownerDocument.removeEventListener('keydown', handleKeyDown)
    root.style.userSelect = previousUserSelect
    if (
      captureTarget &&
      pointerId != null &&
      typeof captureTarget.releasePointerCapture === 'function'
    ) {
      try {
        captureTarget.releasePointerCapture(pointerId)
      } catch {
        // Capture may already have been released.
      }
    }
  }

  const finish = (event: Event, clientX: number, clientY: number, cancelled: boolean) => {
    if (disposed) return
    options.onEnd?.(createPayload(event, clientX, clientY, cancelled))
    dispose()
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (disposed || !isMatchingPointer(event, pointerId)) return
    const distance = Math.hypot(event.clientX - options.startX, event.clientY - options.startY)
    if (!passedThreshold) {
      if (distance < threshold) return
      passedThreshold = true
    }
    options.onMove(createPayload(event, event.clientX, event.clientY, false))
  }

  const handlePointerUp = (event: PointerEvent) => {
    if (disposed || !isMatchingPointer(event, pointerId)) return
    finish(event, event.clientX, event.clientY, false)
  }

  const handlePointerCancel = (event: PointerEvent) => {
    if (disposed || !isMatchingPointer(event, pointerId)) return
    finish(event, event.clientX, event.clientY, true)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (disposed || event.key !== 'Escape') return
    event.preventDefault()
    finish(event, options.startX, options.startY, true)
  }

  ownerDocument.addEventListener('pointermove', handlePointerMove)
  ownerDocument.addEventListener('pointerup', handlePointerUp)
  ownerDocument.addEventListener('pointercancel', handlePointerCancel)
  ownerDocument.addEventListener('keydown', handleKeyDown)

  return { dispose }
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function resetDragState(state: DragState): void {
  state.isDragging = false
  state.draggedItem = null
  state.hoveredItem = null
  state.sourceContainerId = null
  state.targetContainerId = null
  state.sourceIndex = -1
  state.targetIndex = -1
  state.offsetX = 0
  state.offsetY = 0
}
