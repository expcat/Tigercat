import { defineComponent, h, ref } from 'vue'
import type { RowSelectionConfig, VirtualTableHandle } from '@expcat/tigercat-core'
import { Table } from './Table'
import { tableEmits, tableProps } from './Table/props'

/**
 * VirtualTable is Table with the virtual strategy. It does not drop sort or filter.
 */
export const VirtualTable = defineComponent({
  name: 'TigerVirtualTable',
  props: tableProps,
  emits: tableEmits as unknown as string[],
  setup(props, { attrs, slots, emit, expose }) {
    const scrollIndex = ref<number | undefined>(undefined)
    expose({
      scrollToIndex(index: number) {
        scrollIndex.value = index
      }
    } satisfies VirtualTableHandle)

    return () => {
      const rowSelection = props.rowSelection
        ? ({
            ...props.rowSelection,
            showCheckbox: props.rowSelection.showCheckbox ?? false
          } as RowSelectionConfig)
        : undefined
      return h(
        Table,
        {
          ...attrs,
          ...props,
          virtual: true,
          overscan: props.overscan ?? 2,
          pagination: props.pagination === undefined ? false : props.pagination,
          rowSelection,
          scrollToIndex: scrollIndex.value,
          onRowClick: (...args: unknown[]) => emit('row-click', ...args),
          onSelectionChange: (...args: unknown[]) => emit('selection-change', ...args),
          onSortChange: (...args: unknown[]) => emit('sort-change', ...args),
          onFilterChange: (...args: unknown[]) => emit('filter-change', ...args),
          onCellChange: (...args: unknown[]) => emit('cell-change', ...args),
          onPageChange: (...args: unknown[]) => emit('page-change', ...args),
          onExpandChange: (...args: unknown[]) => emit('expand-change', ...args),
          onExport: (...args: unknown[]) => emit('export', ...args),
          onSelectLoaded: (...args: unknown[]) => emit('select-loaded', ...args)
        },
        slots
      )
    }
  }
})

export type { VirtualTableHandle }
