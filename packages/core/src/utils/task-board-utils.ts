import type {
  TaskBoardColumn,
  TaskBoardCardMoveEvent,
  TaskBoardColumnMoveEvent
} from '../types/composite'

// ============================================================================
// Tailwind class constants
// ============================================================================

/** Root wrapper — horizontal scroll container */
export const taskBoardBaseClasses = 'tiger-task-board flex gap-4 overflow-x-auto p-4 min-h-[400px]'

/** Single column shell */
export const taskBoardColumnClasses =
  'tiger-task-board-column flex flex-col shrink-0 w-72 rounded-lg border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm transition-shadow'

/** Column header (sticky, never scrolls) */
export const taskBoardColumnHeaderClasses =
  'flex items-center justify-between px-3 py-2 border-b border-[var(--tiger-border,#e5e7eb)] text-sm font-semibold text-[var(--tiger-text,#1f2937)] select-none'

/** Scrollable card area */
export const taskBoardColumnBodyClasses = 'flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]'

/** Card base styles */
export const taskBoardCardClasses =
  'tiger-task-board-card rounded-md border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-3 shadow-sm cursor-grab select-none transition-opacity'

/** Card while being dragged */
export const taskBoardCardDraggingClasses = 'opacity-50 shadow-lg'

/** Thin line indicating the drop position */
export const taskBoardDropIndicatorClasses =
  'h-1 rounded-full bg-[var(--tiger-primary,#2563eb)] my-1 transition-all'

/** Column highlighted when a card hovers over it */
export const taskBoardColumnDropTargetClasses =
  'ring-2 ring-[var(--tiger-primary,#2563eb)] ring-opacity-50'

/** Column being dragged */
export const taskBoardColumnDraggingClasses = 'opacity-50'

/** Empty column placeholder */
export const taskBoardEmptyClasses =
  'flex items-center justify-center text-[var(--tiger-text-muted,#6b7280)] text-sm py-8'

/** WIP exceeded badge / header tint */
export const taskBoardWipExceededClasses = 'text-[var(--tiger-error,#ef4444)]'

/** Add-card button inside column footer */
export const taskBoardAddCardClasses =
  'flex items-center justify-center gap-1 w-full py-1.5 text-sm text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] rounded transition-colors cursor-pointer'

// ============================================================================
// Drag-data serialisation (used by both HTML5 DnD and touch fallback)
// ============================================================================

export interface CardDragData {
  type: 'card'
  cardId: string | number
  columnId: string | number
  index: number
}

export interface ColumnDragData {
  type: 'column'
  columnId: string | number
  index: number
}

export type TaskBoardDragData = CardDragData | ColumnDragData

const MIME = 'text/plain'

export function createCardDragData(
  cardId: string | number,
  columnId: string | number,
  index: number
): string {
  const data: CardDragData = { type: 'card', cardId, columnId, index }
  return JSON.stringify(data)
}

export function createColumnDragData(columnId: string | number, index: number): string {
  const data: ColumnDragData = { type: 'column', columnId, index }
  return JSON.stringify(data)
}

export function parseDragData(dataTransfer: DataTransfer): TaskBoardDragData | null {
  try {
    const raw = dataTransfer.getData(MIME)
    if (!raw) return null
    const data = JSON.parse(raw) as TaskBoardDragData
    if (data.type === 'card' || data.type === 'column') return data
    return null
  } catch {
    return null
  }
}

export function setDragData(dataTransfer: DataTransfer, json: string): void {
  dataTransfer.setData(MIME, json)
  dataTransfer.effectAllowed = 'move'
}

// ============================================================================
// Drag state (shared between frameworks)
// ============================================================================

export interface TaskBoardDragState {
  type: 'card' | 'column'
  id: string | number
  fromColumnId?: string | number
  fromIndex: number
}

// ============================================================================
// Pure data transforms — immutable, no DOM
// ============================================================================

/**
 * Move a card from one column to another (or reorder within the same column).
 * Returns a **new** columns array — the original is not mutated.
 */
export function moveCard(
  columns: TaskBoardColumn[],
  cardId: string | number,
  fromColumnId: string | number,
  toColumnId: string | number,
  toIndex: number
): { columns: TaskBoardColumn[]; event: TaskBoardCardMoveEvent } | null {
  const srcColIdx = columns.findIndex((c) => c.id === fromColumnId)
  const dstColIdx = columns.findIndex((c) => c.id === toColumnId)
  if (srcColIdx === -1 || dstColIdx === -1) return null

  const srcCol = columns[srcColIdx]
  const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId)
  if (cardIdx === -1) return null

  const card = srcCol.cards[cardIdx]
  const clampedTo = Math.max(
    0,
    Math.min(
      toIndex,
      srcColIdx === dstColIdx ? srcCol.cards.length - 1 : columns[dstColIdx].cards.length
    )
  )

  // Same column reorder
  if (srcColIdx === dstColIdx) {
    if (cardIdx === clampedTo) return null
    const newCards = [...srcCol.cards]
    newCards.splice(cardIdx, 1)
    newCards.splice(clampedTo, 0, card)
    const newCols = columns.map((c, i) => (i === srcColIdx ? { ...c, cards: newCards } : c))
    return {
      columns: newCols,
      event: { cardId, fromColumnId, toColumnId, fromIndex: cardIdx, toIndex: clampedTo }
    }
  }

  // Cross-column transfer
  const newSrcCards = srcCol.cards.filter((c) => c.id !== cardId)
  const dstCol = columns[dstColIdx]
  const newDstCards = [...dstCol.cards]
  newDstCards.splice(clampedTo, 0, card)

  const newCols = columns.map((c, i) => {
    if (i === srcColIdx) return { ...c, cards: newSrcCards }
    if (i === dstColIdx) return { ...c, cards: newDstCards }
    return c
  })

  return {
    columns: newCols,
    event: { cardId, fromColumnId, toColumnId, fromIndex: cardIdx, toIndex: clampedTo }
  }
}

/**
 * Reorder a column. Returns a new array.
 */
export function reorderColumns(
  columns: TaskBoardColumn[],
  fromIndex: number,
  toIndex: number
): { columns: TaskBoardColumn[]; event: TaskBoardColumnMoveEvent } | null {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    fromIndex >= columns.length ||
    toIndex < 0 ||
    toIndex >= columns.length
  ) {
    return null
  }

  const col = columns[fromIndex]
  const next = [...columns]
  next.splice(fromIndex, 1)
  next.splice(toIndex, 0, col)

  return {
    columns: next,
    event: { columnId: col.id, fromIndex, toIndex }
  }
}

/**
 * Check whether a column exceeds its WIP limit.
 */
export function isWipExceeded(column: TaskBoardColumn): boolean {
  if (column.wipLimit == null || column.wipLimit <= 0) return false
  return column.cards.length > column.wipLimit
}

// ============================================================================
// Drop-index calculation (needs DOMRect[] — callers pass pre-collected rects)
// ============================================================================

/**
 * Given the vertical centre of the pointer and the bounding rects of all
 * card elements in a column, return the insertion index.
 */
export function getDropIndex(pointerY: number, cardRects: DOMRect[]): number {
  for (let i = 0; i < cardRects.length; i++) {
    const mid = cardRects[i].top + cardRects[i].height / 2
    if (pointerY < mid) return i
  }
  return cardRects.length
}

/**
 * Given the horizontal centre of the pointer and the bounding rects of all
 * column elements, return the insertion index for column reordering.
 */
export function getColumnDropIndex(pointerX: number, columnRects: DOMRect[]): number {
  for (let i = 0; i < columnRects.length; i++) {
    const mid = columnRects[i].left + columnRects[i].width / 2
    if (pointerX < mid) return i
  }
  return columnRects.length
}

// ============================================================================
// Touch drag tracker (lightweight pointer-based fallback)
// ============================================================================

export interface TouchDragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  active: boolean
  sourceElement: HTMLElement | null
}

export interface TouchDragTracker {
  onTouchStart: (e: TouchEvent, source: HTMLElement) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: () => TouchDragState
  getState: () => TouchDragState
  cancel: () => void
}

export function createTouchDragTracker(): TouchDragTracker {
  let state: TouchDragState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    active: false,
    sourceElement: null
  }

  return {
    onTouchStart(e: TouchEvent, source: HTMLElement) {
      const touch = e.touches[0]
      state = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        active: true,
        sourceElement: source
      }
    },

    onTouchMove(e: TouchEvent) {
      if (!state.active) return
      const touch = e.touches[0]
      state.currentX = touch.clientX
      state.currentY = touch.clientY
      e.preventDefault() // prevent scroll while dragging
    },

    onTouchEnd() {
      state = { ...state, active: false, sourceElement: null }
      return { ...state }
    },

    getState() {
      return state
    },

    cancel() {
      state = { ...state, active: false, sourceElement: null }
    }
  }
}

/**
 * Resolve the column element sitting under a point (touch or pointer position).
 */
export function findColumnFromPoint(
  x: number,
  y: number,
  boardEl: HTMLElement | null
): HTMLElement | null {
  if (!boardEl) return null
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  return el.closest('[data-tiger-taskboard-column]') as HTMLElement | null
}
