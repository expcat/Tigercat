import { type PropType } from 'vue'
import type {
  TableColumn,
  TableSize,
  TableResponsiveMode,
  TableCardBreakpoint,
  SortState,
  PaginationConfig,
  RowSelectionConfig,
  ExpandableConfig,
  FilterRule,
  TigerLocaleInput,
  TigerLocaleTable,
  TableCardRenderContext,
  TableCardLayoutItem,
  TableCardSelectionPosition
} from '@expcat/tigercat-core'

/**
 * Public TS prop interface for Vue Table — surfaces in IDE / docs.
 */
export interface VueTableProps {
  columns: TableColumn[]
  columnLockable?: boolean
  dataSource?: Record<string, unknown>[]
  hiddenColumnKeys?: string[]
  defaultHiddenColumnKeys?: string[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  size?: TableSize
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  loading?: boolean
  locale?: TigerLocaleInput
  labels?: Partial<TigerLocaleTable>
  emptyText?: string
  pagination?: PaginationConfig | false
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  rowKey?: string | ((record: Record<string, unknown>) => string | number)
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string)
  stickyHeader?: boolean
  maxHeight?: string | number
  tableLayout?: 'auto' | 'fixed'
  responsiveMode?: TableResponsiveMode
  cardBreakpoint?: TableCardBreakpoint
  cardClassName?: string | ((record: Record<string, unknown>, index: number) => string | undefined)
  renderCard?: (context: TableCardRenderContext<Record<string, unknown>>) => unknown
  cardSelectionPosition?: TableCardSelectionPosition
  cardPadding?: string | false
  cardFieldGap?: string
  // v0.6.0
  virtual?: boolean
  virtualHeight?: number
  virtualItemHeight?: number
  autoVirtual?: boolean
  autoVirtualThreshold?: number
  virtualThreshold?: number
  editable?: boolean
  editableCells?: Map<string, Set<number>>
  filterMode?: 'basic' | 'advanced'
  advancedFilterRules?: FilterRule[]
  columnDraggable?: boolean
  rowDraggable?: boolean
  summaryRow?: { show: boolean; data: Record<string, unknown> }
  groupBy?: string
  exportable?: boolean
  exportFormat?: 'csv' | 'excel'
  exportFilename?: string
  cardLayout?: TableCardLayoutItem[]
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
  hiddenColumnKeys: {
    type: Array as PropType<string[]>,
    default: undefined
  },
  defaultHiddenColumnKeys: {
    type: Array as PropType<string[]>,
    default: undefined
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
  locale: {
    type: [Object, Function] as PropType<TigerLocaleInput>
  },
  labels: {
    type: Object as PropType<Partial<TigerLocaleTable>>
  },
  emptyText: {
    type: String,
    default: undefined
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
  responsiveMode: {
    type: String as PropType<TableResponsiveMode>,
    default: 'scroll' as TableResponsiveMode
  },
  cardBreakpoint: {
    type: String as PropType<TableCardBreakpoint>,
    default: 'sm' as TableCardBreakpoint
  },
  cardClassName: {
    type: [String, Function] as PropType<
      string | ((record: Record<string, unknown>, index: number) => string | undefined)
    >
  },
  renderCard: {
    type: Function as PropType<
      (context: TableCardRenderContext<Record<string, unknown>>) => unknown
    >
  },
  cardSelectionPosition: {
    type: String as PropType<TableCardSelectionPosition>,
    default: 'controls-row' as TableCardSelectionPosition
  },
  cardPadding: {
    type: [String, Boolean] as PropType<string | false>,
    default: undefined
  },
  cardFieldGap: {
    type: String,
    default: 'gap-3'
  },
  // --- v0.6.0 props ---
  virtual: { type: Boolean, default: false },
  autoVirtual: { type: Boolean, default: true },
  virtualHeight: { type: Number, default: 400 },
  virtualItemHeight: { type: Number, default: 40 },
  autoVirtualThreshold: { type: Number, default: 10000 },
  virtualThreshold: { type: Number, default: 1000 },
  editable: { type: Boolean, default: false },
  editableCells: { type: Object as PropType<Map<string, Set<number>>> },
  filterMode: { type: String as PropType<'basic' | 'advanced'>, default: 'basic' },
  advancedFilterRules: { type: Array as PropType<FilterRule[]>, default: () => [] },
  columnDraggable: { type: Boolean, default: false },
  rowDraggable: { type: Boolean, default: false },
  summaryRow: { type: Object as PropType<{ show: boolean; data: Record<string, unknown> }> },
  groupBy: { type: String },
  exportable: { type: Boolean, default: false },
  exportFormat: { type: String as PropType<'csv' | 'excel'>, default: 'csv' },
  exportFilename: { type: String, default: 'export' },
  cardLayout: {
    type: Array as PropType<TableCardLayoutItem[]>,
    default: undefined
  }
} as const

export const tableEmits = [
  'change',
  'row-click',
  'selection-change',
  'sort-change',
  'filter-change',
  'update:hiddenColumnKeys',
  'hidden-column-keys-change',
  'page-change',
  'expand-change',
  'cell-change',
  'column-order-change',
  'row-order-change',
  'export'
] as const

export type TableEmits = (typeof tableEmits)[number]
