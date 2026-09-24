import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
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
  formatTableSelectionCount,
  formatTableSortAnnouncement,
  formatTableSortByText,
  manageLiveRegion,
  tableRowKeyId,
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
  devWarn,
  getTableVirtualRecommendation,
  getTableVirtualWindow,
  resolveScrollportViewport,
  virtualizeMiddleColumns,
  parseWidthToPx,
  cardVirtualWindow,
  nextGridCell,
  resolveTableKeyboardMode,
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
import { useTigerConfig } from './tiger-config'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Empty } from './Empty'
import { Radio } from './Radio'
import { Select } from './Select'
import { tableEmits, tableProps, type VueTableProps } from './Table/props'
import { useTableState } from './Table/state'
import { Loading } from './Loading'
import { renderTableHeader } from './Table/render-header'
import { renderTableBody } from './Table/render-body'
import { renderSummaryRow } from './Table/render-summary'
import { renderPagination } from './Table/render-pagination'
import { TableW9Panel } from './Table/w9-panel'
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
    const virtualScrollerRef = ref<HTMLElement | null>(null)
    const virtualClientHeight = ref(0)
    const columnScrollLeft = ref(0)
    const uncontrolledCardViewport = ref(false)
    const activeRowIndex = ref(0)
    const gridCell = ref({ row: 0, column: 0 })
    const cardViewportControlled = computed(() => props.cardViewport !== undefined)
    const isCardViewport = computed(() =>
      cardViewportControlled.value ? Boolean(props.cardViewport) : uncontrolledCardViewport.value
    )
    const selectionGroupName = useId()
    let stopCardViewport: (() => void) | undefined
    const sortLocale = ref<string | undefined>(undefined)
    const ctx = useTableState(
      props as TableInternalProps,
      emit,
      measuredColumnWidths,
      measuredContainerSize,
      sortLocale
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
    watch(
      tableLocale,
      (locale) => {
        sortLocale.value = locale?.locale
      },
      { immediate: true }
    )

    const tableLabels = computed(() => {
      const overrides =
        props.emptyText === undefined
          ? props.labels
          : { ...props.labels, emptyText: props.emptyText }
      return getTableLabels(tableLocale.value, overrides)
    })

    const liveRegion = manageLiveRegion('polite')
    const announced = ref<{ count: number; sort: string } | null>(null)
    watch(
      () =>
        [
          ctx.selectedRowKeySet.value.size,
          ctx.sortState.value.key,
          ctx.sortState.value.direction
        ] as const,
      ([count, key, direction]) => {
        const sort = `${key ?? ''}:${direction ?? ''}`
        const previous = announced.value
        announced.value = { count, sort }
        if (!previous) return
        if (previous.count !== count) {
          liveRegion.announce(
            formatTableSelectionCount(
              tableLabels.value.selectionCountText,
              count,
              tableLocale.value?.locale
            )
          )
        }
        if (previous.sort !== sort && key && direction) {
          const column = ctx.displayColumns.value.find((item) => item.key === key)
          liveRegion.announce(
            formatTableSortAnnouncement(
              tableLabels.value.sortAnnouncementText,
              String(column?.title ?? key),
              direction === 'asc'
                ? tableLabels.value.sortAscendingText
                : tableLabels.value.sortDescendingText
            )
          )
        }
      }
    )
    onBeforeUnmount(() => liveRegion.destroy())

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
        const scroller = virtualScrollerRef.value
        if (scroller && virtualClientHeight.value !== scroller.clientHeight) {
          virtualClientHeight.value = scroller.clientHeight
        }
      }
    })

    const shouldObserveGeometry = computed(() => {
      const resolvedProps = props as TableInternalProps
      const virtualRecommendation = getTableVirtualRecommendation({
        virtual: resolvedProps.virtual,
        autoVirtual: resolvedProps.autoVirtual,
        dataLength: ctx.paginatedData.value.length,
        threshold: resolvedProps.virtualThreshold
      })
      return (
        virtualRecommendation.enabled ||
        resolvedProps.columnLockable ||
        ctx.displayColumns.value.some(
          (column) => column.fixed === 'start' || column.fixed === 'end'
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
      () => props.scrollToIndex,
      (index) => {
        if (typeof index !== 'number' || !virtualScrollerRef.value) return
        const top = Math.max(0, index) * props.virtualItemHeight
        virtualScrollerRef.value.scrollTop = top
        ctx.virtualScrollTop.value = top
      }
    )

    watch(
      () => ctx.currentPage.value,
      () => {
        ctx.virtualScrollTop.value = 0
        if (virtualScrollerRef.value) virtualScrollerRef.value.scrollTop = 0
      }
    )

    onUpdated(() => {
      const scroller = virtualScrollerRef.value
      if (!scroller) return
      if (virtualClientHeight.value !== scroller.clientHeight) {
        virtualClientHeight.value = scroller.clientHeight
      }
    })

    function subscribeCardViewport() {
      stopCardViewport?.()
      stopCardViewport = undefined
      if (cardViewportControlled.value || props.responsiveMode !== 'card') {
        if (!cardViewportControlled.value) uncontrolledCardViewport.value = false
        return
      }
      stopCardViewport = subscribeTableCardViewport(props.cardBreakpoint, (next) => {
        uncontrolledCardViewport.value = next
      })
    }
    subscribeCardViewport()
    onMounted(() => subscribeCardViewport())
    watch(
      () => [props.responsiveMode, props.cardBreakpoint, props.cardViewport] as const,
      () => {
        if (!cardViewportControlled.value && props.responsiveMode !== 'card') {
          uncontrolledCardViewport.value = false
        }
        subscribeCardViewport()
      }
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
        dataLength: ctx.paginatedData.value.length,
        threshold: resolvedProps.virtualThreshold
      })
      const virtualAllowed = canUseTableVirtualWindow({
        expandable: resolvedProps.expandable,
        groupBy: resolvedProps.groupBy
      })
      if (virtualRecommendation.enabled && !virtualAllowed) {
        devWarn(
          'Table.virtual',
          'Table virtual window is off because expanded rows or groups do not have one fixed height'
        )
      }
      const declaredRowHeight = resolvedProps.virtualItemHeight
      const unevenRows = Object.values(measuredRowHeights.value).some(
        (height) => Math.abs(height - declaredRowHeight) > 1
      )
      if (virtualRecommendation.enabled && virtualAllowed && unevenRows) {
        devWarn(
          'Table.virtual.rowHeight',
          'Table virtual window is off because a measured row does not match virtualItemHeight'
        )
      }
      const showCardTree = resolvedProps.responsiveMode === 'card' && isCardViewport.value
      const showTableTree = !showCardTree
      const virtualViewport = resolveScrollportViewport(
        virtualClientHeight.value,
        typeof resolvedProps.virtualHeight === 'number' ? resolvedProps.virtualHeight : 0
      )
      const pageFits =
        virtualViewport > 0 && ctx.paginatedData.value.length * declaredRowHeight <= virtualViewport
      const effectiveVirtual =
        virtualRecommendation.enabled && virtualAllowed && !unevenRows && !pageFits && !showCardTree
      const wrapperStyle = resolvedProps.maxHeight
        ? {
            maxHeight:
              typeof resolvedProps.maxHeight === 'number'
                ? `${resolvedProps.maxHeight}px`
                : resolvedProps.maxHeight
          }
        : undefined

      const virtualWindow = effectiveVirtual
        ? getTableVirtualWindow(
            ctx.virtualScrollTop.value,
            virtualViewport,
            declaredRowHeight,
            ctx.paginatedData.value.length
          )
        : undefined
      const columnSlice = virtualizeMiddleColumns({
        columns: ctx.displayColumns.value,
        widths: ctx.displayColumns.value.map((column) => parseWidthToPx(column.width)),
        scrollLeft: columnScrollLeft.value,
        viewportWidth: typeof resolvedProps.width === 'number' ? resolvedProps.width : 0,
        overscan: resolvedProps.overscan,
        enabled: resolvedProps.virtualizeColumns
      })
      const renderedColumns = columnSlice.active
        ? [...columnSlice.start, ...columnSlice.middle, ...columnSlice.end]
        : undefined

      const renderProps = {
        ...resolvedProps,
        emptyText: tableLabels.value.emptyText,
        // Rows become keyboard-activable when a row-click listener is bound or
        // row selection is enabled (mirrors React's onRowClick/rowSelection).
        interactiveRows:
          !!resolvedProps.rowSelection || typeof instance?.vnode.props?.onRowClick === 'function',
        virtualWindow,
        renderedColumns,
        selectionName: selectionGroupName,
        activeRowIndex: activeRowIndex.value,
        onActiveRowIndex: (index: number) => {
          activeRowIndex.value = index
        }
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
          'aria-label': resolvedProps.ariaLabel || tableLabels.value.tableAriaLabel,
          'aria-rowcount': resolvedProps.virtual
            ? String(ctx.paginatedData.value.length + 1)
            : undefined,
          'aria-colcount': resolvedProps.virtualizeColumns
            ? String(ctx.displayColumns.value.length)
            : undefined,
          'data-keyboard-mode': resolvedProps.grid ? resolveTableKeyboardMode(true) : undefined,
          'data-grid-cell': resolvedProps.grid
            ? `${gridCell.value.row}-${gridCell.value.column}`
            : undefined,
          tabindex: resolvedProps.grid ? 0 : undefined,
          onKeydown: resolvedProps.grid
            ? (event: KeyboardEvent) => {
                const next = nextGridCell({
                  row: gridCell.value.row,
                  column: gridCell.value.column,
                  rowCount: ctx.paginatedData.value.length,
                  columnCount: ctx.displayColumns.value.length,
                  key: event.key
                })
                if (!next || next === undefined) return
                if (!event.key.startsWith('Arrow')) return
                event.preventDefault()
                gridCell.value = next
              }
            : undefined,
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
        const target = e.target as HTMLElement
        ctx.virtualScrollTop.value = target.scrollTop
        columnScrollLeft.value = target.scrollLeft
      }

      const tableContent =
        showTableTree &&
        (effectiveVirtual
          ? h(
              'div',
              {
                ref: virtualScrollerRef,
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
                  'flex items-center justify-between rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2'
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
                  'rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2'
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

        const cardHeightWindow = cardVirtualWindow({
          scrollTop: ctx.virtualScrollTop.value,
          viewportHeight: virtualClientHeight.value || 240,
          cardHeight: resolvedProps.cardItemHeight,
          variable: false,
          count: ctx.paginatedData.value.length
        })

        if (resolvedProps.loading) {
          // Data is hidden under the overlay, matching table tbody.
        } else if (ctx.paginatedData.value.length === 0) {
          cardChildren.push(
            h(
              'div',
              {
                class: getTableResponsiveCardClasses(resolvedProps.cardPadding),
                role: 'status',
                'aria-live': 'polite'
              },
              [h(Empty, { showImage: false, description: tableLabels.value.emptyText })]
            )
          )
        } else {
          const cardStart = cardHeightWindow
            ? cardHeightWindow.start
            : effectiveVirtual && virtualWindow
              ? virtualWindow.startIndex
              : 0
          const cardEnd = cardHeightWindow
            ? cardHeightWindow.end
            : effectiveVirtual && virtualWindow
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
              const isExpanded = ctx.expandedRowKeySet.value.has(tableRowKeyId(key))
              const isSelected = ctx.selectedRowKeySet.value.has(tableRowKeyId(key))
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
                                gridInfo.divider && 'border-t border-[var(--tiger-border)] pt-3'
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
                                gridInfo.divider && 'border-t border-[var(--tiger-border)] pt-3'
                              )
                            },
                            [
                              h(
                                'div',
                                {
                                  class: classNames(
                                    'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-secondary)] mb-1',
                                    gridInfo.labelClassName
                                  )
                                },
                                column.title
                              ),
                              h(
                                'div',
                                {
                                  class: classNames(
                                    'min-w-0 text-sm text-[var(--tiger-text)] break-words',
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
                              gridInfo.divider && 'border-t border-[var(--tiger-border)] pt-3'
                            )
                          },
                          [
                            h(
                              'div',
                              {
                                class: classNames(
                                  'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-secondary)] shrink-0',
                                  gridInfo.labelClassName
                                )
                              },
                              column.title
                            ),
                            h(
                              'div',
                              {
                                class: classNames(
                                  'min-w-0 text-sm text-[var(--tiger-text)] break-words',
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
                      class: 'text-sm text-[var(--tiger-primary)]',
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
                              class: 'mt-3 border-t border-[var(--tiger-border)] pt-3'
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
            'data-tiger-card-window': cardHeightWindow
              ? `${cardHeightWindow.start}-${cardHeightWindow.end}`
              : undefined,
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
          h(TableW9Panel, {
            active: resolvedProps.sorts !== undefined,
            columns: ctx.displayColumns.value,
            sorts: ctx.multiSort.value,
            pageKeys: ctx.paginatedRowKeys.value,
            loadedKeys: ctx.processedRowKeys.value,
            disabledKeys: ctx.paginatedData.value.flatMap((record, index) => {
              const key = ctx.paginatedRowKeys.value[index]
              const checkbox = resolvedProps.rowSelection?.getCheckboxProps?.(record)
              return checkbox?.disabled && key !== undefined ? [key] : []
            }),
            pageRecords: ctx.paginatedData.value as Record<string, unknown>[],
            processedRecords: ctx.processedData.value,
            processedKeys: ctx.processedRowKeys.value,
            selectedKeys: ctx.selectedRowKeys.value,
            onSort: (key: string) => ctx.applyMultiSort(key),
            onFilter: (key: string, value: string) => ctx.handleFilter(key, value),
            onHide: (key: string) => {
              const hidden = ctx.hiddenColumnKeys.value.includes(key)
                ? ctx.hiddenColumnKeys.value.filter((item) => item !== key)
                : [...ctx.hiddenColumnKeys.value, key]
              ctx.handleSetHiddenColumns(hidden)
            },
            onResize: (key: string, width: number) => ctx.applyColumnWidth(key, width),
            onSelection: (keys: (string | number)[], announcement: string) => {
              ctx.replaceSelectedKeys(keys)
              if (announcement) ctx.selectionLive.value = announcement
            },
            onRemoteSelect: () => ctx.handleSelectLoaded(true)
          }),
          ctx.dragLive.value
            ? h('div', { role: 'status', 'data-tiger-drag-live': '' }, ctx.dragLive.value)
            : null,
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
              [
                h(Loading, { 'aria-hidden': true, role: 'presentation' }),
                h('span', { class: 'sr-only' }, tableLabels.value.loadingText)
              ]
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
