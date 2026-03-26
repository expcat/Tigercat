/**
 * Shared slot / render-prop type definitions
 *
 * In Vue, these correspond to named slots (`<template #slotName>`).
 * In React, these correspond to render props (`renderSlotName`).
 *
 * This module defines framework-agnostic interfaces describing what data
 * each slot/render-prop receives, so both implementations stay in sync.
 *
 * @module slots
 */

// ---------------------------------------------------------------------------
// Table slots
// ---------------------------------------------------------------------------

/** Context passed to the table empty-state slot/render */
export interface TableEmptySlotContext {
  /** Current filter text (if any) */
  filterText?: string
}

/** Context passed to a table cell slot/render */
export interface TableCellSlotContext<T = Record<string, unknown>> {
  /** Row data record */
  record: T
  /** Row index */
  index: number
  /** Column key */
  columnKey: string
}

/** Context passed to expandable row content slot/render */
export interface TableExpandSlotContext<T = Record<string, unknown>> {
  /** The expanded row record */
  record: T
  /** Row index */
  index: number
}

// ---------------------------------------------------------------------------
// Modal / Drawer slots
// ---------------------------------------------------------------------------

/** Context for Modal/Drawer footer slot/render */
export interface OverlayFooterSlotContext {
  /** Close the overlay */
  close: () => void
  /** Whether the overlay is in loading state */
  loading?: boolean
}

/** Context for Modal/Drawer header slot/render */
export interface OverlayHeaderSlotContext {
  /** Title string */
  title?: string
  /** Close the overlay */
  close: () => void
}

// ---------------------------------------------------------------------------
// Form slots
// ---------------------------------------------------------------------------

/** Context for form item slot/render */
export interface FormItemSlotContext {
  /** Current field value */
  value: unknown
  /** Current field error message (if any) */
  error?: string
  /** Whether the field is being validated */
  validating?: boolean
}

// ---------------------------------------------------------------------------
// Select slots
// ---------------------------------------------------------------------------

/** Context for custom option rendering */
export interface SelectOptionSlotContext<T extends string | number = string | number> {
  /** Option value */
  value: T
  /** Option label */
  label: string
  /** Whether option is disabled */
  disabled?: boolean
  /** Whether option is currently selected */
  selected?: boolean
}

// ---------------------------------------------------------------------------
// Menu / Navigation slots
// ---------------------------------------------------------------------------

/** Context for menu item slot/render */
export interface MenuItemSlotContext {
  /** Item key */
  key: string
  /** Item label */
  label: string
  /** Whether the item is active/selected */
  active?: boolean
  /** Whether the item is disabled */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// List slots
// ---------------------------------------------------------------------------

/** Context for list item rendering */
export interface ListItemSlotContext<T = unknown> {
  /** Item data */
  item: T
  /** Item index */
  index: number
}

// ---------------------------------------------------------------------------
// Common patterns
// ---------------------------------------------------------------------------

/**
 * Generic slot context with just children content.
 * Used for simple wrapper slots that need no extra data.
 */
export interface EmptySlotContext {
  /* intentionally empty — signals a slot with no special context */
}
