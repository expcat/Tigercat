/**
 * Generic component type interfaces
 *
 * Provides type-safe generic variants of core data components.
 * These extend the base props with generic type parameter <T>
 * for type-safe column definitions, data access, and rendering.
 *
 * @module generics
 */

import type { ColumnAlign, ColumnFilter, SortState, TableSize, PaginationConfig } from './table'
import type { FormRuleTrigger, FormRuleType } from './form'

// ---------------------------------------------------------------------------
// Table<T> generics
// ---------------------------------------------------------------------------

/**
 * Type-safe column definition for Table<T>.
 *
 * The generic parameter ensures `dataKey` and `sortFn` align with the
 * actual row data shape.
 */
export interface GenericTableColumn<T> {
  /** Column key (must be unique) */
  key: string
  /** Column header text */
  title: string
  /** Property key on T to access cell value. Falls back to `key` */
  dataKey?: keyof T & string
  /** Column width (CSS value) */
  width?: string | number
  /** Column alignment @default 'left' */
  align?: ColumnAlign
  /** Whether column is sortable @default false */
  sortable?: boolean
  /** Typed sort comparator — receives actual row values */
  sortFn?: (a: T, b: T) => number
  /** Column filter configuration */
  filter?: ColumnFilter
  /** Whether column is fixed @default false */
  fixed?: 'left' | 'right' | false
  /** Render function for cell content */
  render?: (record: T, index: number) => unknown
  /** Render function for header */
  renderHeader?: () => unknown
  /** CSS class for column cells */
  className?: string
  /** CSS class for header cell */
  headerClassName?: string
}

/**
 * Type-safe row selection config.
 */
export interface GenericRowSelection<T> {
  /** Controlled selected row keys */
  selectedRowKeys?: (string | number)[]
  /** Default selected row keys (uncontrolled) */
  defaultSelectedRowKeys?: (string | number)[]
  /** Function to derive a row's unique key */
  getRowKey?: (record: T) => string | number
  /** Whether to show checkbox column @default true */
  showCheckbox?: boolean
  /** Selection type @default 'checkbox' */
  type?: 'checkbox' | 'radio'
  /** Per-row checkbox props */
  getCheckboxProps?: (record: T) => { disabled?: boolean }
}

/**
 * Type-safe expandable row config.
 */
export interface GenericExpandable<T> {
  /** Controlled expanded row keys */
  expandedRowKeys?: (string | number)[]
  /** Default expanded row keys (uncontrolled) */
  defaultExpandedRowKeys?: (string | number)[]
  /** Render expanded content */
  expandedRowRender?: (record: T, index: number) => unknown
  /** Whether a row is expandable @default () => true */
  rowExpandable?: (record: T) => boolean
  /** Click row to expand @default false */
  expandRowByClick?: boolean
  /** Position of expand icon @default 'start' */
  expandIconPosition?: 'start' | 'end'
}

/**
 * Generic Table props with full type safety over row data.
 *
 * @example
 * ```ts
 * interface User { id: number; name: string; age: number }
 *
 * const props: GenericTableProps<User> = {
 *   columns: [
 *     { key: 'name', title: 'Name', dataKey: 'name', sortable: true },
 *     { key: 'age', title: 'Age', dataKey: 'age' }
 *   ],
 *   dataSource: users
 * }
 * ```
 */
export interface GenericTableProps<T> {
  /** Column definitions */
  columns: GenericTableColumn<T>[]
  /** Whether column headers show a lock toggle @default false */
  columnLockable?: boolean
  /** Table data @default [] */
  dataSource?: T[]
  /** Controlled sort state */
  sort?: SortState
  /** Default sort state (uncontrolled) */
  defaultSort?: SortState
  /** Controlled filters */
  filters?: Record<string, unknown>
  /** Default filters (uncontrolled) */
  defaultFilters?: Record<string, unknown>
  /** Table size @default 'md' */
  size?: TableSize
  /** Show border @default false */
  bordered?: boolean
  /** Show striped rows @default false */
  striped?: boolean
  /** Highlight on hover @default true */
  hoverable?: boolean
  /** Loading state @default false */
  loading?: boolean
  /** Empty text @default 'No data' */
  emptyText?: string
  /** Pagination config (false to disable) */
  pagination?: PaginationConfig | false
  /** Row selection config */
  rowSelection?: GenericRowSelection<T>
  /** Row expansion config */
  expandable?: GenericExpandable<T>
  /** Row key accessor @default (record) => record.id */
  rowKey?: string | ((record: T) => string | number)
  /** Row class name */
  rowClassName?: string | ((record: T, index: number) => string)
  /** Sticky header @default false */
  stickyHeader?: boolean
  /** Max height for scrollable table */
  maxHeight?: string | number
  /** Table layout @default 'auto' */
  tableLayout?: 'auto' | 'fixed'
}

// ---------------------------------------------------------------------------
// Select<T> generics
// ---------------------------------------------------------------------------

/**
 * A Select option whose value is constrained to T.
 */
export interface GenericSelectOption<T extends string | number = string | number> {
  /** Option value */
  value: T
  /** Display label */
  label: string
  /** Whether option is disabled @default false */
  disabled?: boolean
}

/**
 * A Select option group.
 */
export interface GenericSelectOptionGroup<T extends string | number = string | number> {
  /** Group label */
  label: string
  /** Options within this group */
  options: GenericSelectOption<T>[]
}

/**
 * Generic Select props with type-safe value/options.
 *
 * @example
 * ```ts
 * const props: GenericSelectProps<number> = {
 *   options: [
 *     { value: 1, label: 'One' },
 *     { value: 2, label: 'Two' }
 *   ]
 * }
 * ```
 */
export interface GenericSelectProps<T extends string | number = string | number> {
  /** Select size @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Whether disabled @default false */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Allow search @default false */
  searchable?: boolean
  /** Allow multiple selection @default false */
  multiple?: boolean
  /** Allow clearing @default true */
  clearable?: boolean
  /** Typed options list */
  options?: Array<GenericSelectOption<T> | GenericSelectOptionGroup<T>>
  /** Text when no search match @default 'No options found' */
  noOptionsText?: string
  /** Text when list is empty @default 'No options available' */
  noDataText?: string
}

// ---------------------------------------------------------------------------
// FormField<T> generics
// ---------------------------------------------------------------------------

/**
 * Generic form validation rule.
 *
 * The generic parameter constrains the `validator` callback to the
 * expected field value type.
 */
export interface GenericFormRule<T = unknown> {
  /** Rule type */
  type?: FormRuleType
  /** Whether required @default false */
  required?: boolean
  /** Min length/value/items */
  min?: number
  /** Max length/value/items */
  max?: number
  /** Regex pattern */
  pattern?: RegExp
  /** Typed validator */
  validator?: (
    value: T,
    values?: Record<string, unknown>
  ) => boolean | string | Promise<boolean | string>
  /** Error message */
  message?: string
  /** Trigger @default ['change','blur'] */
  trigger?: FormRuleTrigger | FormRuleTrigger[]
  /** Transform before validation */
  transform?: (value: T) => T
}

/**
 * Generic form field props.
 *
 * @example
 * ```ts
 * const emailField: GenericFormFieldProps<string> = {
 *   name: 'email',
 *   label: 'Email',
 *   rules: [{ type: 'email', required: true, message: 'Enter a valid email' }]
 * }
 * ```
 */
export interface GenericFormFieldProps<T = unknown> {
  /** Field name (key in form model) */
  name?: string
  /** Label text */
  label?: string
  /** Label width */
  labelWidth?: string | number
  /** Whether required */
  required?: boolean
  /** Validation rules */
  rules?: GenericFormRule<T> | GenericFormRule<T>[]
  /** Controlled error message */
  error?: string
  /** Show validation message @default true */
  showMessage?: boolean
  /** Field size */
  size?: 'sm' | 'md' | 'lg'
}
