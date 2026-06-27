import React, { useEffect, useRef, useState } from 'react'
import {
  getSelectOptionClasses,
  selectGroupLabelClasses,
  selectEmptyStateClasses,
  isOptionGroup,
  getPickerOptionAria,
  getCreateSelectOptionLabel,
  getSelectVirtualItemHeight,
  fixedSizeStrategy,
  type SelectOption
} from '@expcat/tigercat-core'
import { SelectCheckIcon } from './icons'
import type { SelectContext } from './types'

export function renderOption(
  ctx: SelectContext,
  option: SelectOption,
  index: number,
  displayLabel = option.label
): React.ReactNode {
  const optionSelected = ctx.isSelected(option)
  const optionActive = index === ctx.activeIndex
  const optionAria = getPickerOptionAria({
    selected: optionSelected,
    disabled: !!option.disabled
  })

  return (
    <div
      key={option.value}
      id={ctx.getOptionId(index)}
      data-option-index={index}
      {...optionAria}
      tabIndex={optionActive ? 0 : -1}
      className={getSelectOptionClasses(optionSelected, !!option.disabled, ctx.size)}
      onMouseEnter={() => {
        if (!option.disabled) {
          ctx.setActiveIndex(index)
        }
      }}
      onClick={() => ctx.selectOption(option)}>
      <span className="flex items-center justify-between w-full">
        <span>{displayLabel}</span>
        {optionSelected && <SelectCheckIcon />}
      </span>
    </div>
  )
}

/**
 * Virtualized flat-option list. Renders only the options inside the scroll
 * window (height = `listHeight`) and follows the active index with the keyboard.
 */
const VirtualSelectOptions: React.FC<{ ctx: SelectContext; options: SelectOption[] }> = ({
  ctx,
  options
}) => {
  const itemHeight = getSelectVirtualItemHeight(ctx.size)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const strategy = fixedSizeStrategy(itemHeight)
  const { startIndex, endIndex, totalHeight } = strategy.getRange(
    scrollTop,
    ctx.listHeight,
    options.length,
    5
  )

  // Keep the active option within the scroll window during keyboard navigation.
  useEffect(() => {
    const el = containerRef.current
    if (!el || ctx.activeIndex < 0) return
    const top = ctx.activeIndex * itemHeight
    if (top < el.scrollTop) el.scrollTop = top
    else if (top + itemHeight > el.scrollTop + ctx.listHeight)
      el.scrollTop = top + itemHeight - ctx.listHeight
  }, [ctx.activeIndex, itemHeight, ctx.listHeight])

  const visible: React.ReactNode[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    visible.push(renderOption(ctx, options[i], i))
  }

  return (
    <div
      ref={containerRef}
      data-tiger-select-virtual=""
      style={{ maxHeight: `${ctx.listHeight}px`, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>{visible}</div>
      </div>
    </div>
  )
}

export function renderOptions(ctx: SelectContext): React.ReactNode {
  if (!ctx.hasOptions && !ctx.creatableOption) {
    return (
      <div className={selectEmptyStateClasses}>
        {ctx.optionsLength === 0 ? ctx.noDataText : ctx.noOptionsText}
      </div>
    )
  }

  // Virtual mode: only for flat option lists (no groups). Groups fall back to
  // full rendering.
  const hasGroups = ctx.filteredOptions.some(isOptionGroup)
  if (ctx.virtual && !hasGroups) {
    const flat = ctx.filteredOptions.filter((o): o is SelectOption => !isOptionGroup(o))
    const all = ctx.creatableOption ? [...flat, ctx.creatableOption] : flat
    return <VirtualSelectOptions ctx={ctx} options={all} />
  }

  let optionIndex = -1

  const optionNodes = ctx.filteredOptions.map((item) => {
    if (isOptionGroup(item)) {
      return (
        <div key={item.label}>
          <div className={selectGroupLabelClasses}>{item.label}</div>
          {item.options.map((option) => {
            optionIndex += 1
            return renderOption(ctx, option, optionIndex)
          })}
        </div>
      )
    }

    optionIndex += 1
    return renderOption(ctx, item, optionIndex)
  })

  if (ctx.creatableOption) {
    optionIndex += 1
    optionNodes.push(
      renderOption(
        ctx,
        ctx.creatableOption,
        optionIndex,
        getCreateSelectOptionLabel(ctx.creatableOption, ctx.createOptionText)
      )
    )
  }

  return optionNodes
}
