/**
 * Shared item model for Dropdown and ContextMenu.
 * This is not the Menu schema.
 */

export type PopupMenuItemType =
  | 'item'
  | 'link'
  | 'danger'
  | 'separator'
  | 'checkbox'
  | 'radio'
  | 'submenu'

export interface PopupMenuItem {
  key: string | number
  type?: PopupMenuItemType
  label?: string
  href?: string
  disabled?: boolean
  shortcut?: string
  /** Controlled checked state for checkbox and radio. */
  checked?: boolean
  /** Radio group. Items that share a group are one set. */
  group?: string
  children?: PopupMenuItem[]
}

export interface PopupMenuCheckChange {
  key: string | number
  checked: boolean
  group?: string
}
