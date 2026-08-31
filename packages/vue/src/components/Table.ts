import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type VNodeChild
} from 'vue'
import {
  classNames,
  canUseTableVirtualWindow,
  createTableResizeObserverController,
  formatTableSelectRowAriaLabel,
  formatTableSortByText,
  getCardColumns,
  getCardGridInfo,
  getTableColgroup,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableExportBarClasses,
  getImmediateTigerLocale,
  getTableLabels,
  getTableWrapperClasses,
  getTableResponsiveCardClasses,
  getTableResponsiveTableClasses,
  getTableVirtualRecommendation,
  getTableVirtualWindow,
  getTableCardSortValue,
  parseTableCardSortValue,
  subscribeTableCardViewport,
  TABLE_CARD_SORT_NONE,
  tableCardListVisibleClasses,
  isActivationKey,
  isLazyTigerLocale,
  mergeTigerLocale,
  resolveTigerLocale,
  tableBaseClasses,
  tableResponsiveCardLabelClasses,
  tableResponsiveCardRowClasses,
  tableResponsiveCardTitleClasses,
  tableResponsiveCardValueClasses,
  tableLoadingOverlayClasses,
  type TableCardLayoutItem,
  type TableColumn,
  type TigerLocale,
  type TigerLocaleInput
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Button } from './Button'
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

export type { VueTableProps, VueTableProps as TableProps }

export const Table = defineComponent({
  name: 'TigerTable',
  props: tableProps,
  emits: tableEmits as unknown as string[],
  setup(props, { emit, slots }) {
    const config = useTigerConfig()
    const instance = getCurrentInstance()
    const wrapperRef = ref<HTMLElement | null>(null)
    const tableRef = ref<HTMLTableElement | null>(null)
    const measuredColumnWidths = ref<Record<string, number>>({})
    const measuredRowHeights = ref<Record<number, number>>({})
    const measuredContainerSize = ref({ width: 0, height: 0 })
    const isCardViewport = ref(false)
    const selectionGroupName = useId()
    let stopCardViewport: (() => void) | undefined
    const ctx = useTableState(
      props as TableInternalProps,
      emit,
      measuredColumnWidths,
      measuredContainerSize
    )
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
      const map = new Map<string, TableCardLayoutItem>()
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
        if (!areNumberRecordsEqual(measuredRowHeights.value, snapshot.rowHeights)) {
          measuredRowHeights.value = snapshot.rowHeights
        }
        const nextSize = { width: snapshot.containerWidth, height: snapshot.containerHeight }
        if (
          measuredContainerSize.value.width !== nextSize.width ||
          measuredContainerSize.value.height !== nextSize.height
        ) {
          measuredContainerSize.value = nextSize
        }
      }
    })

    const shouldObserveGeometry = computed(() => {
      const resolvedProps = props as TableInternalProps
      const virtualRecommendation = getTableVirtualRecommendation({
        virtual: resolvedProps.virtual,
        autoVirtual: resolvedProps.autoVirtual,
        dataLength: ctx.processedData.value.length,
        threshold: resolvedProps.virtualThreshold
      })
      return (
        virtualRecommendation.enabled ||
        resolvedProps.columnLockable ||
        ctx.displayColumns.value.some(
          (column) => column.fixed === 'left' || column.fixed === 'right'
        )
      )
    })

    function attachResizeObserver() {
      resizeController.disconnect()
      if (!shouldObserveGeometry.value || !wrapperRef.value) return
      resizeController.observe(wrapperRef.value, tableRef.value)
    }

    watch(
      [
        shouldObserveGeometry,
        () => ctx.displayColumns.value.length,
        () => ctx.paginatedData.value.length
      ],
      () => attachResizeObserver()
    )

    onMounted(() => attachResizeObserver())

    watch(
      () =>
        [props.responsiveMode, props.cardBreakpoint] as [
          TableInternalProps['responsiveMode'],
          TableInternalProps['cardBreakpoint']
        ],
      ([mode, breakpoint]) => {
        stopCardViewport?.()
        if (mode !== 'card') {
          isCardViewport.value = false
          stopCardViewport = undefined
          return
        }
        stopCardViewport = subscribeTableCardViewport(breakpoint, (next) => {
          isCardViewport.value = next
        })
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      stopCardViewport?.()
      resizeController.disconnect()
    })

    return () => {
      const resolvedProps = props as TableInternalProps
      const virtualRecommendation = getTableVirtualRecommendation({
        virtual: resolvedProps.virtual,
        autoVirtual: resolvedProps.autoVirtual,
        dataLength: ctx.processedData.value.length,
        threshold: resolvedProps.virtualThreshold
      })
      const virtualAllowed = canUseTableVirtualWindow({
        expandable: resolvedProps.expandable,
        groupBy: resolvedProps.groupBy
      })
      const effectiveVirtual = virtualRecommendation.enabled && virtualAllowed
      const showCardTree = resolvedProps.responsiveMode === 'card' && isCardViewport.value
      const showTableTree = !showCardTree
      const wrapperStyle = resolvedProps.maxHeight
        ? {
            maxHeight:
              typeof resolvedProps.maxHeight === 'number'
                ? `${resolvedProps.maxHeight}px`
                : resolvedProps.maxHeight
          }
        : undefined

      const measuredItemHeight = Object.values(measuredRowHeights.value)[0]
      const virtualWindow = effectiveVirtual
        ? getTableVirtualWindow(
            ctx.virtualScrollTop.value,
            measuredContainerSize.value.height > 0
              ? measuredContainerSize.value.height
              : typeof resolvedProps.virtualHeight === 'number'
                ? resolvedProps.virtualHeight
                : 400,
            measuredItemHeight > 0 ? measuredItemHeight : resolvedProps.virtualItemHeight,
            ctx.paginatedData.value.length
          )
        : undefined

      const renderProps = {
        ...resolvedProps,
        emptyText: tableLabels.value.emptyText,
        // Rows become keyboard-activable when a row-click listener is bound or
        // row selection is enabled (mirrors React's onRowClick/rowSelection).
        interactiveRows:
          !!resolvedProps.rowSelection || typeof instance?.vnode.props?.onRowClick === 'function',
        virtualWindow,
        selectionName: selectionGroupName
      } as TableInternalProps & {
        virtualWindow?: ReturnType<typeof getTableVirtualWindow>
        selectionName?: string
      }

      const shouldPinColumns =
        resolvedProps.columnLockable || ctx.fixedColumnsInfo.value.hasFixedColumns
      const colgroup = shouldPinColumns
        ? h(
            'colgroup',
            getTableColgroup({
              columns: ctx.displayColumns.value,
              frozenWidths: ctx.frozenColumnWidths.value,
              size: resolvedProps.size,
              hasSelectionColumn: hasTableSelectionColumn(resolvedProps.rowSelection),
              expand: resolveTableExpandSlot(resolvedProps.expandable)
            }).map((entry, index) =>
              h('col', {
                key: `${entry.key}-${index}`,
                style: entry.width ? { width: entry.width } : undefined
              })
            )
          )
        : null

      const tableChildren = [
        colgroup,
        renderTableHeader(ctx, renderProps, slots, tableLabels.value),
        renderTableBody(ctx, renderProps, slots, tableLabels.value),
        renderSummaryRow(ctx, renderProps)
      ]

      const tableInner = h(
        'table',
        {
          ref: tableRef,
          class: classNames(
            tableBaseClasses,
            resolvedProps.responsiveMode === 'scroll'
              ? getTableResponsiveTableClasses(
                  resolvedProps.responsiveMode,
                  resolvedProps.cardBreakpoint
                )
              : undefined,
            resolvedProps.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
          ),
          style:
            ctx.fixedColumnsInfo.value.hasFixedColumns && ctx.fixedColumnsInfo.value.minTableWidth
              ? { minWidth: `${ctx.fixedColumnsInfo.value.minTableWidth}px` }
              : undefined
        },
        tableChildren
      )

      const virtualScrollerStyle = {
        height:
          typeof resolvedProps.virtualHeight === 'number'
            ? `${resolvedProps.virtualHeight}px`
            : resolvedProps.virtualHeight,
        overflow: 'auto'
      }
      const onVirtualScroll = (e: Event) => {
        ctx.virtualScrollTop.value = (e.target as HTMLElement).scrollTop
      }

      const tableContent =
        showTableTree &&
        (effectiveVirtual
          ? h(
              'div',
              {
                style: virtualScrollerStyle,
                onScroll: onVirtualScroll
              },
              [tableInner]
            )
          : tableInner)

      const cardContent = (() => {
        if (!showCardTree) return null

        const cardChildren: VNodeChild[] = []
        const sortableColumns = ctx.displayColumns.value.filter((column) => column.sortable)

        if (
          resolvedProps.rowSelection &&
          resolvedProps.rowSelection.type !== 'radio' &&
          resolvedProps.rowSelection.showCheckbox !== false &&
          !resolvedProps.loading &&
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
                  'aria-label': tableLabels.value.sortMenuAriaLabel,
                  modelValue: getTableCardSortValue(ctx.sortState.value),
                  options: [
                    { label: tableLabels.value.clearSortText, value: TABLE_CARD_SORT_NONE },
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
                    ctx.handleSetSort(parseTableCardSortValue(value))
                  }
                })
              ]
            )
          )
        }

        if (resolvedProps.loading) {
          // Data is hidden under the overlay, matching table tbody.
        } else if (ctx.paginatedData.value.length === 0) {
          cardChildren.push(
            h('div', { class: getTableResponsiveCardClasses(resolvedProps.cardPadding) }, [
              h(Empty, { showImage: false, description: tableLabels.value.emptyText })
            ])
          )
        } else {
          const cardStart = effectiveVirtual && virtualWindow ? virtualWindow.startIndex : 0
          const cardEnd =
            effectiveVirtual && virtualWindow
              ? virtualWindow.endIndex + 1
              : ctx.paginatedData.value.length
          if (effectiveVirtual && virtualWindow && virtualWindow.topPad > 0) {
            cardChildren.push(
              h('div', {
                'aria-hidden': 'true',
                style: { height: `${virtualWindow.topPad}px` }
              })
            )
          }
          cardChildren.push(
            ...ctx.paginatedData.value.slice(cardStart, cardEnd).map((record, offset) => {
              const index = cardStart + offset
              const sourceIndex = ctx.pageSourceIndices.value[index] ?? index
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
                  slots[`cell-${column.key}`]?.({ record, index: sourceIndex }) ??
                  (column.render
                    ? (column.render(record, sourceIndex) as string)
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
                          name: selectionGroupName,
                          value: key,
                          modelValue: isSelected,
                          disabled: checkboxProps.disabled,
                          'aria-label': formatTableSelectRowAriaLabel(
                            tableLabels.value.selectRowAriaLabel,
                            sourceIndex + 1,
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
                            sourceIndex + 1,
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
                  ? (slots['expanded-row']?.({ record, index: sourceIndex }) ??
                    resolvedProps.expandable.expandedRowRender?.(record, sourceIndex))
                  : null

              const cardContext = {
                record,
                index: sourceIndex,
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
                  ? resolvedProps.cardClassName(record, sourceIndex)
                  : resolvedProps.cardClassName

              const hasCardControls = controls.length > 0
              const cardInteractive =
                !!resolvedProps.rowSelection ||
                typeof instance?.vnode.props?.onRowClick === 'function'

              return h(
                'div',
                {
                  key,
                  class: classNames(
                    getTableResponsiveCardClasses(resolvedProps.cardPadding),
                    resolvedCardClassName
                  ),
                  tabindex: cardInteractive && !hasCardControls ? 0 : undefined,
                  onClick: () => ctx.handleRowClick(record, sourceIndex, key),
                  onKeydown:
                    cardInteractive && !hasCardControls
                      ? (event: KeyboardEvent) => {
                          if (event.target !== event.currentTarget) return
                          if (isActivationKey(event)) {
                            event.preventDefault()
                            ctx.handleRowClick(record, sourceIndex, key)
                          }
                        }
                      : undefined
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
          if (effectiveVirtual && virtualWindow && virtualWindow.bottomPad > 0) {
            cardChildren.push(
              h('div', {
                'aria-hidden': 'true',
                style: { height: `${virtualWindow.bottomPad}px` }
              })
            )
          }
        }

        return h(
          'div',
          {
            class: tableCardListVisibleClasses,
            'data-tiger-table-mobile': 'card',
            style: effectiveVirtual ? virtualScrollerStyle : undefined,
            onScroll: effectiveVirtual ? onVirtualScroll : undefined
          },
          cardChildren
        )
      })()

      return h(
        'div',
        {
          ref: wrapperRef,
          class: getTableWrapperClasses(
            resolvedProps.bordered,
            resolvedProps.maxHeight,
            !effectiveVirtual
          ),
          style: wrapperStyle,
          'data-tiger-virtual': effectiveVirtual ? 'enabled' : undefined,
          'data-tiger-virtual-recommended': virtualRecommendation.recommended ? 'true' : undefined,
          'data-tiger-virtual-threshold': virtualRecommendation.recommended
            ? virtualRecommendation.threshold
            : undefined,
          'data-tiger-measured-row-height': Object.values(measuredRowHeights.value)[0] || undefined,
          'data-tiger-table-layout': showCardTree ? 'card' : 'table',
          'aria-busy': resolvedProps.loading
        },
        [
          resolvedProps.exportable &&
            h('div', { class: tableExportBarClasses }, [
              h(
                Button,
                {
                  type: 'button',
                  variant: 'secondary',
                  size: 'sm',
                  onClick: ctx.handleExport,
                  'aria-label': tableLabels.value.exportCsvAriaLabel
                },
                { default: () => tableLabels.value.exportCsvText }
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
  current: Record<string | number, number>,
  next: Record<string | number, number>
): boolean {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  return (
    currentKeys.length === nextKeys.length && nextKeys.every((key) => current[key] === next[key])
  )
}
