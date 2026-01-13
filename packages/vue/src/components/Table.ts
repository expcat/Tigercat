import {
  defineComponent,
  computed,
  ref,
  watch,
  h,
  PropType,
  type VNodeChild,
} from "vue";
import {
  classNames,
  getTableWrapperClasses,
  getTableHeaderClasses,
  getTableHeaderCellClasses,
  getTableRowClasses,
  getTableCellClasses,
  getFixedColumnOffsets,
  getSortIconClasses,
  getCheckboxCellClasses,
  tableBaseClasses,
  tableEmptyStateClasses,
  tableLoadingOverlayClasses,
  tablePaginationContainerClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  getRowKey,
  type TableColumn,
  type TableSize,
  type SortDirection,
  type SortState,
  type PaginationConfig,
  type RowSelectionConfig,
} from "@tigercat/core";

const spinnerSvg = getSpinnerSVG("spinner");

export interface VueTableProps {
  columns: TableColumn[];
  columnLockable?: boolean;
  dataSource?: Record<string, unknown>[];
  sort?: SortState;
  defaultSort?: SortState;
  filters?: Record<string, unknown>;
  defaultFilters?: Record<string, unknown>;
  size?: TableSize;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  emptyText?: string;
  pagination?: PaginationConfig | false;
  rowSelection?: RowSelectionConfig;
  rowKey?: string | ((record: Record<string, unknown>) => string | number);
  rowClassName?:
    | string
    | ((record: Record<string, unknown>, index: number) => string);
  stickyHeader?: boolean;
  maxHeight?: string | number;
}

// Sort icons
const SortIcon = (direction: SortDirection) => {
  if (direction === "asc") {
    return h(
      "svg",
      {
        class: getSortIconClasses(true),
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "currentColor",
      },
      [
        h("path", {
          d: "M8 3l4 4H4l4-4z",
        }),
      ]
    );
  }

  if (direction === "desc") {
    return h(
      "svg",
      {
        class: getSortIconClasses(true),
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "currentColor",
      },
      [
        h("path", {
          d: "M8 13l-4-4h8l-4 4z",
        }),
      ]
    );
  }

  return h(
    "svg",
    {
      class: getSortIconClasses(false),
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "currentColor",
    },
    [
      h("path", {
        d: "M8 3l4 4H4l4-4zM8 13l-4-4h8l-4 4z",
      }),
    ]
  );
};
const LockIcon = (locked: boolean) => {
  return h(
    "svg",
    {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
    },
    [
      locked
        ? h("path", {
            d: "M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V6z",
          })
        : h("path", {
            d: "M17 8h-1V6a4 4 0 00-7.75-1.41 1 1 0 101.9.62A2 2 0 0114 6v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm0 12H7V10h10v10z",
          }),
    ]
  );
};

// Loading spinner
const LoadingSpinner = () => {
  return h(
    "svg",
    {
      class: "animate-spin h-8 w-8 text-[var(--tiger-primary,#2563eb)]",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: spinnerSvg.viewBox,
    },
    spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  );
};

export const Table = defineComponent({
  name: "TigerTable",
  props: {
    /**
     * Table columns configuration
     */
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true,
    },

    /**
     * Whether to show a lock button in each column header.
     */
    columnLockable: {
      type: Boolean,
      default: false,
    },
    /**
     * Table data source
     */
    dataSource: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => [],
    },

    /**
     * Controlled sort state.
     */
    sort: {
      type: Object as PropType<SortState>,
    },

    /**
     * Default sort state for uncontrolled mode.
     */
    defaultSort: {
      type: Object as PropType<SortState>,
      default: () => ({
        key: null,
        direction: null,
      }),
    },

    /**
     * Controlled filters.
     */
    filters: {
      type: Object as PropType<Record<string, unknown>>,
    },

    /**
     * Default filters for uncontrolled mode.
     */
    defaultFilters: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
    /**
     * Table size
     */
    size: {
      type: String as PropType<TableSize>,
      default: "md" as TableSize,
    },
    /**
     * Whether to show border
     */
    bordered: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show striped rows
     */
    striped: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to highlight row on hover
     */
    hoverable: {
      type: Boolean,
      default: true,
    },
    /**
     * Loading state
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Empty state text
     */
    emptyText: {
      type: String,
      default: "No data",
    },
    /**
     * Pagination configuration
     */
    pagination: {
      type: [Object, Boolean] as PropType<PaginationConfig | false>,
      default: () => ({
        current: 1,
        pageSize: 10,
        total: 0,
        pageSizeOptions: [10, 20, 50, 100],
        showSizeChanger: true,
        showTotal: true,
      }),
    },
    /**
     * Row selection configuration
     */
    rowSelection: {
      type: Object as PropType<RowSelectionConfig>,
    },
    /**
     * Function to get row key
     */
    rowKey: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>) => string | number)
      >,
      default: "id",
    },
    /**
     * Custom row class name
     */
    rowClassName: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>, index: number) => string)
      >,
    },
    /**
     * Whether table head is sticky
     */
    stickyHeader: {
      type: Boolean,
      default: false,
    },
    /**
     * Max height for scrollable table
     */
    maxHeight: {
      type: [String, Number] as PropType<string | number>,
    },
  },
  emits: [
    "change",
    "row-click",
    "selection-change",
    "sort-change",
    "filter-change",
    "page-change",
  ],
  setup(props, { emit, slots }) {
    const paginationConfig = computed(() => {
      return props.pagination !== false && typeof props.pagination === "object"
        ? props.pagination
        : null;
    });

    const isSortControlled = computed(() => props.sort !== undefined);
    const isFiltersControlled = computed(() => props.filters !== undefined);
    const isCurrentPageControlled = computed(
      () => paginationConfig.value?.current !== undefined
    );
    const isPageSizeControlled = computed(
      () => paginationConfig.value?.pageSize !== undefined
    );
    const isSelectionControlled = computed(
      () => props.rowSelection?.selectedRowKeys !== undefined
    );

    const uncontrolledSortState = ref<SortState>(props.defaultSort);
    const uncontrolledFilterState = ref<Record<string, unknown>>(
      props.defaultFilters
    );

    const uncontrolledCurrentPage = ref(
      paginationConfig.value?.defaultCurrent ??
        paginationConfig.value?.current ??
        1
    );

    const uncontrolledCurrentPageSize = ref(
      paginationConfig.value?.defaultPageSize ??
        paginationConfig.value?.pageSize ??
        10
    );

    const uncontrolledSelectedRowKeys = ref<(string | number)[]>(
      props.rowSelection?.defaultSelectedRowKeys ??
        props.rowSelection?.selectedRowKeys ??
        []
    );

    const sortState = computed(() => props.sort ?? uncontrolledSortState.value);
    const filterState = computed(
      () => props.filters ?? uncontrolledFilterState.value
    );
    const currentPage = computed(() => {
      return paginationConfig.value?.current ?? uncontrolledCurrentPage.value;
    });
    const currentPageSize = computed(() => {
      return (
        paginationConfig.value?.pageSize ?? uncontrolledCurrentPageSize.value
      );
    });
    const selectedRowKeys = computed(() => {
      return (
        props.rowSelection?.selectedRowKeys ?? uncontrolledSelectedRowKeys.value
      );
    });

    watch(
      () => props.sort,
      (next) => {
        if (next !== undefined) {
          uncontrolledSortState.value = next;
        }
      }
    );

    watch(
      () => props.filters,
      (next) => {
        if (next !== undefined) {
          uncontrolledFilterState.value = next;
        }
      }
    );

    watch(
      () => paginationConfig.value?.current,
      (next) => {
        if (next !== undefined) {
          uncontrolledCurrentPage.value = next;
        }
      }
    );

    watch(
      () => paginationConfig.value?.pageSize,
      (next) => {
        if (next !== undefined) {
          uncontrolledCurrentPageSize.value = next;
        }
      }
    );

    watch(
      () => props.rowSelection?.selectedRowKeys,
      (next) => {
        if (next !== undefined) {
          uncontrolledSelectedRowKeys.value = next;
        }
      }
    );

    const fixedOverrides = ref<Record<string, "left" | "right" | false>>({});

    const displayColumns = computed(() => {
      return props.columns.map((column) => {
        const hasOverride = column.key in fixedOverrides.value;

        return {
          ...column,
          fixed: hasOverride ? fixedOverrides.value[column.key] : column.fixed,
        };
      });
    });

    const fixedColumnsInfo = computed(() => {
      return getFixedColumnOffsets(displayColumns.value);
    });

    const columnByKey = computed(() => {
      const map: Record<string, (typeof displayColumns.value)[number]> = {};
      for (const column of displayColumns.value) {
        map[column.key] = column;
      }
      return map;
    });

    function toggleColumnLock(columnKey: string) {
      const original = props.columns.find((c) => c.key === columnKey)?.fixed;
      const hasOverride = columnKey in fixedOverrides.value;
      const current = hasOverride ? fixedOverrides.value[columnKey] : original;
      const isLocked = current === "left" || current === "right";
      fixedOverrides.value[columnKey] = isLocked ? false : "left";
    }

    // Process data with sorting, filtering, and pagination
    const processedData = computed(() => {
      let data = props.dataSource;

      // Apply filters
      data = filterData(data, filterState.value);

      // Apply sorting
      if (sortState.value.key && sortState.value.direction) {
        const column = columnByKey.value[sortState.value.key];
        data = sortData(
          data,
          sortState.value.key,
          sortState.value.direction,
          column?.sortFn
        );
      }

      return data;
    });

    const paginatedData = computed(() => {
      if (props.pagination === false) {
        return processedData.value;
      }

      return paginateData(
        processedData.value,
        currentPage.value,
        currentPageSize.value
      );
    });

    const paginatedRowKeys = computed(() => {
      return paginatedData.value.map((record, index) =>
        getRowKey(record, props.rowKey, index)
      );
    });

    const selectedRowKeySet = computed(() => {
      return new Set<string | number>(selectedRowKeys.value);
    });

    const paginationInfo = computed(() => {
      if (props.pagination === false) {
        return null;
      }

      const total = processedData.value.length;
      return calculatePagination(
        total,
        currentPage.value,
        currentPageSize.value
      );
    });

    function handleSort(columnKey: string) {
      const column = displayColumns.value.find((col) => col.key === columnKey);
      if (!column || !column.sortable) {
        return;
      }

      let newDirection: SortDirection = "asc";

      if (sortState.value.key === columnKey) {
        if (sortState.value.direction === "asc") {
          newDirection = "desc";
        } else if (sortState.value.direction === "desc") {
          newDirection = null;
        }
      }

      const nextSortState: SortState = {
        key: newDirection ? columnKey : null,
        direction: newDirection,
      };

      if (!isSortControlled.value) {
        uncontrolledSortState.value = nextSortState;
      }

      emit("sort-change", nextSortState);
      emit("change", {
        sort: nextSortState,
        filters: filterState.value,
        pagination:
          props.pagination !== false
            ? {
                current: currentPage.value,
                pageSize: currentPageSize.value,
              }
            : null,
      });
    }

    function handleFilter(columnKey: string, value: unknown) {
      const nextFilterState = {
        ...filterState.value,
        [columnKey]: value,
      };

      if (!isFiltersControlled.value) {
        uncontrolledFilterState.value = nextFilterState;
      }

      // Reset to first page when filtering
      uncontrolledCurrentPage.value = 1;

      emit("filter-change", nextFilterState);
      emit("change", {
        sort: sortState.value,
        filters: nextFilterState,
        pagination:
          props.pagination !== false
            ? {
                current: 1,
                pageSize: currentPageSize.value,
              }
            : null,
      });
    }

    function handlePageChange(page: number) {
      if (!isCurrentPageControlled.value) {
        uncontrolledCurrentPage.value = page;
      } else {
        uncontrolledCurrentPage.value = page;
      }

      emit("page-change", { current: page, pageSize: currentPageSize.value });
      emit("change", {
        sort: sortState.value,
        filters: filterState.value,
        pagination: {
          current: page,
          pageSize: currentPageSize.value,
        },
      });
    }

    function handlePageSizeChange(pageSize: number) {
      if (!isPageSizeControlled.value) {
        uncontrolledCurrentPageSize.value = pageSize;
      } else {
        uncontrolledCurrentPageSize.value = pageSize;
      }

      if (!isCurrentPageControlled.value) {
        uncontrolledCurrentPage.value = 1;
      } else {
        uncontrolledCurrentPage.value = 1;
      }

      emit("page-change", { current: 1, pageSize });
      emit("change", {
        sort: sortState.value,
        filters: filterState.value,
        pagination: {
          current: 1,
          pageSize,
        },
      });
    }

    function handleRowClick(record: Record<string, unknown>, index: number) {
      emit("row-click", record, index);
    }

    function handleSelectRow(key: string | number, checked: boolean) {
      let newKeys: (string | number)[];

      if (props.rowSelection?.type === "radio") {
        newKeys = checked ? [key] : [];
      } else {
        if (checked) {
          newKeys = [...selectedRowKeys.value, key];
        } else {
          newKeys = selectedRowKeys.value.filter((k) => k !== key);
        }
      }

      if (!isSelectionControlled.value) {
        uncontrolledSelectedRowKeys.value = newKeys;
      }
      emit("selection-change", newKeys);
    }

    function handleSelectAll(checked: boolean) {
      if (checked) {
        const nextKeys = paginatedRowKeys.value;

        if (!isSelectionControlled.value) {
          uncontrolledSelectedRowKeys.value = nextKeys;
        }

        emit("selection-change", nextKeys);
      } else {
        if (!isSelectionControlled.value) {
          uncontrolledSelectedRowKeys.value = [];
        }

        emit("selection-change", []);
      }
    }

    const allSelected = computed(() => {
      if (paginatedRowKeys.value.length === 0) {
        return false;
      }

      return paginatedRowKeys.value.every((key) =>
        selectedRowKeySet.value.has(key)
      );
    });

    const someSelected = computed(() => {
      return selectedRowKeys.value.length > 0 && !allSelected.value;
    });

    function renderTableHeader() {
      const headerCells = [];

      // Selection checkbox column
      if (
        props.rowSelection &&
        props.rowSelection.showCheckbox !== false &&
        props.rowSelection.type !== "radio"
      ) {
        headerCells.push(
          h(
            "th",
            {
              class: getCheckboxCellClasses(props.size),
            },
            [
              h("input", {
                type: "checkbox",
                class:
                  "rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]",
                checked: allSelected.value,
                indeterminate: someSelected.value,
                onChange: (e: Event) =>
                  handleSelectAll((e.target as HTMLInputElement).checked),
              }),
            ]
          )
        );
      }

      // Column headers
      displayColumns.value.forEach((column) => {
        const isSorted = sortState.value.key === column.key;
        const sortDirection = isSorted ? sortState.value.direction : null;

        const ariaSort = column.sortable
          ? sortDirection === "asc"
            ? "ascending"
            : sortDirection === "desc"
            ? "descending"
            : "none"
          : undefined;

        const isFixedLeft = column.fixed === "left";
        const isFixedRight = column.fixed === "right";
        const fixedStyle = isFixedLeft
          ? {
              position: "sticky",
              left: `${fixedColumnsInfo.value.leftOffsets[column.key] || 0}px`,
              zIndex: 15,
            }
          : isFixedRight
          ? {
              position: "sticky",
              right: `${
                fixedColumnsInfo.value.rightOffsets[column.key] || 0
              }px`,
              zIndex: 15,
            }
          : undefined;

        const widthStyle = column.width
          ? {
              width:
                typeof column.width === "number"
                  ? `${column.width}px`
                  : column.width,
            }
          : undefined;

        const style = fixedStyle
          ? { ...widthStyle, ...fixedStyle }
          : widthStyle;

        const headerContent: VNodeChild[] = [];

        if (column.renderHeader) {
          const slotContent = slots[`header-${column.key}`]?.();
          if (slotContent && slotContent.length > 0) {
            headerContent.push(...slotContent);
          } else {
            headerContent.push(column.title);
          }
        } else {
          headerContent.push(column.title);
        }

        if (props.columnLockable) {
          headerContent.push(
            h(
              "button",
              {
                type: "button",
                class: classNames(
                  "inline-flex items-center",
                  column.fixed === "left" || column.fixed === "right"
                    ? "text-[var(--tiger-primary,#2563eb)]"
                    : "text-gray-400 hover:text-gray-700"
                ),
                "aria-label":
                  column.fixed === "left" || column.fixed === "right"
                    ? `Unlock column ${column.title}`
                    : `Lock column ${column.title}`,
                onClick: (e: Event) => {
                  e.stopPropagation();
                  toggleColumnLock(column.key);
                },
              },
              [LockIcon(column.fixed === "left" || column.fixed === "right")]
            )
          );
        }

        if (column.sortable) {
          headerContent.push(SortIcon(sortDirection));
        }

        headerCells.push(
          h(
            "th",
            {
              key: column.key,
              "aria-sort": ariaSort,
              class: classNames(
                getTableHeaderCellClasses(
                  props.size,
                  column.align || "left",
                  !!column.sortable,
                  column.headerClassName
                ),
                (isFixedLeft || isFixedRight) && "bg-gray-50"
              ),
              style,
              onClick: column.sortable
                ? () => handleSort(column.key)
                : undefined,
            },
            [
              h("div", { class: "flex items-center gap-2" }, headerContent),
              // Filter input
              ...(column.filter
                ? [
                    h("div", { class: "mt-2" }, [
                      column.filter.type === "select" && column.filter.options
                        ? h(
                            "select",
                            {
                              class:
                                "w-full px-2 py-1 text-sm border border-gray-300 rounded",
                              onChange: (e: Event) =>
                                handleFilter(
                                  column.key,
                                  (e.target as HTMLSelectElement).value
                                ),
                              onClick: (e: Event) => e.stopPropagation(),
                            },
                            [
                              h("option", { value: "" }, "All"),
                              ...column.filter.options.map((opt) =>
                                h("option", { value: opt.value }, opt.label)
                              ),
                            ]
                          )
                        : h("input", {
                            type: "text",
                            class:
                              "w-full px-2 py-1 text-sm border border-gray-300 rounded",
                            placeholder:
                              column.filter.placeholder || "Filter...",
                            onInput: (e: Event) =>
                              handleFilter(
                                column.key,
                                (e.target as HTMLInputElement).value
                              ),
                            onClick: (e: Event) => e.stopPropagation(),
                          }),
                    ]),
                  ]
                : []),
            ]
          )
        );
      });

      return h("thead", { class: getTableHeaderClasses(props.stickyHeader) }, [
        h("tr", headerCells),
      ]);
    }

    function renderTableBody() {
      if (props.loading) {
        return null;
      }

      if (paginatedData.value.length === 0) {
        return h("tbody", [
          h("tr", [
            h(
              "td",
              {
                colspan:
                  displayColumns.value.length + (props.rowSelection ? 1 : 0),
                class: tableEmptyStateClasses,
              },
              [
                h(
                  "div",
                  {
                    role: "status",
                    "aria-live": "polite",
                  },
                  props.emptyText
                ),
              ]
            ),
          ]),
        ]);
      }

      const rows = paginatedData.value.map((record, index) => {
        const key = paginatedRowKeys.value[index];
        const isSelected = selectedRowKeySet.value.has(key);
        const rowClass =
          typeof props.rowClassName === "function"
            ? props.rowClassName(record, index)
            : props.rowClassName;

        const cells = [];

        // Selection checkbox cell
        if (props.rowSelection && props.rowSelection.showCheckbox !== false) {
          const checkboxProps =
            props.rowSelection?.getCheckboxProps?.(record) || {};

          cells.push(
            h(
              "td",
              {
                class: getCheckboxCellClasses(props.size),
              },
              [
                h("input", {
                  type:
                    props.rowSelection?.type === "radio" ? "radio" : "checkbox",
                  class:
                    props.rowSelection?.type === "radio"
                      ? "border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]"
                      : "rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]",
                  checked: isSelected,
                  disabled: checkboxProps.disabled,
                  onChange: (e: Event) =>
                    handleSelectRow(
                      key,
                      (e.target as HTMLInputElement).checked
                    ),
                }),
              ]
            )
          );
        }

        // Data cells
        displayColumns.value.forEach((column) => {
          const dataKey = column.dataKey || column.key;
          const cellValue = record[dataKey];

          const isFixedLeft = column.fixed === "left";
          const isFixedRight = column.fixed === "right";
          const fixedStyle = isFixedLeft
            ? {
                position: "sticky",
                left: `${
                  fixedColumnsInfo.value.leftOffsets[column.key] || 0
                }px`,
                zIndex: 10,
              }
            : isFixedRight
            ? {
                position: "sticky",
                right: `${
                  fixedColumnsInfo.value.rightOffsets[column.key] || 0
                }px`,
                zIndex: 10,
              }
            : undefined;

          const widthStyle = column.width
            ? {
                width:
                  typeof column.width === "number"
                    ? `${column.width}px`
                    : column.width,
              }
            : undefined;

          const style = fixedStyle
            ? { ...widthStyle, ...fixedStyle }
            : widthStyle;

          const stickyBgClass =
            props.striped && index % 2 === 0 ? "bg-gray-50/50" : "bg-white";
          const stickyCellClass =
            isFixedLeft || isFixedRight
              ? classNames(
                  stickyBgClass,
                  props.hoverable && "group-hover:bg-gray-50"
                )
              : undefined;

          cells.push(
            h(
              "td",
              {
                key: column.key,
                class: classNames(
                  getTableCellClasses(
                    props.size,
                    column.align || "left",
                    column.className
                  ),
                  stickyCellClass
                ),
                style,
              },
              [
                column.render
                  ? slots[`cell-${column.key}`]?.({ record, index }) ||
                    (column.render(record, index) as string)
                  : (cellValue as string),
              ]
            )
          );
        });

        return h(
          "tr",
          {
            key,
            class: classNames(
              getTableRowClasses(
                props.hoverable,
                props.striped,
                index % 2 === 0,
                rowClass
              ),
              fixedColumnsInfo.value.hasFixedColumns && "group"
            ),
            onClick: () => handleRowClick(record, index),
          },
          cells
        );
      });

      return h("tbody", rows);
    }

    function renderPagination() {
      if (props.pagination === false || !paginationInfo.value) {
        return null;
      }

      const { totalPages, startIndex, endIndex, hasNext, hasPrev } =
        paginationInfo.value;
      const total = processedData.value.length;
      const paginationConfig = props.pagination as PaginationConfig;

      return h("div", { class: tablePaginationContainerClasses }, [
        // Total info
        paginationConfig.showTotal !== false &&
          h(
            "div",
            { class: "text-sm text-gray-700" },
            paginationConfig.totalText
              ? paginationConfig.totalText(total, [startIndex, endIndex])
              : `Showing ${startIndex} to ${endIndex} of ${total} results`
          ),

        // Pagination controls
        h("div", { class: "flex items-center gap-2" }, [
          // Page size selector
          paginationConfig.showSizeChanger !== false &&
            h(
              "select",
              {
                class: "px-3 py-1 border border-gray-300 rounded text-sm",
                value: currentPageSize.value,
                onChange: (e: Event) =>
                  handlePageSizeChange(
                    Number((e.target as HTMLSelectElement).value)
                  ),
              },
              (paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map(
                (size) => h("option", { value: size }, `${size} / page`)
              )
            ),

          // Page buttons
          h("div", { class: "flex gap-1" }, [
            // Previous button
            h(
              "button",
              {
                class: classNames(
                  "px-3 py-1 border border-gray-300 rounded text-sm",
                  hasPrev
                    ? "hover:bg-gray-50 text-gray-700"
                    : "text-gray-400 cursor-not-allowed"
                ),
                disabled: !hasPrev,
                onClick: () => handlePageChange(currentPage.value - 1),
              },
              "Previous"
            ),

            // Current page indicator
            h(
              "span",
              { class: "px-3 py-1 text-sm text-gray-700" },
              `Page ${currentPage.value} of ${totalPages}`
            ),

            // Next button
            h(
              "button",
              {
                class: classNames(
                  "px-3 py-1 border border-gray-300 rounded text-sm",
                  hasNext
                    ? "hover:bg-gray-50 text-gray-700"
                    : "text-gray-400 cursor-not-allowed"
                ),
                disabled: !hasNext,
                onClick: () => handlePageChange(currentPage.value + 1),
              },
              "Next"
            ),
          ]),
        ]),
      ]);
    }

    return () => {
      const wrapperStyle = props.maxHeight
        ? {
            maxHeight:
              typeof props.maxHeight === "number"
                ? `${props.maxHeight}px`
                : props.maxHeight,
          }
        : undefined;

      return h("div", { class: "relative" }, [
        h(
          "div",
          {
            class: getTableWrapperClasses(props.bordered, props.maxHeight),
            style: wrapperStyle,
            "aria-busy": props.loading,
          },
          [
            h(
              "table",
              {
                class: tableBaseClasses,
                style:
                  fixedColumnsInfo.value.hasFixedColumns &&
                  fixedColumnsInfo.value.minTableWidth
                    ? { minWidth: `${fixedColumnsInfo.value.minTableWidth}px` }
                    : undefined,
              },
              [renderTableHeader(), renderTableBody()]
            ),

            // Loading overlay
            props.loading &&
              h(
                "div",
                {
                  class: tableLoadingOverlayClasses,
                  role: "status",
                  "aria-live": "polite",
                  "aria-label": "Loading",
                },
                [LoadingSpinner(), h("span", { class: "sr-only" }, "Loading")]
              ),
          ]
        ),

        // Pagination
        renderPagination(),
      ]);
    };
  },
});

export default Table;
