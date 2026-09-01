/**
 * TaskBoard Drag Controller — unified HTML5 DnD + touch + keyboard
 *
 * Framework-agnostic headless controller. Vue / React create one instance
 * and bind DOM events. Visible indices are mapped back to source arrays
 * through `getView()` — never pass filtered `colIndex` into reorder.
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
import {
  type TaskBoardView,
  findTaskBoardViewColumn,
  moveTaskBoardKeyboardColumn,
  moveTaskBoardKeyboardDrop,
  resolveCardDropSourceIndex,
  resolveColumnReorder
} from './task-board-view'

// ============================================================================
// Public types
// ============================================================================

/** Readonly snapshot of the controller's drag state */
export interface TaskBoardDragSnapshot {
  /** Currently active drag (null when idle) */
  drag: TaskBoardDragState | null
  /** Column the pointer is hovering over (card-drag only) */
  dropTargetColumnId: string | number | null
  /** Insertion index within the drop target column (visible cards) */
  dropIndex: number
  /** Keyboard grab state (Enter/Space toggle) — separate from pointer drag */
  kbDrag: TaskBoardDragState | null
}

/** Callbacks the controller invokes to apply moves and notify state changes */
export interface TaskBoardDragCallbacks {
  /** Called when state changes — framework should persist in reactive state */
  onStateChange(snapshot: TaskBoardDragSnapshot): void
  /**
   * Apply a card move. May return a Promise (async `beforeCardMove`).
   * The controller awaits it before `resetDrag`.
   */
  applyCardMove(
    cardId: string | number,
    fromColumnId: string | number,
    toColumnId: string | number,
    toIndex: number
  ): void | Promise<void>
  /**
   * Apply a column move in **source** indices.
   */
  applyColumnMove(fromIndex: number, toIndex: number): void | Promise<void>
  /** Return the board root element (for hit-testing) */
  getBoardEl(): HTMLElement | null
  /** Current display view (visible columns / cards in DOM order) */
  getView(): TaskBoardView
  /** Unfiltered source columns */
  getSourceColumns(): TaskBoardColumn[]
  /** Inline direction for column drop geometry and keyboard */
  getDir(): 'ltr' | 'rtl'
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
  columnDragStart(dt: DataTransfer, column: TaskBoardColumn): void
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
  columnTouchStart(nativeEvent: TouchEvent, sourceEl: HTMLElement, column: TaskBoardColumn): void
  columnTouchMove(nativeEvent: TouchEvent): void
  columnTouchEnd(): void

  // ---- Keyboard ----
  /** Returns true if the event was handled (caller should preventDefault) */
  cardKeyDown(key: string, card: TaskBoardCard, column: TaskBoardColumn): boolean
  /** Empty column body / list drop target */
  columnBodyKeyDown(key: string, column: TaskBoardColumn): boolean
  /** Column header grab / reorder */
  columnKeyDown(key: string, column: TaskBoardColumn): boolean
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

function visibleCardRects(container: HTMLElement): DOMRect[] {
  const rects: DOMRect[] = []
  container.querySelectorAll('[data-tiger-taskboard-card]').forEach((el) => {
    rects.push(el.getBoundingClientRect())
  })
  return rects
}

export function createTaskBoardDragController(
  callbacks: TaskBoardDragCallbacks,
  initialOptions?: Partial<TaskBoardDragOptions>
): TaskBoardDragController {
  let snap: TaskBoardDragSnapshot = createDefaultDragSnapshot()
  let opts: TaskBoardDragOptions = {
    draggable: true,
    columnDraggable: true,
    ...initialOptions
  }
  let touchTracker: TouchDragTracker | null = null
  let touchRaf = 0
  let disposed = false
  let pending = false

  const emit = () => {
    callbacks.onStateChange({ ...snap })
  }

  const resetDrag = () => {
    snap = { ...snap, drag: null, dropTargetColumnId: null, dropIndex: -1 }
    emit()
  }

  const resetKb = () => {
    snap = { ...snap, kbDrag: null, dropTargetColumnId: null, dropIndex: -1 }
    emit()
  }

  const setDropTarget = (columnId: string | number | null, dropIndex: number) => {
    if (snap.dropTargetColumnId === columnId && snap.dropIndex === dropIndex) return
    snap = { ...snap, dropTargetColumnId: columnId, dropIndex }
    emit()
  }

  const visibleDropIndex = (column: TaskBoardColumn): number => {
    if (snap.dropIndex >= 0) return snap.dropIndex
    const viewCol = findTaskBoardViewColumn(callbacks.getView(), column.id)
    return viewCol ? viewCol.visibleCards.length : column.cards.length
  }

  const commitCardMove = (
    cardId: string | number,
    fromColumnId: string | number,
    toColumnId: string | number,
    visibleIndex: number
  ) => {
    if (pending) return
    const toIndex = resolveCardDropSourceIndex(callbacks.getView(), toColumnId, visibleIndex)
    const result = callbacks.applyCardMove(cardId, fromColumnId, toColumnId, toIndex)
    if (result && typeof (result as Promise<void>).then === 'function') {
      pending = true
      void (result as Promise<void>).finally(() => {
        pending = false
        resetDrag()
        if (snap.kbDrag) resetKb()
      })
      return
    }
    resetDrag()
  }

  const commitColumnMove = (fromColumnId: string | number, visibleInsertIndex: number) => {
    if (pending) return
    const mapped = resolveColumnReorder(
      callbacks.getSourceColumns(),
      fromColumnId,
      callbacks.getView().columns.map((column) => column.source.id),
      visibleInsertIndex
    )
    if (!mapped) {
      resetDrag()
      return
    }
    const result = callbacks.applyColumnMove(mapped.fromIndex, mapped.toIndex)
    if (result && typeof (result as Promise<void>).then === 'function') {
      pending = true
      void (result as Promise<void>).finally(() => {
        pending = false
        resetDrag()
        if (snap.kbDrag) resetKb()
      })
      return
    }
    resetDrag()
  }

  const arrowDirection = (key: string): 'up' | 'down' | 'start' | 'end' | null => {
    if (key === 'ArrowDown') return 'down'
    if (key === 'ArrowUp') return 'up'
    const dir = callbacks.getDir()
    if (key === 'ArrowRight') return dir === 'rtl' ? 'start' : 'end'
    if (key === 'ArrowLeft') return dir === 'rtl' ? 'end' : 'start'
    return null
  }

  const ctrl: TaskBoardDragController = {
    getSnapshot: () => snap,

    init() {
      disposed = false
      if (isBrowser() && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        touchTracker = createTouchDragTracker()
      }
    },

    dispose() {
      disposed = true
      cancelAnimationFrame(touchRaf)
      touchTracker = null
      pending = false
    },

    setOptions(o) {
      opts = { ...opts, ...o }
    },

    // ==================================================================
    // HTML5 DnD — cards
    // ==================================================================

    cardDragStart(dt, card, column) {
      if (!opts.draggable) return
      const viewCol = findTaskBoardViewColumn(callbacks.getView(), column.id)
      const idx = (viewCol?.source.cards ?? column.cards).findIndex((item) => item.id === card.id)
      setDragData(dt, createCardDragData(card.id, column.id, idx))
      snap = {
        ...snap,
        drag: { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
      }
      emit()
    },

    cardDragOver(clientY, bodyEl, column) {
      if (!snap.drag || snap.drag.type !== 'card') return
      const dropIndex = getDropIndex(clientY, visibleCardRects(bodyEl))
      setDropTarget(column.id, dropIndex)
    },

    cardDrop(dt, column) {
      if (pending) return
      const data = parseDragData(dt)
      if (!data || data.type !== 'card') return
      commitCardMove(data.cardId, data.columnId, column.id, visibleDropIndex(column))
    },

    // ==================================================================
    // HTML5 DnD — columns
    // ==================================================================

    columnDragStart(dt, column) {
      if (!opts.columnDraggable) return
      const fromIndex = callbacks.getSourceColumns().findIndex((item) => item.id === column.id)
      setDragData(dt, createColumnDragData(column.id, fromIndex))
      snap = { ...snap, drag: { type: 'column', id: column.id, fromIndex } }
      emit()
    },

    columnDragOver() {
      // nothing to update — column drop uses pointer position at drop time
    },

    columnDrop(dt, clientX) {
      if (pending) return
      const data = parseDragData(dt)
      if (!data || data.type !== 'column') return

      const boardEl = callbacks.getBoardEl()
      const colEls = boardEl?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls || colEls.length === 0) return
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(clientX, rects, callbacks.getDir())
      commitColumnMove(data.columnId, toIdx)
    },

    // ==================================================================
    // Shared DnD
    // ==================================================================

    dragEnd() {
      if (pending) return
      resetDrag()
    },

    dragLeave(currentTarget, relatedTarget) {
      if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        if (snap.drag?.type === 'card') {
          setDropTarget(null, -1)
        }
      }
    },

    // ==================================================================
    // Touch — cards
    // ==================================================================

    cardTouchStart(nativeEvent, sourceEl, card, column) {
      if (!opts.draggable || !touchTracker) return
      const viewCol = findTaskBoardViewColumn(callbacks.getView(), column.id)
      const idx = (viewCol?.source.cards ?? column.cards).findIndex((item) => item.id === card.id)
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
        if (disposed || !touchTracker) return
        const st = touchTracker.getState()
        const boardEl = callbacks.getBoardEl()
        const colEl = findColumnFromPoint(st.currentX, st.currentY, boardEl)
        if (colEl) {
          const colId = colEl.getAttribute('data-tiger-taskboard-column-id')
          const dropIndex = getDropIndex(st.currentY, visibleCardRects(colEl))
          setDropTarget(colId ?? null, dropIndex)
        }
      })
    },

    cardTouchEnd() {
      if (!touchTracker || !snap.drag) return
      touchTracker.onTouchEnd()

      if (snap.drag.type === 'card' && snap.dropTargetColumnId != null) {
        const column: TaskBoardColumn = {
          id: snap.dropTargetColumnId,
          title: '',
          cards:
            findTaskBoardViewColumn(callbacks.getView(), snap.dropTargetColumnId)?.source.cards ??
            []
        }
        commitCardMove(
          snap.drag.id,
          snap.drag.fromColumnId!,
          snap.dropTargetColumnId,
          visibleDropIndex(column)
        )
        return
      }
      resetDrag()
    },

    // ==================================================================
    // Touch — columns
    // ==================================================================

    columnTouchStart(nativeEvent, sourceEl, column) {
      if (!opts.columnDraggable || !touchTracker) return
      const fromIndex = callbacks.getSourceColumns().findIndex((item) => item.id === column.id)
      touchTracker.onTouchStart(nativeEvent, sourceEl)
      snap = { ...snap, drag: { type: 'column', id: column.id, fromIndex } }
      emit()
    },

    columnTouchMove(nativeEvent) {
      if (!touchTracker || !snap.drag || snap.drag.type !== 'column') return
      touchTracker.onTouchMove(nativeEvent)
    },

    columnTouchEnd() {
      if (!touchTracker || !snap.drag || snap.drag.type !== 'column') return
      const st = touchTracker.onTouchEnd()
      const fromId = snap.drag.id

      const boardEl = callbacks.getBoardEl()
      const colEls = boardEl?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls || colEls.length === 0) {
        resetDrag()
        return
      }
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(st.currentX, rects, callbacks.getDir())
      commitColumnMove(fromId, toIdx)
    },

    // ==================================================================
    // Keyboard
    // ==================================================================

    cardKeyDown(key, card, column) {
      if (!opts.draggable) return false

      if (key === 'Escape' && snap.kbDrag) {
        resetKb()
        return true
      }

      const arrow = arrowDirection(key)
      if (arrow && snap.kbDrag?.type === 'card') {
        const next = moveTaskBoardKeyboardDrop(
          callbacks.getView(),
          {
            columnId: snap.dropTargetColumnId ?? snap.kbDrag.fromColumnId ?? column.id,
            dropIndex: snap.dropIndex < 0 ? 0 : snap.dropIndex
          },
          arrow
        )
        setDropTarget(next.columnId, next.dropIndex)
        return true
      }

      if (key === 'Enter' || key === ' ') {
        if (!snap.kbDrag) {
          const idx = column.cards.findIndex((item) => item.id === card.id)
          const viewCol = findTaskBoardViewColumn(callbacks.getView(), column.id)
          const visibleIdx = viewCol
            ? viewCol.visibleCards.findIndex((item) => item.id === card.id)
            : idx
          snap = {
            ...snap,
            kbDrag: { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx },
            dropTargetColumnId: column.id,
            dropIndex: Math.max(0, visibleIdx)
          }
          emit()
          return true
        }

        if (snap.kbDrag.fromColumnId !== undefined) {
          const grabbingSelf = snap.kbDrag.id === card.id
          const viewCol = findTaskBoardViewColumn(callbacks.getView(), column.id)
          const cardVisible = viewCol
            ? viewCol.visibleCards.findIndex((item) => item.id === card.id)
            : column.cards.findIndex((item) => item.id === card.id)
          const toColumnId = grabbingSelf ? (snap.dropTargetColumnId ?? column.id) : column.id
          const toVisible = grabbingSelf
            ? snap.dropIndex >= 0
              ? snap.dropIndex
              : Math.max(0, cardVisible)
            : Math.max(0, cardVisible)
          commitCardMove(snap.kbDrag.id, snap.kbDrag.fromColumnId, toColumnId, toVisible)
          snap = { ...snap, kbDrag: null }
          emit()
        }
        return true
      }

      return false
    },

    columnBodyKeyDown(key, column) {
      if (!opts.draggable || !snap.kbDrag || snap.kbDrag.type !== 'card') return false

      if (key === 'Escape') {
        resetKb()
        return true
      }

      const arrow = arrowDirection(key)
      if (arrow) {
        const next = moveTaskBoardKeyboardDrop(
          callbacks.getView(),
          {
            columnId: snap.dropTargetColumnId ?? column.id,
            dropIndex: snap.dropIndex < 0 ? 0 : snap.dropIndex
          },
          arrow
        )
        setDropTarget(next.columnId, next.dropIndex)
        return true
      }

      if (key === 'Enter' || key === ' ') {
        if (snap.kbDrag.fromColumnId === undefined) return false
        const viewCol = findTaskBoardViewColumn(callbacks.getView(), column.id)
        const toVisible =
          snap.dropTargetColumnId === column.id && snap.dropIndex >= 0
            ? snap.dropIndex
            : (viewCol?.visibleCards.length ?? 0)
        commitCardMove(snap.kbDrag.id, snap.kbDrag.fromColumnId, column.id, toVisible)
        snap = { ...snap, kbDrag: null }
        emit()
        return true
      }

      return false
    },

    columnKeyDown(key, column) {
      if (!opts.columnDraggable) return false

      if (key === 'Escape' && snap.kbDrag) {
        resetKb()
        return true
      }

      const arrow = arrowDirection(key)
      if (arrow && snap.kbDrag?.type === 'column' && (arrow === 'start' || arrow === 'end')) {
        const mapped = moveTaskBoardKeyboardColumn(
          callbacks.getSourceColumns(),
          callbacks.getView(),
          snap.kbDrag.id,
          arrow
        )
        if (mapped) {
          const result = callbacks.applyColumnMove(mapped.fromIndex, mapped.toIndex)
          if (result && typeof (result as Promise<void>).then === 'function') {
            pending = true
            void (result as Promise<void>).finally(() => {
              pending = false
            })
          }
          snap = {
            ...snap,
            kbDrag: { ...snap.kbDrag, fromIndex: mapped.toIndex }
          }
          emit()
        }
        return true
      }

      if (key === 'Enter' || key === ' ') {
        if (!snap.kbDrag) {
          const fromIndex = callbacks.getSourceColumns().findIndex((item) => item.id === column.id)
          snap = {
            ...snap,
            kbDrag: { type: 'column', id: column.id, fromIndex }
          }
          emit()
          return true
        }
        resetKb()
        return true
      }

      return false
    }
  }

  return ctrl
}
