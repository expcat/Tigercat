import type {
  TaskBoardColumn,
  TaskBoardCardMoveEvent,
  TaskBoardColumnMoveEvent
} from '../types/task-board'

// ============================================================================
// Tailwind class constants
// ============================================================================

/** Root wrapper — horizontal scroll container */
export const taskBoardBaseClasses =
  'tiger-task-board flex gap-5 overflow-x-auto p-6 min-h-[450px] scroll-smooth antialiased'

/** Single column shell */
export const taskBoardColumnClasses =
  'tiger-task-board-column flex flex-col shrink-0 w-76 rounded-[var(--tiger-radius-lg)] border border-[var(--tiger-border)]/80 bg-[var(--tiger-surface-muted)] shadow-xs [transition:var(--tiger-transition-base)] hover:shadow-md'

/** Column header (sticky, never scrolls) */
export const taskBoardColumnHeaderClasses =
  'flex items-center justify-between px-4 py-3.5 border-b border-[var(--tiger-border)]/60 text-sm font-semibold text-[var(--tiger-text)] select-none transition-colors'

/** Scrollable card area */
export const taskBoardColumnBodyClasses =
  'flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px] transition-colors'

/** Card base styles */
export const taskBoardCardClasses =
  'tiger-task-board-card rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)]/80 bg-[var(--tiger-surface)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)] cursor-grab select-none [transition:var(--tiger-transition-quick)] hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--tiger-primary)]/30 active:cursor-grabbing'

/** Card while being dragged */
export const taskBoardCardDraggingClasses = 'opacity-40 shadow-xl scale-[0.98] rotate-1'

/** Thin line indicating the drop position */
export const taskBoardDropIndicatorClasses =
  'h-1.5 rounded-full bg-[var(--tiger-primary)] my-2 shadow-[0_0_8px_var(--tiger-primary)] [transition:var(--tiger-transition-quick)]'

/** Column highlighted when a card hovers over it */
export const taskBoardColumnDropTargetClasses =
  'ring-2 ring-[var(--tiger-primary)]/60 bg-[color-mix(in_srgb,var(--tiger-primary)_4%,transparent)]'

/** Column being dragged */
export const taskBoardColumnDraggingClasses = 'opacity-50'

/** Empty column placeholder */
export const taskBoardEmptyClasses =
  'flex items-center justify-center text-[var(--tiger-text-secondary)] text-sm py-8'

/** WIP exceeded badge / header tint */
export const taskBoardWipExceededClasses = 'text-[var(--tiger-error)]'

/** Add-card button inside column footer */
export const taskBoardAddCardClasses =
  'flex items-center justify-center gap-1.5 w-[calc(100%-16px)] mx-2 my-2 py-2.5 text-xs font-semibold text-[var(--tiger-text-secondary)] border border-dashed border-[var(--tiger-border)] hover:border-[var(--tiger-primary)] hover:text-[var(--tiger-primary)] hover:bg-[var(--tiger-surface)] hover:shadow-xs rounded-[var(--tiger-radius-md)] [transition:var(--tiger-transition-quick)] cursor-pointer active:scale-98'

// ============================================================================
// Drag-data serialisation (used by both HTML5 DnD and touch fallback)
// ============================================================================

export interface CardDragData {
  type: 'card'
  cardId: string | number
  columnId: string | number
  index: number
  /** Board that started the drag. Other boards reject the payload. */
  boardId: string
}

export interface ColumnDragData {
  type: 'column'
  columnId: string | number
  index: number
  /** Board that started the drag. Other boards reject the payload. */
  boardId: string
}

export type TaskBoardDragData = CardDragData | ColumnDragData

const MIME = 'text/plain'

export function createCardDragData(
  cardId: string | number,
  columnId: string | number,
  index: number,
  boardId: string
): string {
  const data: CardDragData = { type: 'card', cardId, columnId, index, boardId }
  return JSON.stringify(data)
}

export function createColumnDragData(
  columnId: string | number,
  index: number,
  boardId: string
): string {
  const data: ColumnDragData = { type: 'column', columnId, index, boardId }
  return JSON.stringify(data)
}

export function parseDragData(
  dataTransfer: DataTransfer,
  boardId: string
): TaskBoardDragData | null {
  try {
    const raw = dataTransfer.getData(MIME)
    if (!raw) return null
    const data = JSON.parse(raw) as TaskBoardDragData
    if (data.type !== 'card' && data.type !== 'column') return null
    if (typeof data.boardId !== 'string' || data.boardId !== boardId) return null
    return data
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
 * Options for `moveCard()`.
 */
export interface MoveCardOptions {
  /** When `true`, reject a cross-column move if the destination column has reached its `wipLimit`. */
  enforceWipLimit?: boolean
}

/**
 * Move a card from one column to another (or reorder within the same column).
 * Returns a **new** columns array — the original is not mutated.
 * Returns `null` when the move is a no-op or rejected by WIP enforcement.
 */
export function moveCard(
  columns: TaskBoardColumn[],
  cardId: string | number,
  fromColumnId: string | number,
  toColumnId: string | number,
  toIndex: number,
  options?: MoveCardOptions
): { columns: TaskBoardColumn[]; event: TaskBoardCardMoveEvent } | null {
  const srcColIdx = columns.findIndex((c) => c.id === fromColumnId)
  const dstColIdx = columns.findIndex((c) => c.id === toColumnId)
  if (srcColIdx === -1 || dstColIdx === -1) return null

  const srcCol = columns[srcColIdx]
  const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId)
  if (cardIdx === -1) return null

  const card = srcCol.cards[cardIdx]
  const sameColumn = srcColIdx === dstColIdx

  // `toIndex` is the insertion point the indicator draws: before the card at
  // that index in the original list, or `length` to append. Same column and
  // cross column share it. The dragged card is not part of the insertion
  // list, so a same-column index after the source shifts left by one.
  // Do not clamp the end to `length - 1`.
  if (sameColumn) {
    const length = srcCol.cards.length
    const clampedTo = Math.max(0, Math.min(toIndex, length))
    const insertAt = clampedTo > cardIdx ? clampedTo - 1 : clampedTo
    if (insertAt === cardIdx) return null
    const newCards = [...srcCol.cards]
    newCards.splice(cardIdx, 1)
    newCards.splice(insertAt, 0, card)
    const newCols = columns.map((c, i) => (i === srcColIdx ? { ...c, cards: newCards } : c))
    return {
      columns: newCols,
      event: { cardId, fromColumnId, toColumnId, fromIndex: cardIdx, toIndex: insertAt }
    }
  }

  const dstLength = columns[dstColIdx].cards.length
  const clampedTo = Math.max(0, Math.min(toIndex, dstLength))

  // Cross-column transfer
  const dstCol = columns[dstColIdx]

  // WIP enforcement — reject if destination column is at or above its limit
  if (
    options?.enforceWipLimit &&
    dstCol.wipLimit != null &&
    dstCol.wipLimit > 0 &&
    dstCol.cards.length >= dstCol.wipLimit
  ) {
    return null
  }

  const newSrcCards = srcCol.cards.filter((c) => c.id !== cardId)
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

export const DEFAULT_TASK_BOARD_NEW_CARD_TITLE = 'New task'
export const DEFAULT_TASK_BOARD_NEW_COLUMN_TITLE = 'New column'

function nextDefaultTaskBoardCardId(columns: TaskBoardColumn[]): string {
  const used = new Set<string>()
  for (const column of columns) {
    for (const card of column.cards) {
      used.add(String(card.id))
    }
  }
  let n = 1
  let id = `card-${n}`
  while (used.has(id)) {
    n += 1
    id = `card-${n}`
  }
  return id
}

/**
 * Append a default card to the column identified by `columnId`.
 * Returns a **new** columns array — the original is not mutated.
 * Unknown `columnId` returns `columns` unchanged.
 */
export function appendDefaultTaskBoardCard(
  columns: TaskBoardColumn[],
  columnId: string | number,
  title = DEFAULT_TASK_BOARD_NEW_CARD_TITLE
): TaskBoardColumn[] {
  const colIdx = columns.findIndex((c) => c.id === columnId)
  if (colIdx === -1) return columns

  const card = { id: nextDefaultTaskBoardCardId(columns), title }
  return columns.map((column, i) =>
    i === colIdx ? { ...column, cards: [...column.cards, card] } : column
  )
}

function nextDefaultTaskBoardColumnId(columns: TaskBoardColumn[]): string {
  const used = new Set(columns.map((column) => String(column.id)))
  let n = 1
  let id = `column-${n}`
  while (used.has(id)) {
    n += 1
    id = `column-${n}`
  }
  return id
}

/**
 * Append a default empty column. Returns a **new** array.
 */
export function appendDefaultTaskBoardColumn(
  columns: TaskBoardColumn[],
  title = DEFAULT_TASK_BOARD_NEW_COLUMN_TITLE
): TaskBoardColumn[] {
  return [...columns, { id: nextDefaultTaskBoardColumnId(columns), title, cards: [] }]
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
 * Map a drop/insertion index from the visible (filtered) card list back to the
 * unfiltered source column. `visibleIndex` is an insertion point in
 * `0..visibleCards.length` — the same range `getDropIndex` returns.
 *
 * - `visibleIndex <= 0` → source index of `visibleCards[0]`, or `0` if visible is empty
 * - `0 < visibleIndex < visibleCards.length` → source index of `visibleCards[visibleIndex]`
 *   (insert BEFORE that visible card)
 * - `visibleIndex >= visibleCards.length` → one past the last visible card in source
 *   (`sourceIndex(lastVisible) + 1`), or `sourceCards.length` if visible is empty
 *
 * When `visibleCards` is the same sequence as `sourceCards`, the result is
 * `visibleIndex` clamped to `0..sourceCards.length`.
 *
 * Empty visible + index `0` maps to `0` (insert at the start of source). Unknown
 * visible ids (should not happen) fall back to `visibleIndex` or `sourceCards.length`
 * and do not throw.
 */
export function mapVisibleCardIndexToSource<T extends { id: string | number }>(
  sourceCards: T[],
  visibleCards: T[],
  visibleIndex: number
): number {
  if (visibleCards.length === 0) {
    return visibleIndex <= 0 ? 0 : sourceCards.length
  }

  if (visibleIndex <= 0) {
    const idx = sourceCards.findIndex((card) => card.id === visibleCards[0].id)
    return idx === -1 ? 0 : idx
  }

  if (visibleIndex >= visibleCards.length) {
    const last = visibleCards[visibleCards.length - 1]
    const idx = sourceCards.findIndex((card) => card.id === last.id)
    return idx === -1 ? sourceCards.length : idx + 1
  }

  const idx = sourceCards.findIndex((card) => card.id === visibleCards[visibleIndex].id)
  return idx === -1 ? visibleIndex : idx
}

/**
 * Given the pointer x and the bounding rects of visible columns, return the
 * insertion index. `dir` uses inline-start so RTL inserts from the right.
 */
export function getColumnDropIndex(
  pointerX: number,
  columnRects: DOMRect[],
  dir: 'ltr' | 'rtl' = 'ltr'
): number {
  for (let i = 0; i < columnRects.length; i++) {
    const mid = columnRects[i].left + columnRects[i].width / 2
    if (dir === 'rtl' ? pointerX > mid : pointerX < mid) return i
  }
  return columnRects.length
}

// ============================================================================
// Touch drag tracker (lightweight pointer-based fallback)
// ============================================================================

/** Pointer must move this far before a touch becomes a drag. Shorter moves scroll. */
export const TASK_BOARD_DRAG_THRESHOLD_PX = 8

export interface TouchDragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  active: boolean
  /** True only after the pointer passes {@link TASK_BOARD_DRAG_THRESHOLD_PX}. */
  engaged: boolean
  sourceElement: HTMLElement | null
}

const taskBoardColumnIds = new WeakMap<Element, string | number>()

/**
 * Remember the column id on the element itself. Hit testing reads this map
 * so a numeric id is not coerced through a string attribute.
 */
export function bindTaskBoardColumnId(element: Element | null, id: string | number): void {
  if (element) taskBoardColumnIds.set(element, id)
}

export function taskBoardColumnIdOf(element: Element | null): string | number | null {
  if (!element) return null
  const host = element.closest('[data-tiger-taskboard-column]')
  if (!host) return null
  const bound = taskBoardColumnIds.get(host)
  return bound === undefined ? null : bound
}

export function formatTaskBoardGrabAnnouncement(
  template: string,
  input: { card: string; from: string; to: string; position: number; count: number }
): string {
  return template
    .split('{card}')
    .join(input.card)
    .split('{from}')
    .join(input.from)
    .split('{to}')
    .join(input.to)
    .split('{position}')
    .join(String(input.position))
    .split('{count}')
    .join(String(input.count))
}

const TASK_BOARD_CONTROL_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [role="link"], [role="menuitem"]'

/** Enter / Space inside a card belong to the nested control, not the card grab. */
export function isTaskBoardNestedControl(
  target: EventTarget | null,
  current: EventTarget | null
): boolean {
  if (!(target instanceof Element) || target === current) return false
  return Boolean(target.closest(TASK_BOARD_CONTROL_SELECTOR))
}

export function nextTaskBoardRovingCardId(
  cards: readonly { id: string | number }[],
  cardId: string | number | null,
  direction: 'up' | 'down'
): string | number | null {
  if (cards.length === 0) return null
  const index = cardId == null ? -1 : cards.findIndex((card) => card.id === cardId)
  if (index < 0) return cards[0]?.id ?? null
  const next = direction === 'down' ? index + 1 : index - 1
  if (next < 0 || next >= cards.length) return cards[index]?.id ?? null
  return cards[next]?.id ?? null
}

/** One tab stop per column: the active card, or the first card when none is active. */
export function taskBoardRovingTabIndex(
  cards: readonly { id: string | number }[],
  cardId: string | number,
  activeId: string | number | null | undefined
): 0 | -1 {
  if (cards.length === 0) return -1
  const active = cards.find((card) => card.id === activeId)
  const dock = active?.id ?? cards[0]?.id
  return cardId === dock ? 0 : -1
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
    engaged: false,
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
        engaged: false,
        sourceElement: source
      }
    },

    onTouchMove(e: TouchEvent) {
      if (!state.active) return
      const touch = e.touches[0]
      state.currentX = touch.clientX
      state.currentY = touch.clientY
      const dx = state.currentX - state.startX
      const dy = state.currentY - state.startY
      if (!state.engaged) {
        if (dx * dx + dy * dy < TASK_BOARD_DRAG_THRESHOLD_PX * TASK_BOARD_DRAG_THRESHOLD_PX) {
          return
        }
        state.engaged = true
      }
      e.preventDefault()
    },

    onTouchEnd() {
      const engaged = state.engaged
      state = { ...state, active: false, engaged, sourceElement: null }
      return { ...state }
    },

    getState() {
      return state
    },

    cancel() {
      state = { ...state, active: false, engaged: false, sourceElement: null }
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
