import React, { useEffect, useRef, useState } from 'react'
import {
  getSelectOptionClasses,
  selectEmptyStateClasses,
  selectGroupLabelClasses,
  selectListboxClasses,
  getCreateSelectOptionLabel,
  getPickerOptionAria,
  getSelectVirtualItemHeight,
  getSelectVirtualRange,
  getSelectActiveAlignScrollTop,
  getSelectRowIndexForOption,
  buildSelectListRows,
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
          <span className="truncate">{displayLabel}</span>
          {selected ? <SelectCheckIcon /> : null}
        </span>
      )}
    </div>
  )
}

function renderRows(ctx: SelectRenderContext, rows: SelectListRow[]) {
  return rows.map((row) => {
    if (row.kind === 'group') {
      return (
        <div key={row.key} role="group" aria-label={row.label}>
          <div className={selectGroupLabelClasses} aria-hidden="true">
            {row.label}
          </div>
        </div>
      )
    }
    return <OptionRow key={row.key} ctx={ctx} row={row} />
  })
}

function VirtualSelectRows({ ctx, rows }: { ctx: SelectRenderContext; rows: SelectListRow[] }) {
  const itemHeight = getSelectVirtualItemHeight(ctx.size)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)
  const { startIndex, endIndex, totalHeight } = getSelectVirtualRange(
    scrollTop,
    ctx.listHeight,
    rows.length,
    itemHeight
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el || ctx.activeIndex < 0) return
    const rowIndex = getSelectRowIndexForOption(rows, ctx.activeIndex)
    const next = getSelectActiveAlignScrollTop({
      scrollTop: el.scrollTop,
      listHeight: ctx.listHeight,
      rowIndex,
      itemHeight
    })
    if (next !== el.scrollTop) {
      el.scrollTop = next
      setScrollTop(next)
    }
  }, [ctx.activeIndex, ctx.listHeight, itemHeight, rows])

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
      style={{ maxHeight: `${ctx.listHeight}px` }}
      {...ctx.listboxAria}
      aria-multiselectable={ctx.multiple ? true : undefined}
      aria-busy={ctx.loading || undefined}
      onScroll={(event) => {
        const top = event.currentTarget.scrollTop
        if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => setScrollTop(top))
      }}>
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {renderRows(ctx, visible)}
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
  if (ctx.virtual) return <VirtualSelectRows ctx={ctx} rows={rows} />
  return (
    <div
      className={selectListboxClasses}
      style={{ maxHeight: `${ctx.listHeight}px` }}
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
