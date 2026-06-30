/**
 * TaskBoard composite component types
 */

/**
 * A single card (task item) on the board.
 */
export interface TaskBoardCard {
  /** Unique identifier */
  id: string | number
  /** Card title */
  title: string
  /** Optional description text */
  description?: string
  /** Allow arbitrary extra fields (tags, assignee, priority, etc.) */
  [key: string]: unknown
}

/**
 * A column (stage / lane) on the board.
 */
export interface TaskBoardColumn {
  /** Unique identifier */
  id: string | number
  /** Column header title */
  title: string
  /** Optional description or subtitle */
  description?: string
  /**
   * Work-in-progress limit. When cards.length > wipLimit the header shows a warning style.
   */
  wipLimit?: number
  /** Cards belonging to this column */
  cards: TaskBoardCard[]
}

/**
 * Payload emitted when a card is moved (same-column reorder or cross-column transfer).
 */
export interface TaskBoardCardMoveEvent {
  /** The id of the card that was moved */
  cardId: string | number
  /** Column the card was dragged from */
  fromColumnId: string | number
  /** Column the card was dropped into */
  toColumnId: string | number
  /** Original index inside the source column */
  fromIndex: number
  /** New index inside the target column */
  toIndex: number
}

/**
 * Payload emitted when a column is reordered.
 */
export interface TaskBoardColumnMoveEvent {
  /** The id of the column that was moved */
  columnId: string | number
  /** Original position */
  fromIndex: number
  /** New position */
  toIndex: number
}

/**
 * Validation callback for task board move operations.
 * Return `false` (sync) or resolve to `false` (async) to cancel the move.
 */
export type TaskBoardMoveValidator<E> = (event: E) => boolean | Promise<boolean>

/**
 * TaskBoard (Kanban) component props.
 */
export interface TaskBoardProps {
  /**
   * Controlled column data (with nested cards).
   * When provided the component is fully controlled — the consumer must
   * update this value in response to move events.
   */
  columns?: TaskBoardColumn[]
  /**
   * Initial column data for uncontrolled usage.
   */
  defaultColumns?: TaskBoardColumn[]
  /**
   * Enable card drag-and-drop.
   * @default true
   */
  draggable?: boolean
  /**
   * Enable column (stage) drag-and-drop reordering.
   * @default true
   */
  columnDraggable?: boolean
  /**
   * Enforce WIP limit — when `true`, cards cannot be dropped into a
   * column that has already reached its `wipLimit`.
   * @default false
   */
  enforceWipLimit?: boolean
  /**
   * Async / sync validation before a card move is committed.
   * Return `false` to cancel the move (the card snaps back).
   */
  beforeCardMove?: TaskBoardMoveValidator<TaskBoardCardMoveEvent>
  /**
   * Async / sync validation before a column reorder is committed.
   * Return `false` to cancel the reorder.
   */
  beforeColumnMove?: TaskBoardMoveValidator<TaskBoardColumnMoveEvent>
  /**
   * Callback fired after a card is moved.
   */
  onCardMove?: (event: TaskBoardCardMoveEvent) => void
  /**
   * Callback fired after a column is reordered.
   */
  onColumnMove?: (event: TaskBoardColumnMoveEvent) => void
  /**
   * Callback fired whenever the columns data changes (card move, column reorder, etc.).
   * In controlled mode the consumer should use this to update the `columns` prop.
   */
  onColumnsChange?: (columns: TaskBoardColumn[]) => void
  /**
   * Callback fired when the "add card" button of a column is clicked.
   * If not provided the add-card button is hidden.
   */
  onCardAdd?: (columnId: string | number) => void
  /**
   * Custom card renderer (framework-agnostic signature — each framework
   * layer narrows the return type to its own node type).
   */
  renderCard?: (card: TaskBoardCard, columnId: string | number) => unknown
  /**
   * Custom column header renderer.
   */
  renderColumnHeader?: (column: TaskBoardColumn) => unknown
  /**
   * Custom column footer renderer (e.g. an "add card" form).
   */
  renderColumnFooter?: (column: TaskBoardColumn) => unknown
  /**
   * Custom empty-column placeholder renderer.
   */
  renderEmptyColumn?: (column: TaskBoardColumn) => unknown
  /**
   * Quick filter / search term applied to card titles.
   * When non-empty, only cards whose title or description contain
   * the term are shown; hidden-column filtering is also applied.
   */
  filterText?: string
  /**
   * Column IDs to hide from the board (e.g. for saved views).
   */
  hiddenColumns?: (string | number)[]
  /**
   * Show column card-count badges in the header.
   * @default false
   */
  showCardCount?: boolean
  /**
   * Show an inline "add card" button in each column footer.
   * @default false
   */
  allowAddCard?: boolean
  /**
   * Show an inline "add column" button after all columns.
   * @default false
   */
  allowAddColumn?: boolean
  /**
   * Callback fired when the "add column" button is clicked.
   * If not provided (and `allowAddColumn` is true), the button is still rendered.
   */
  onColumnAdd?: () => void
  /**
   * Locale overrides for TaskBoard UI text
   */
  locale?: Partial<import('./locale').TigerLocale>
  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<import('./locale').TigerLocaleTaskBoard>
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}
