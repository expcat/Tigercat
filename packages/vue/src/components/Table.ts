import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type VNodeChild
} from 'vue'
import {
  classNames,
  createTableResizeObserverController,
  formatTableSelectRowAriaLabel,
  formatTableSortByText,
  getCardColumns,
  getCardGridInfo,
  getImmediateTigerLocale,
  getTableLabels,
  getTableWrapperClasses,
  getTableResponsiveCardClasses,
  getTableResponsiveCardListClasses,
  getTableResponsiveTableClasses,
  getTableVirtualRecommendation,
  isLazyTigerLocale,
  mergeTigerLocale,
  resolveTigerLocale,
  tableBaseClasses,
  tableResponsiveCardLabelClasses,
  tableResponsiveCardRowClasses,
  tableResponsiveCardTitleClasses,
  tableResponsiveCardValueClasses,
  tableLoadingOverlayClasses,
  type TableColumn,
  type TigerLocale,
  type TigerLocaleInput
} from '@expcat/tigercat-core'
import { tableExportButtonClasses } from '@expcat/tigercat-core'

import { useTigerConfig } from './ConfigProvider'
import { Checkbox } from './Checkbox'
import { Empty } from './Empty'
import { Radio } from './Radio'
import { Select } from './Select'
import { tableEmits, tableProps, type VueTableProps } from './Table/props'
import { useTableState } from './Table/state'
import { LoadingSpinner } from './Table/icons'
import { renderTableHeader } from './Table/render-header'
import { renderTableBody } from './Table/render-body'
import { renderSummaryRow } from './Table/render-summary'
import { renderPagination } from './Table/render-pagination'
import type { TableInternalProps } from './Table/types'

export type { VueTableProps }

export const Table = defineComponent({
  name: 'TigerTable',
  props: tableProps,
  emits: tableEmits as unknown as string[],
  setup(props, { emit, slots }) {
    const config = useTigerConfig()
    const wrapperRef = ref<HTMLElement | null>(null)
    const tableRef = ref<HTMLTableElement | null>(null)
    const measuredColumnWidths = ref<Record<string, number>>({})
    const measuredRowHeights = ref<number[]>([])
    const ctx = useTableState(props as TableInternalProps, emit, measuredColumnWidths)
    const resolvedPaginationLocale = ref<Partial<TigerLocale> | undefined>()
    const resolvedTableLocale = ref<Partial<TigerLocale> | undefined>()
    let paginationLocaleResolveId = 0
    let tableLocaleResolveId = 0

    const paginationLocaleInput = computed<TigerLocaleInput | false | undefined>(() =>
      props.pagination !== false && typeof props.pagination === 'object'
        ? props.pagination.locale
        : undefined
    )
    const isPaginationI18nDisabled = computed(() => paginationLocaleInput.value === false)
    const tableLocaleInput = computed<TigerLocaleInput | undefined>(() => props.locale)

    watch(
      paginationLocaleInput,
      (locale) => {
        const resolveId = ++paginationLocaleResolveId

        if (!locale) {
          resolvedPaginationLocale.value = undefined
          return
        }

        const immediateLocale = getImmediateTigerLocale(locale)
        resolvedPaginationLocale.value = immediateLocale

        if (!isLazyTigerLocale(locale)) return

        resolveTigerLocale(locale)
          .then((nextLocale) => {
            if (resolveId === paginationLocaleResolveId) {
              resolvedPaginationLocale.value = nextLocale
            }
          })
          .catch(() => {
            if (resolveId === paginationLocaleResolveId) {
              resolvedPaginationLocale.value = immediateLocale
            }
          })
      },
      { immediate: true }
    )

    const paginationLocale = computed(() =>
      isPaginationI18nDisabled.value
        ? undefined
        : mergeTigerLocale(config.value.locale, resolvedPaginationLocale.value)
    )

    watch(
      tableLocaleInput,
      (locale) => {
        const resolveId = ++tableLocaleResolveId

        if (!locale) {
          resolvedTableLocale.value = undefined
          return
        }

        const immediateLocale = getImmediateTigerLocale(locale)
        resolvedTableLocale.value = immediateLocale

        if (!isLazyTigerLocale(locale)) return

        resolveTigerLocale(locale)
          .then((nextLocale) => {
            if (resolveId === tableLocaleResolveId) {
              resolvedTableLocale.value = nextLocale
            }
          })
          .catch(() => {
            if (resolveId === tableLocaleResolveId) {
              resolvedTableLocale.value = immediateLocale
            }
          })
      },
      { immediate: true }
    )

    const tableLocale = computed(() =>
      mergeTigerLocale(config.value.locale, resolvedTableLocale.value)
    )

    const tableLabels = computed(() => {
      const overrides =
        props.emptyText === undefined
          ? props.labels
          : { ...props.labels, emptyText: props.emptyText }
      return getTableLabels(tableLocale.value, overrides)
    })

    const cardLayoutMap = computed(() => {
      const map = new Map<string, any>()
      if (props.cardLayout) {
        for (const item of props.cardLayout) {
          map.set(item.key, item)
        }
      }
      return map
    })

    const hasCustomCardLayout = computed(() => {
      return (
        ctx.displayColumns.value.some((col) => col.cardGrid) ||
        (props.cardLayout && props.cardLayout.length > 0)
      )
    })

    const resizeController = createTableResizeObserverController({
      onResize: (snapshot) => {
        if (!areNumberRecordsEqual(measuredColumnWidths.value, snapshot.columnWidths)) {
          measuredColumnWidths.value = snapshot.columnWidths
        }
        if (!areNumberArraysEqual(measuredRowHeights.value, snapshot.rowHeights)) {
          measuredRowHeights.value = snapshot.rowHeights
        }
      }
    })

    onMounted(() => {
      if (wrapperRef.value) {
        resizeController.observe(wrapperRef.value, tableRef.value)
      }
    })

    onBeforeUnmount(() => resizeController.disconnect())

    return () => {
      const resolvedProps = props as TableInternalProps
      const virtualRecommendation = getTableVirtualRecommendation({
        virtual: resolvedProps.virtual,
        autoVirtual: resolvedProps.autoVirtual,
        dataLength: resolvedProps.dataSource.length,
        threshold: resolvedProps.virtualThreshold,
        autoThreshold: resolvedProps.autoVirtualThreshold
      })
      const effectiveVirtual = virtualRecommendation.enabled
      const wrapperStyle = resolvedProps.maxHeight
        ? {
            maxHeight:
              typeof resolvedProps.maxHeight === 'number'
                ? `${resolvedProps.maxHeight}px`
                : resolvedProps.maxHeight
          }
        : undefined

      const renderProps = {
        ...resolvedProps,
        emptyText: tableLabels.value.emptyText
      } as TableInternalProps

      const tableChildren = [
        renderTableHeader(ctx, renderProps, slots),
        renderTableBody(ctx, renderProps, slots),
        renderSummaryRow(ctx, renderProps)
      ]

      const tableInner = h(
        'table',
        {
          ref: tableRef,
          class: classNames(
            tableBaseClasses,
            getTableResponsiveTableClasses(
              resolvedProps.responsiveMode,
              resolvedProps.cardBreakpoint
            ),
            resolvedProps.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
          ),
          style:
            ctx.fixedColumnsInfo.value.hasFixedColumns && ctx.fixedColumnsInfo.value.minTableWidth
              ? { minWidth: `${ctx.fixedColumnsInfo.value.minTableWidth}px` }
              : undefined
        },
        tableChildren
      )

      const tableContent = effectiveVirtual
        ? h(
            'div',
            {
              style: { height: `${resolvedProps.virtualHeight}px`, overflow: 'auto' },
              onScroll: (e: Event) => {
                ctx.virtualScrollTop.value = (e.target as HTMLElement).scrollTop
              }
            },
            [tableInner]
          )
        : tableInner

      const cardContent = (() => {
        if (resolvedProps.responsiveMode !== 'card') return null

        const cardChildren: VNodeChild[] = []
        const sortableColumns = ctx.displayColumns.value.filter((column) => column.sortable)

        if (
          resolvedProps.rowSelection &&
          resolvedProps.rowSelection.type !== 'radio' &&
          resolvedProps.rowSelection.showCheckbox !== false &&
          ctx.paginatedData.value.length > 0
        ) {
          cardChildren.push(
            h(
              'div',
              {
                class:
                  'flex items-center justify-between rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] px-3 py-2'
              },
              [
                h(
                  Checkbox,
                  {
                    size: 'sm',
                    modelValue: ctx.allSelected.value,
                    indeterminate: ctx.someSelected.value,
                    onChange: (checked: boolean) => ctx.handleSelectAll(checked)
                  },
                  { default: () => tableLabels.value.selectAllText }
                )
              ]
            )
          )
        }

        if (sortableColumns.length > 0) {
          cardChildren.push(
            h(
              'div',
              {
                class:
                  'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] px-3 py-2'
              },
              [
                h(Select, {
                  size: 'sm',
                  modelValue:
                    ctx.sortState.value.key && ctx.sortState.value.direction
                      ? `${ctx.sortState.value.key}:${ctx.sortState.value.direction}`
                      : '',
                  options: [
                    { label: tableLabels.value.clearSortText, value: '' },
                    ...sortableColumns.flatMap((column) => [
                      {
                        label: `${formatTableSortByText(tableLabels.value.sortByText, column.title)} ↑`,
                        value: `${column.key}:asc`
                      },
                      {
                        label: `${formatTableSortByText(tableLabels.value.sortByText, column.title)} ↓`,
                        value: `${column.key}:desc`
                      }
                    ])
                  ],
                  clearable: false,
                  'onUpdate:modelValue': (value: string | number | undefined) => {
                    const nextValue = String(value ?? '')
                    if (!nextValue) {
                      ctx.handleSetSort({ key: null, direction: null })
                      return
                    }
                    const separatorIndex = nextValue.lastIndexOf(':')
                    const key = nextValue.slice(0, separatorIndex)
                    const direction = nextValue.slice(separatorIndex + 1) as 'asc' | 'desc'
                    ctx.handleSetSort({ key, direction })
                  }
                })
              ]
            )
          )
        }

        if (ctx.paginatedData.value.length === 0) {
          cardChildren.push(
            h('div', { class: getTableResponsiveCardClasses(resolvedProps.cardPadding) }, [
              h(Empty, { showImage: false, description: tableLabels.value.emptyText })
            ])
          )
        } else {
          cardChildren.push(
            ...ctx.paginatedData.value.map((record, index) => {
              const key = ctx.paginatedRowKeys.value[index]
              const isExpanded = ctx.expandedRowKeySet.value.has(key)
              const isSelected = ctx.selectedRowKeySet.value.has(key)
              const isRowExpandable = resolvedProps.expandable
                ? resolvedProps.expandable.rowExpandable
                  ? resolvedProps.expandable.rowExpandable(record)
                  : true
                : false

              const { titleColumn, bodyColumns } = getCardColumns(ctx.displayColumns.value)
              const renderCardCellContent = (column: TableColumn) => {
                const dataKey = column.dataKey || column.key
                return (
                  slots[`cell-${column.key}`]?.({ record, index }) ??
                  (column.render
                    ? (column.render(record, index) as string)
                    : (record[dataKey] as string))
                )
              }

              const titleNode = titleColumn
                ? h('div', { class: tableResponsiveCardTitleClasses }, [
                    renderCardCellContent(titleColumn)
                  ])
                : null

              const rows = hasCustomCardLayout.value
                ? [
                    h(
                      'div',
                      {
                        class: classNames(
                          'grid grid-cols-12 mt-2',
                          resolvedProps.cardFieldGap ?? 'gap-3'
                        )
                      },
                      bodyColumns.map((column) => {
                        const layoutItem = cardLayoutMap.value.get(column.key)
                        const gridInfo = getCardGridInfo(column, layoutItem)

                        if (gridInfo.hideLabel) {
                          return h(
                            'div',
                            {
                              key: column.key,
                              class: classNames(
                                gridInfo.className,
                                gridInfo.divider &&
                                  'border-t border-[var(--tiger-border,#e5e7eb)] pt-3'
                              )
                            },
                            [renderCardCellContent(column)]
                          )
                        }

                        if (gridInfo.labelPosition === 'top') {
                          return h(
                            'div',
                            {
                              key: column.key,
                              class: classNames(
                                gridInfo.className,
                                gridInfo.divider &&
                                  'border-t border-[var(--tiger-border,#e5e7eb)] pt-3'
                              )
                            },
                            [
                              h(
                                'div',
                                {
                                  class: classNames(
                                    'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-muted,#6b7280)] mb-1',
                                    gridInfo.labelClassName
                                  )
                                },
                                column.title
                              ),
                              h(
                                'div',
                                {
                                  class: classNames(
                                    'min-w-0 text-sm text-[var(--tiger-text,#111827)] break-words',
                                    gridInfo.valueClassName
                                  )
                                },
                                [renderCardCellContent(column)]
                              )
                            ]
                          )
                        }

                        return h(
                          'div',
                          {
                            key: column.key,
                            class: classNames(
                              gridInfo.className,
                              'grid grid-cols-[auto_1fr] gap-2 items-baseline',
                              gridInfo.divider &&
                                'border-t border-[var(--tiger-border,#e5e7eb)] pt-3'
                            )
                          },
                          [
                            h(
                              'div',
                              {
                                class: classNames(
                                  'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-muted,#6b7280)] shrink-0',
                                  gridInfo.labelClassName
                                )
                              },
                              column.title
                            ),
                            h(
                              'div',
                              {
                                class: classNames(
                                  'min-w-0 text-sm text-[var(--tiger-text,#111827)] break-words',
                                  gridInfo.valueClassName
                                )
                              },
                              [renderCardCellContent(column)]
                            )
                          ]
                        )
                      })
                    )
                  ]
                : bodyColumns.map((column) =>
                    h('div', { key: column.key, class: tableResponsiveCardRowClasses }, [
                      h('div', { class: tableResponsiveCardLabelClasses }, column.title),
                      h('div', { class: tableResponsiveCardValueClasses }, [
                        renderCardCellContent(column)
                      ])
                    ])
                  )

              const controls = []
              if (resolvedProps.rowSelection && resolvedProps.rowSelection.showCheckbox !== false) {
                const checkboxProps = resolvedProps.rowSelection.getCheckboxProps?.(record) || {}
                controls.push(
                  h('span', { onClick: (event: Event) => event.stopPropagation() }, [
                    resolvedProps.rowSelection.type === 'radio'
                      ? h(Radio, {
                          value: key,
                          checked: isSelected,
                          disabled: checkboxProps.disabled,
                          'aria-label': formatTableSelectRowAriaLabel(
                            tableLabels.value.selectRowAriaLabel,
                            index + 1,
                            tableLocale.value?.locale
                          ),
                          onChange: () => ctx.handleSelectRow(key, true)
                        })
                      : h(Checkbox, {
                          size: 'sm',
                          modelValue: isSelected,
                          disabled: checkboxProps.disabled,
                          'aria-label': formatTableSelectRowAriaLabel(
                            tableLabels.value.selectRowAriaLabel,
                            index + 1,
                            tableLocale.value?.locale
                          ),
                          onChange: (checked: boolean) => ctx.handleSelectRow(key, checked)
                        })
                  ])
                )
              }
              if (resolvedProps.expandable && isRowExpandable) {
                controls.push(
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'text-sm text-[var(--tiger-primary,#2563eb)]',
                      'aria-expanded': isExpanded,
                      onClick: (event: Event) => {
                        event.stopPropagation()
                        ctx.handleToggleExpand(key, record)
                      }
                    },
                    isExpanded ? tableLabels.value.collapseText : tableLabels.value.expandText
                  )
                )
              }

              const titleWithInlineControls =
                titleNode &&
                resolvedProps.cardSelectionPosition === 'title-inline' &&
                controls.length
                  ? h(
                      'div',
                      {
                        class: classNames(
                          tableResponsiveCardTitleClasses,
                          'flex items-center gap-3'
                        )
                      },
                      [
                        ...controls,
                        h('span', { class: 'min-w-0 flex-1' }, [
                          renderCardCellContent(titleColumn!)
                        ])
                      ]
                    )
                  : titleNode

              const expandedContent =
                resolvedProps.expandable && isExpanded && isRowExpandable
                  ? (slots['expanded-row']?.({ record, index }) ??
                    resolvedProps.expandable.expandedRowRender?.(record, index))
                  : null

              const cardContext = {
                record,
                index,
                columns: ctx.displayColumns.value,
                selected: isSelected,
                expanded: isExpanded,
                toggleExpand: () => ctx.handleToggleExpand(key, record),
                selectRow: (checked: boolean) => ctx.handleSelectRow(key, checked)
              }
              const customCard =
                slots.card?.(cardContext) ?? resolvedProps.renderCard?.(cardContext)
              const resolvedCardClassName =
                typeof resolvedProps.cardClassName === 'function'
                  ? resolvedProps.cardClassName(record, index)
                  : resolvedProps.cardClassName

              return h(
                'div',
                {
                  key,
                  class: classNames(
                    getTableResponsiveCardClasses(resolvedProps.cardPadding),
                    resolvedCardClassName
                  ),
                  onClick: () => ctx.handleRowClick(record, index, key)
                },
                customCard !== undefined && customCard !== null
                  ? [customCard as VNodeChild]
                  : [
                      controls.length &&
                      (!titleNode || resolvedProps.cardSelectionPosition !== 'title-inline')
                        ? h('div', { class: 'mb-2 flex items-center gap-3' }, controls)
                        : null,
                      titleWithInlineControls,
                      ...rows,
                      expandedContent
                        ? h(
                            'div',
                            {
                              class: 'mt-3 border-t border-[var(--tiger-border,#e5e7eb)] pt-3'
                            },
                            [expandedContent as VNodeChild]
                          )
                        : null
                    ]
              )
            })
          )
        }

        return h(
          'div',
          {
            class: getTableResponsiveCardListClasses(resolvedProps.cardBreakpoint),
            'data-tiger-table-mobile': 'card'
          },
          cardChildren
        )
      })()

      return h(
        'div',
        {
          ref: wrapperRef,
          class: getTableWrapperClasses(resolvedProps.bordered, resolvedProps.maxHeight),
          style: wrapperStyle,
          'data-tiger-virtual': virtualRecommendation.enabled ? 'enabled' : undefined,
          'data-tiger-virtual-auto': virtualRecommendation.autoEnabled ? 'true' : undefined,
          'data-tiger-virtual-recommended': virtualRecommendation.recommended ? 'true' : undefined,
          'data-tiger-virtual-threshold': virtualRecommendation.recommended
            ? virtualRecommendation.threshold
            : undefined,
          'data-tiger-measured-row-height': measuredRowHeights.value[0] || undefined,
          'aria-busy': resolvedProps.loading
        },
        [
          resolvedProps.exportable &&
            h('div', { class: 'flex justify-end p-2' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: tableExportButtonClasses,
                  onClick: ctx.handleExport,
                  'aria-label':
                    resolvedProps.exportFormat === 'excel' ? 'Export to Excel' : 'Export to CSV'
                },
                resolvedProps.exportFormat === 'excel' ? 'Export Excel' : 'Export CSV'
              )
            ]),

          tableContent,
          cardContent,

          resolvedProps.loading &&
            h(
              'div',
              {
                class: tableLoadingOverlayClasses,
                role: 'status',
                'aria-live': 'polite',
                'aria-label': tableLabels.value.loadingText
              },
              [LoadingSpinner(), h('span', { class: 'sr-only' }, tableLabels.value.loadingText)]
            ),

          renderPagination(ctx, renderProps, {
            locale: paginationLocale.value,
            disableI18n: isPaginationI18nDisabled.value
          })
        ]
      )
    }
  }
})

export default Table

function areNumberRecordsEqual(
  current: Record<string, number>,
  next: Record<string, number>
): boolean {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  return (
    currentKeys.length === nextKeys.length && nextKeys.every((key) => current[key] === next[key])
  )
}

function areNumberArraysEqual(current: number[], next: number[]): boolean {
  return current.length === next.length && next.every((value, index) => current[index] === value)
}
