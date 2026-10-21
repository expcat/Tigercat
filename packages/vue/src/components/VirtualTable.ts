import { camelize, defineComponent, h, ref, toHandlerKey } from 'vue'
import type { RowSelectionConfig, VirtualTableHandle } from '@expcat/tigercat-core'
import {
  getVirtualTableColumnWidths,
  resolveVirtualTableColumnVirtualization
} from '@expcat/tigercat-core'
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

    // Forward every Table emit. tableEmits is the single source of truth, so
    // newly added Table events keep flowing without a second hand-written list.
    const forwardedEmits = Object.fromEntries(
      tableEmits.map((name) => [
        toHandlerKey(camelize(name)),
        (...args: unknown[]) => emit(name, ...args)
      ])
    )

    return () => {
      const rowSelection = props.rowSelection
        ? ({
            ...props.rowSelection,
            showCheckbox: props.rowSelection.showCheckbox ?? false
          } as RowSelectionConfig)
        : undefined
      // The wrapper contract only virtualizes plain numeric-width columns;
      // fixed columns or unresolved widths fall back to full rendering.
      const columnGuard = resolveVirtualTableColumnVirtualization({
        virtualizeColumns: props.virtualizeColumns,
        hasFixedColumns: (props.columns ?? []).some((column) => !!column.fixed),
        widths: getVirtualTableColumnWidths([...(props.columns ?? [])]),
        viewportWidth: typeof props.width === 'number' ? props.width : 0
      })
      return h(
        Table,
        {
          ...attrs,
          ...props,
          virtual: true,
          virtualizeColumns: columnGuard.active,
          overscan: props.overscan ?? 2,
          pagination: props.pagination === undefined ? false : props.pagination,
          rowSelection,
          scrollToIndex: scrollIndex.value,
          ...forwardedEmits
        },
        slots
      )
    }
  }
})

export type VueVirtualTableProps = InstanceType<typeof VirtualTable>['$props']
export type { VirtualTableProps, VirtualTableHandle } from '@expcat/tigercat-core'
