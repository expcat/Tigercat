/**
 * Shared event type definitions
 *
 * Centralises common event callback signatures used across Vue and React
 * component implementations. Individual component types may extend these
 * with component-specific events.
 *
 * Naming convention:
 * - Vue emits use kebab-case strings (`'update:open'`, `'change'`)
 * - React props use camelCase callbacks (`onChange`, `onOpenChange`)
 * - This module defines the **callback signatures** (framework-agnostic)
 *
 * @module events
 */

// ---------------------------------------------------------------------------
// Primitive value change events
// ---------------------------------------------------------------------------

/** Callback when a string value changes (Input, Textarea, Search, etc.) */
export type StringChangeHandler = (value: string) => void

/** Callback when a numeric value changes (InputNumber, Slider, etc.) */
export type NumberChangeHandler = (value: number) => void

/** Callback when a boolean value changes (Switch, Checkbox single, etc.) */
export type BooleanChangeHandler = (checked: boolean) => void

/** Callback when a selection value changes (Select, Radio, etc.) */
export type SelectChangeHandler<T extends string | number = string | number> = (value: T) => void

/** Callback when multiple selection values change (Select multiple, Checkbox group, etc.) */
export type MultiSelectChangeHandler<T extends string | number = string | number> = (
  values: T[]
) => void

// ---------------------------------------------------------------------------
// Visibility / open state events
// ---------------------------------------------------------------------------

/** Callback when an overlay opens or closes (Modal, Drawer, Dropdown, Popover, etc.) */
export type OpenChangeHandler = (open: boolean) => void

// ---------------------------------------------------------------------------
// Form events
// ---------------------------------------------------------------------------

/** Callback when form validation completes */
export type FormValidateHandler = (
  valid: boolean,
  errors: Array<{ field: string; message: string }>
) => void

/** Callback when form is submitted */
export type FormSubmitHandler = (values: Record<string, unknown>) => void

/** Callback when form field value changes */
export type FormFieldChangeHandler = (name: string, value: unknown) => void

// ---------------------------------------------------------------------------
// Table events
// ---------------------------------------------------------------------------

/** Callback when sort state changes */
export type TableSortChangeHandler = (sort: {
  key: string | null
  direction: 'asc' | 'desc' | null
}) => void

/** Callback when filter state changes */
export type TableFilterChangeHandler = (filters: Record<string, unknown>) => void

/** Callback when selected rows change */
export type TableSelectionChangeHandler = (selectedKeys: (string | number)[]) => void

/** Callback when expanded rows change */
export type TableExpandChangeHandler = (expandedKeys: (string | number)[]) => void

/** Callback when page or page size changes */
export type PaginationChangeHandler = (page: number, pageSize: number) => void

/** Callback when a table row is clicked */
export type TableRowClickHandler<T = Record<string, unknown>> = (record: T, index: number) => void

// ---------------------------------------------------------------------------
// Navigation events
// ---------------------------------------------------------------------------

/** Callback when a menu item is selected */
export type MenuSelectHandler = (key: string) => void

/** Callback when a tab is changed */
export type TabChangeHandler = (activeKey: string) => void

/** Callback when a step is changed */
export type StepChangeHandler = (current: number) => void

// ---------------------------------------------------------------------------
// Interaction events
// ---------------------------------------------------------------------------

/** Callback when an item is clicked */
export type ItemClickHandler<T = unknown> = (item: T) => void

/** Callback on close/dismiss (Notification, Alert dismissible, etc.) */
export type CloseHandler = () => void

/** Callback on confirm (Popconfirm, Modal confirm, etc.) */
export type ConfirmHandler = () => void

/** Callback on cancel (Popconfirm, Modal cancel, etc.) */
export type CancelHandler = () => void

// ---------------------------------------------------------------------------
// Search / filter events
// ---------------------------------------------------------------------------

/** Callback when a search query changes */
export type SearchHandler = (query: string) => void
