/**
 * Drag & Drop Types — Framework-agnostic type definitions
 *
 * Supports: list sorting, cross-container drag, tree node move, panel resize
 */

// ---------------------------------------------------------------------------
// Drag Item
// ---------------------------------------------------------------------------

/**
 * Represents a draggable item
 */
export interface DragItem {
  /** Unique identifier for the item */
  id: string | number
  /** Arbitrary data attached to the item */
  data?: Record<string, unknown>
  /** Current index in the list */
  index: number
  /** Container id (for cross-container drag) */
  containerId?: string
}

// ---------------------------------------------------------------------------
// Drag Direction & Axis
// ---------------------------------------------------------------------------

/** Allowed drag directions */
export type DragDirection = 'vertical' | 'horizontal' | 'both'

/** Drag axis — resolved from direction at runtime */
export type DragAxis = 'x' | 'y'

// ---------------------------------------------------------------------------
// Drag Config
// ---------------------------------------------------------------------------

/**
 * Configuration for drag behavior
 */
export interface DragConfig {
  /** Direction of drag — defaults to 'vertical' */
  direction?: DragDirection
  /** CSS selector for the drag handle (if omitted, the whole item is draggable) */
  handleSelector?: string
  /** CSS class applied to the dragged element */
  dragClass?: string
  /** CSS class applied to the ghost/placeholder element */
  ghostClass?: string
  /** Auto-scroll speed (px/frame) when dragging near edges */
  scrollSpeed?: number
  /** Distance (px) from container edge to trigger auto-scroll */
  scrollMargin?: number
  /** Whether drag is disabled */
  disabled?: boolean
  /** Whether to allow cross-container drag */
  crossContainer?: boolean
  /** Lock axis — constrain drag to a single axis */
  lockAxis?: DragAxis
  /** Minimum distance (px) before a drag is initiated */
  dragThreshold?: number
}

// ---------------------------------------------------------------------------
// Drag State
// ---------------------------------------------------------------------------

/**
 * Runtime drag state — maintained by the headless drag system
 */
export interface DragState {
  /** Whether a drag is currently in progress */
  isDragging: boolean
  /** The item being dragged (null if not dragging) */
  draggedItem: DragItem | null
  /** The item currently hovered over */
  hoveredItem: DragItem | null
  /** Source container id (for cross-container) */
  sourceContainerId: string | null
  /** Target container id (for cross-container) */
  targetContainerId: string | null
  /** Source index at drag start */
  sourceIndex: number
  /** Current target index where item would be dropped */
  targetIndex: number
  /** Current drag offset from start position */
  offsetX: number
  /** Current drag offset from start position */
  offsetY: number
}

// ---------------------------------------------------------------------------
// Drag Events / Callbacks
// ---------------------------------------------------------------------------

/** Payload emitted when a drag starts */
export interface DragStartEvent {
  item: DragItem
  containerId: string
}

/** Payload emitted when an item is dragged over another */
export interface DragOverEvent {
  item: DragItem
  overItem: DragItem | null
  containerId: string
}

/** Payload emitted when a drop occurs */
export interface DragDropEvent {
  item: DragItem
  fromIndex: number
  toIndex: number
  fromContainerId: string
  toContainerId: string
}

/** Payload emitted when drag ends (regardless of drop) */
export interface DragEndEvent {
  item: DragItem
  cancelled: boolean
}

/**
 * Drag event callbacks — unified across Vue/React
 */
export interface DragCallbacks {
  onDragStart?: (event: DragStartEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  onDrop?: (event: DragDropEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
}

// ---------------------------------------------------------------------------
// Drag Result
// ---------------------------------------------------------------------------

/**
 * Result of a reorder operation
 */
export interface DragReorderResult<T = DragItem> {
  /** The reordered items */
  items: T[]
  /** Index the item was moved from */
  fromIndex: number
  /** Index the item was moved to */
  toIndex: number
}

/**
 * Result of a cross-container move operation
 */
export interface DragMoveResult<T = DragItem> {
  /** Items in the source container after the move */
  sourceItems: T[]
  /** Items in the target container after the move */
  targetItems: T[]
  /** The moved item */
  movedItem: T
}
