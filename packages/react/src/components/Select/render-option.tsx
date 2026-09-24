import React, { useEffect, useRef, useState } from 'react'
import {
  getSelectOptionClasses,
  selectEmptyStateClasses,
  selectGroupLabelClasses,
  selectListboxClasses,
  getCreateSelectOptionLabel,
  getPickerOptionAria,
  getSelectVirtualRowHeight,
  getSelectVirtualWindow,
  getSelectActiveAlignScrollTop,
  getSelectRowIndexForOption,
  buildSelectListRows,
  selectRowGroupLabel,
  shouldVirtualizeSelectList,
  type SelectListRow,
  type SelectOption
} from '@expcat/tigercat-core'
import { SelectCheckIcon } from './icons'
import type { SelectRenderContext } from './types'

function OptionRow({
  ctx,
  row
}: {
  ctx: SelectRenderContext
  row: Extract<SelectListRow, { kind: 'option' }>
}) {
  const option = row.option
  const selected = ctx.isSelected(option)
  const active = row.optionIndex === ctx.activeIndex
  const displayLabel = row.isCreate
    ? getCreateSelectOptionLabel(option, ctx.createOptionLabel)
    : option.label
  const optionAria = getPickerOptionAria({
    selected,
    disabled: !!option.disabled
  })
  const custom = ctx.renderOption?.({
    value: option.value,
    label: displayLabel,
    disabled: option.disabled,
    selected,
    active
  })

  return (
    <div
      id={ctx.getOptionId(row.optionIndex)}
      data-option-index={row.optionIndex}
      data-active={active ? '' : undefined}
      {...optionAria}
      className={getSelectOptionClasses({
        isSelected: selected,
        isDisabled: !!option.disabled,
        isActive: active,
        size: ctx.size
      })}
      onMouseEnter={() => {
        if (!option.disabled) ctx.setActiveIndex(row.optionIndex)
      }}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => ctx.selectOption(option)}>
      {custom ?? (
        <span className="flex items-center justify-between w-full gap-2">
          <span className="min-w-0">
            <span className="block truncate">{displayLabel}</span>
            {option.description ? (
              <span className="block truncate text-xs text-[var(--tiger-text-secondary)]">
                {option.description}
              </span>
            ) : null}
          </span>
          {selected ? <SelectCheckIcon /> : null}
        </span>
      )}
    </div>
  )
}

function renderRows(
  ctx: SelectRenderContext,
  rows: SelectListRow[],
  fullRows: readonly SelectListRow[] = rows,
  offset = 0
) {
  const nodes: React.ReactNode[] = []
  let bucket: { key: string; label: string; header: boolean; children: React.ReactNode[] } | null =
    null
  const flush = () => {
    if (!bucket) return
    nodes.push(
      <div key={bucket.key} role="group" aria-label={bucket.label}>
        <div className={bucket.header ? selectGroupLabelClasses : 'sr-only'} aria-hidden="true">
          {bucket.label}
        </div>
        {bucket.children}
      </div>
    )
    bucket = null
  }
  rows.forEach((row, localIndex) => {
    if (row.kind === 'group') {
      flush()
      bucket = { key: row.key, label: row.label, header: true, children: [] }
      return
    }
    const label = selectRowGroupLabel(fullRows, offset + localIndex)
    if (label && bucket?.label !== label) {
      flush()
      bucket = { key: `wrap-${row.key}`, label, header: false, children: [] }
    }
    const option = <OptionRow key={row.key} ctx={ctx} row={row} />
    if (bucket) bucket.children.push(option)
    else nodes.push(option)
  })
  flush()
  return nodes
}

function listMaxStyle(listHeight: number): React.CSSProperties {
  return {
    maxHeight: `min(${listHeight}px, var(--tiger-overlay-available-height, ${listHeight}px))`
  }
}

function VirtualSelectRows({ ctx, rows }: { ctx: SelectRenderContext; rows: SelectListRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)
  const activeRowIndex = getSelectRowIndexForOption(rows, ctx.activeIndex)
  const { startIndex, endIndex, offsetTop, totalHeight } = getSelectVirtualWindow({
    rows,
    scrollTop,
    listHeight: ctx.listHeight,
    size: ctx.size,
    activeRowIndex
  })
  const activeHeight =
    activeRowIndex >= 0 ? getSelectVirtualRowHeight(ctx.size, rows[activeRowIndex]?.kind) : 0

  useEffect(() => {
    const el = containerRef.current
    if (!el || ctx.activeIndex < 0) return
    const rowIndex = getSelectRowIndexForOption(rows, ctx.activeIndex)
    const next = getSelectActiveAlignScrollTop({
      scrollTop: el.scrollTop,
      listHeight: ctx.listHeight,
      rowIndex,
      itemHeight: activeHeight || getSelectVirtualRowHeight(ctx.size, 'option')
    })
    if (next !== el.scrollTop) {
      el.scrollTop = next
      setScrollTop(next)
    }
  }, [activeHeight, ctx.activeIndex, ctx.listHeight, rows])

  useEffect(
    () => () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    },
    []
  )

  const visible = rows.slice(startIndex, endIndex + 1)

  return (
    <div
      ref={containerRef}
      data-tiger-select-virtual=""
      className={selectListboxClasses}
      style={listMaxStyle(ctx.listHeight)}
      {...ctx.listboxAria}
      aria-multiselectable={ctx.multiple ? true : undefined}
      aria-busy={ctx.loading || undefined}
      onScroll={(event) => {
        const top = event.currentTarget.scrollTop
        if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => setScrollTop(top))
      }}>
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          {renderRows(ctx, visible, rows, startIndex)}
        </div>
      </div>
    </div>
  )
}

export function hasSelectOptionRows(ctx: SelectRenderContext): boolean {
  return buildSelectListRows(ctx.filteredOptions, ctx.creatableOption).some(
    (row) => row.kind === 'option'
  )
}

export function renderSelectPanelBody(ctx: SelectRenderContext): React.ReactNode {
  const rows = buildSelectListRows(ctx.filteredOptions, ctx.creatableOption)
  if (!rows.some((row) => row.kind === 'option')) return null
  if (ctx.virtual || shouldVirtualizeSelectList({ rowCount: rows.length, listHeight: ctx.listHeight, size: ctx.size, rows })) {
    return <VirtualSelectRows ctx={ctx} rows={rows} />
  }
  return (
    <div
      className={selectListboxClasses}
      style={listMaxStyle(ctx.listHeight)}
      {...ctx.listboxAria}
      aria-multiselectable={ctx.multiple ? true : undefined}
      aria-busy={ctx.loading || undefined}>
      {renderRows(ctx, rows)}
    </div>
  )
}

export function renderSelectEmpty(ctx: SelectRenderContext): React.ReactNode {
  return (
    <div className={selectEmptyStateClasses}>{ctx.loading ? ctx.loadingText : ctx.emptyText}</div>
  )
}

export type { SelectOption }
