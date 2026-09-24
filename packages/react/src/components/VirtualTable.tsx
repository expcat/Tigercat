import React, { forwardRef, useImperativeHandle, useState } from 'react'
import type { RowSelectionConfig, VirtualTableHandle, VirtualTableProps } from '@expcat/tigercat-core'
import { Table, type TableProps } from './Table'

function VirtualTableInner<T extends Record<string, unknown>>(
  props: VirtualTableProps<T>,
  ref: React.ForwardedRef<VirtualTableHandle>
): React.ReactElement {
  const [scrollIndex, setScrollIndex] = useState<number | undefined>(undefined)
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex(index: number) {
        setScrollIndex(index)
      }
    }),
    []
  )
  const rowSelection = props.rowSelection
    ? ({
        ...props.rowSelection,
        showCheckbox: props.rowSelection.showCheckbox ?? false
      } as RowSelectionConfig)
    : undefined
  const testId = (props as { 'data-testid'?: string })['data-testid']
  const tableProps = {
    ...(props as unknown as TableProps<T>),
    virtual: true,
    overscan: props.overscan ?? 2,
    pagination: false as const,
    rowSelection,
    scrollToIndex: scrollIndex
  }
  delete (tableProps as { 'data-testid'?: string })['data-testid']
  return (
    <div data-testid={testId}>
      <Table {...tableProps} />
    </div>
  )
}

export const VirtualTable = forwardRef(VirtualTableInner) as <T extends Record<string, unknown>>(
  props: VirtualTableProps<T> & { ref?: React.ForwardedRef<VirtualTableHandle> }
) => React.ReactElement
