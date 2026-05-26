/**
 * TaskBoard Drag Controller — unified HTML5 DnD + touch + keyboard
 *
 * Framework-agnostic headless controller that manages all drag state and
 * interaction logic. Vue / React components create one instance and wire
 * its methods to DOM events, eliminating ~200 lines of duplicated handler
 * code per framework.
 */

import type { TaskBoardCard, TaskBoardColumn } from '../types/composite'
import { isBrowser } from './env'
import type { TaskBoardDragState, TouchDragTracker } from './task-board-utils'
import {
  createCardDragData,
  createColumnDragData,
  parseDragData,
  setDragData,
  getDropIndex,
  getColumnDropIndex,
  createTouchDragTracker,
  findColumnFromPoint
} from './task-board-utils'

// ============================================================================
// Public types
// ============================================================================

/** Readonly snapshot of the controller's drag state */
export interface TaskBoardDragSnapshot {
  /** Currently active drag (null when idle) */
  drag: TaskBoardDragState | null
  /** Column the pointer is hovering over (card-drag only) */
  dropTargetColumnId: string | number | null
  /** Insertion index within the drop target column */
  dropIndex: number
  /** Keyboard grab state (Enter/Space toggle) — separate from pointer drag */
  kbDrag: TaskBoardDragState | null
}

/** Callbacks the controller invokes to apply moves and notify state changes */
export interface TaskBoardDragCallbacks {
  /** Called when state changes — framework should persist in reactive state */
  onStateChange(snapshot: TaskBoardDragSnapshot): void
  /** Apply a card move (may be async for beforeCardMove validation) */
  applyCardMove(
    cardId: string | number,
    fromColumnId: string | number,
    toColumnId: string | number,
    toIndex: number
  ): void
  /** Apply a column move */
  applyColumnMove(fromIndex: number, toIndex: number): void
  /** Return the board root element (for hit-testing) */
  getBoardEl(): HTMLElement | null
  /** Return current column count (for clamping column drop index) */
  getColumnCount(): number
}

/** Mutable options — updated when draggable / columnDraggable props change */
export interface TaskBoardDragOptions {
  draggable: boolean
  columnDraggable: boolean
}

/** The controller interface returned by createTaskBoardDragController */
export interface TaskBoardDragController {
  /** Current snapshot (read-only) */
  getSnapshot(): TaskBoardDragSnapshot

  /** Lifecycle */
  init(): void
  dispose(): void

  /** Update options (called when props change) */
  setOptions(opts: Partial<TaskBoardDragOptions>): void

  // ---- HTML5 DnD: cards ----
  cardDragStart(dt: DataTransfer, card: TaskBoardCard, column: TaskBoardColumn): void
  cardDragOver(clientY: number, bodyEl: HTMLElement, column: TaskBoardColumn): void
  cardDrop(dt: DataTransfer, column: TaskBoardColumn): void

  // ---- HTML5 DnD: columns ----
  columnDragStart(dt: DataTransfer, column: TaskBoardColumn, index: number): void
  columnDragOver(): void
  columnDrop(dt: DataTransfer, clientX: number): void

  // ---- Shared DnD ----
  dragEnd(): void
  dragLeave(currentTarget: HTMLElement, relatedTarget: Element | null): void

  // ---- Touch: cards ----
  cardTouchStart(
    nativeEvent: TouchEvent,
    sourceEl: HTMLElement,
    card: TaskBoardCard,
    column: TaskBoardColumn
  ): void
  cardTouchMove(nativeEvent: TouchEvent): void
  cardTouchEnd(): void

  // ---- Touch: columns ----
  columnTouchStart(
    nativeEvent: TouchEvent,
    sourceEl: HTMLElement,
    column: TaskBoardColumn,
    index: number
  ): void
  columnTouchMove(nativeEvent: TouchEvent): void
  columnTouchEnd(): void

  // ---- Keyboard ----
  /** Returns true if the event was handled (caller should preventDefault) */
  cardKeyDown(key: string, card: TaskBoardCard, column: TaskBoardColumn): boolean
}

// ============================================================================
// Factory
// ============================================================================

export function createDefaultDragSnapshot(): TaskBoardDragSnapshot {
  return {
    drag: null,
    dropTargetColumnId: null,
    dropIndex: -1,
    kbDrag: null
  }
}

export function createTaskBoardDragController(
  callbacks: TaskBoardDragCallbacks,
  initialOptions?: Partial<TaskBoardDragOptions>
): TaskBoardDragController {
  // ---- internal mutable state ----
  let snap: TaskBoardDragSnapshot = createDefaultDragSnapshot()
  let opts: TaskBoardDragOptions = {
    draggable: true,
    columnDraggable: true,
    ...initialOptions
  }
  let touchTracker: TouchDragTracker | null = null
  let touchRaf = 0

  // ---- helpers ----
  const emit = () => {
    callbacks.onStateChange({ ...snap })
  }

  const resetDrag = () => {
    snap = { ...snap, drag: null, dropTargetColumnId: null, dropIndex: -1 }
    emit()
  }

  // ---- controller object ----
  const ctrl: TaskBoardDragController = {
    getSnapshot: () => snap,

    // ---- lifecycle ----
    init() {
      if (isBrowser() && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        touchTracker = createTouchDragTracker()
      }
    },

    dispose() {
      cancelAnimationFrame(touchRaf)
      touchTracker = null
    },

    setOptions(o) {
      opts = { ...opts, ...o }
    },

    // ==================================================================
    // HTML5 DnD — cards
    // ==================================================================

    cardDragStart(dt, card, column) {
      if (!opts.draggable) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      setDragData(dt, createCardDragData(card.id, column.id, idx))
      snap = {
        ...snap,
        drag: { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
      }
      emit()
    },

    cardDragOver(clientY, bodyEl, column) {
      if (!snap.drag || snap.drag.type !== 'card') return
      const cardEls = bodyEl.querySelectorAll('[data-tiger-taskboard-card]')
      const rects: DOMRect[] = []
      cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      snap = { ...snap, dropTargetColumnId: column.id, dropIndex: getDropIndex(clientY, rects) }
      emit()
    },

    cardDrop(dt, column) {
      const data = parseDragData(dt)
      if (!data || data.type !== 'card') return
      callbacks.applyCardMove(
        data.cardId,
        data.columnId,
        column.id,
        snap.dropIndex >= 0 ? snap.dropIndex : column.cards.length
      )
      resetDrag()
    },

    // ==================================================================
    // HTML5 DnD — columns
    // ==================================================================

    columnDragStart(dt, column, index) {
      if (!opts.columnDraggable) return
      setDragData(dt, createColumnDragData(column.id, index))
      snap = { ...snap, drag: { type: 'column', id: column.id, fromIndex: index } }
      emit()
    },

    columnDragOver() {
      // nothing to update — column drop uses pointer position at drop time
    },

    columnDrop(dt, clientX) {
      const data = parseDragData(dt)
      if (!data || data.type !== 'column') return

      const boardEl = callbacks.getBoardEl()
      const colEls = boardEl?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls) return
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(clientX, rects)

      callbacks.applyColumnMove(data.index, Math.min(toIdx, callbacks.getColumnCount() - 1))
      resetDrag()
    },

    // ==================================================================
    // Shared DnD
    // ==================================================================

    dragEnd() {
      resetDrag()
    },

    dragLeave(currentTarget, relatedTarget) {
      if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        if (snap.drag?.type === 'card') {
          snap = { ...snap, dropTargetColumnId: null, dropIndex: -1 }
          emit()
        }
      }
    },

    // ==================================================================
    // Touch — cards
    // ==================================================================

    cardTouchStart(nativeEvent, sourceEl, card, column) {
      if (!opts.draggable || !touchTracker) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      touchTracker.onTouchStart(nativeEvent, sourceEl)
      snap = {
        ...snap,
        drag: { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
      }
      emit()
    },

    cardTouchMove(nativeEvent) {
      if (!touchTracker || !snap.drag || snap.drag.type !== 'card') return
      touchTracker.onTouchMove(nativeEvent)

      cancelAnimationFrame(touchRaf)
      touchRaf = requestAnimationFrame(() => {
        const st = touchTracker!.getState()
        const boardEl = callbacks.getBoardEl()
        const colEl = findColumnFromPoint(st.currentX, st.currentY, boardEl)
        if (colEl) {
          const colId = colEl.getAttribute('data-tiger-taskboard-column-id')
          const cardEls = colEl.querySelectorAll('[data-tiger-taskboard-card]')
          const rects: DOMRect[] = []
          cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
          snap = {
            ...snap,
            dropTargetColumnId: colId ?? null,
            dropIndex: getDropIndex(st.currentY, rects)
          }
          emit()
        }
      })
    },

    cardTouchEnd() {
      if (!touchTracker || !snap.drag) return
      touchTracker.onTouchEnd()

      if (snap.drag.type === 'card' && snap.dropTargetColumnId != null) {
        callbacks.applyCardMove(
          snap.drag.id,
          snap.drag.fromColumnId!,
          snap.dropTargetColumnId,
          snap.dropIndex >= 0 ? snap.dropIndex : 0
        )
      }
      resetDrag()
    },

    // ==================================================================
    // Touch — columns
    // ==================================================================

    columnTouchStart(nativeEvent, sourceEl, column, index) {
      if (!opts.columnDraggable || !touchTracker) return
      touchTracker.onTouchStart(nativeEvent, sourceEl)
      snap = { ...snap, drag: { type: 'column', id: column.id, fromIndex: index } }
      emit()
    },

    columnTouchMove(nativeEvent) {
      if (!touchTracker || !snap.drag || snap.drag.type !== 'column') return
      touchTracker.onTouchMove(nativeEvent)
    },

    columnTouchEnd() {
      if (!touchTracker || !snap.drag || snap.drag.type !== 'column') return
      const st = touchTracker.onTouchEnd()

      const boardEl = callbacks.getBoardEl()
      const colEls = boardEl?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls) {
        resetDrag()
        return
      }
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(st.currentX, rects)

      callbacks.applyColumnMove(
        snap.drag.fromIndex,
        Math.min(toIdx, callbacks.getColumnCount() - 1)
      )
      resetDrag()
    },

    // ==================================================================
    // Keyboard
    // ==================================================================

    cardKeyDown(key, card, column) {
      if (!opts.draggable) return false

      if (key === 'Enter' || key === ' ') {
        if (!snap.kbDrag) {
          // Grab
          const idx = column.cards.findIndex((c) => c.id === card.id)
          snap = {
            ...snap,
            kbDrag: { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
          }
          emit()
          return true
        } else {
          // Drop at current card position
          const cardIdx = column.cards.findIndex((c) => c.id === card.id)
          if (snap.kbDrag.fromColumnId !== undefined) {
            callbacks.applyCardMove(snap.kbDrag.id, snap.kbDrag.fromColumnId, column.id, cardIdx)
          }
          snap = { ...snap, kbDrag: null }
          emit()
          return true
        }
      }

      if (key === 'Escape' && snap.kbDrag) {
        snap = { ...snap, kbDrag: null }
        emit()
        return true
      }

      return false
    }
  }

  return ctrl
}
