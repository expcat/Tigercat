import { type PropType } from 'vue'
import type {
  TableColumn,
  TableSize,
  SortState,
  PaginationConfig,
  RowSelectionConfig,
  ExpandableConfig,
  FilterRule
} from '@expcat/tigercat-core'

/**
 * Public TS prop interface for Vue Table — surfaces in IDE / docs.
 */
export interface VueTableProps {
  columns: TableColumn[]
  columnLockable?: boolean
  dataSource?: Record<string, unknown>[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  size?: TableSize
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  loading?: boolean
  emptyText?: string
  pagination?: PaginationConfig | false
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  rowKey?: string | ((record: Record<string, unknown>) => string | number)
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string)
  stickyHeader?: boolean
  maxHeight?: string | number
  // v0.6.0
  virtual?: boolean
  virtualHeight?: number
  virtualItemHeight?: number
  editable?: boolean
  editableCells?: Map<string, Set<number>>
  filterMode?: 'basic' | 'advanced'
  advancedFilterRules?: FilterRule[]
  columnDraggable?: boolean
  summaryRow?: { show: boolean; data: Record<string, unknown> }
  groupBy?: string
  exportable?: boolean
  exportFilename?: string
}

/**
 * Vue runtime prop definitions consumed by `defineComponent({ props })`.
 *
 * Kept as a const object (not wrapped in a function) so its inferred type can
 * be reused by helper modules without circular type traps.
 */
export const tableProps = {
  columns: {
    type: Array as PropType<TableColumn[]>,
    required: true as const
  },
  columnLockable: {
    type: Boolean,
    default: false
  },
  dataSource: {
    type: Array as PropType<Record<string, unknown>[]>,
    default: () => []
  },
  sort: {
    type: Object as PropType<SortState>
  },
  defaultSort: {
    type: Object as PropType<SortState>,
    default: () => ({
      key: null,
      direction: null
    })
  },
  filters: {
    type: Object as PropType<Record<string, unknown>>
  },
  defaultFilters: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  },
  size: {
    type: String as PropType<TableSize>,
    default: 'md' as TableSize
  },
  bordered: {
    type: Boolean,
    default: false
  },
  striped: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'No data'
  },
  pagination: {
    type: [Object, Boolean] as PropType<PaginationConfig | false>,
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0,
      pageSizeOptions: [10, 20, 50, 100],
      showSizeChanger: true,
      showTotal: true
    })
  },
  rowSelection: {
    type: Object as PropType<RowSelectionConfig>
  },
  expandable: {
    type: Object as PropType<ExpandableConfig>
  },
  rowKey: {
    type: [String, Function] as PropType<
      string | ((record: Record<string, unknown>) => string | number)
    >,
    default: 'id'
  },
  rowClassName: {
    type: [String, Function] as PropType<
      string | ((record: Record<string, unknown>, index: number) => string)
    >
  },
  stickyHeader: {
    type: Boolean,
    default: false
  },
  maxHeight: {
    type: [String, Number] as PropType<string | number>
  },
  tableLayout: {
    type: String as PropType<'auto' | 'fixed'>,
    default: 'auto'
  },
  // --- v0.6.0 props ---
  virtual: { type: Boolean, default: false },
  virtualHeight: { type: Number, default: 400 },
  virtualItemHeight: { type: Number, default: 40 },
  editable: { type: Boolean, default: false },
  editableCells: { type: Object as PropType<Map<string, Set<number>>> },
  filterMode: { type: String as PropType<'basic' | 'advanced'>, default: 'basic' },
  advancedFilterRules: { type: Array as PropType<FilterRule[]>, default: () => [] },
  columnDraggable: { type: Boolean, default: false },
  summaryRow: { type: Object as PropType<{ show: boolean; data: Record<string, unknown> }> },
  groupBy: { type: String },
  exportable: { type: Boolean, default: false },
  exportFilename: { type: String, default: 'export' }
} as const

export const tableEmits = [
  'change',
  'row-click',
  'selection-change',
  'sort-change',
  'filter-change',
  'page-change',
  'expand-change',
  'cell-change',
  'column-order-change',
  'export'
] as const

export type TableEmits = (typeof tableEmits)[number]
