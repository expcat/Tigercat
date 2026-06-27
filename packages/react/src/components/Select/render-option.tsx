import React from 'react'
import {
  getSelectOptionClasses,
  selectGroupLabelClasses,
  selectEmptyStateClasses,
  isOptionGroup,
  getPickerOptionAria,
  getCreateSelectOptionLabel,
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

export function renderOptions(ctx: SelectContext): React.ReactNode {
  if (!ctx.hasOptions && !ctx.creatableOption) {
    return (
      <div className={selectEmptyStateClasses}>
        {ctx.optionsLength === 0 ? ctx.noDataText : ctx.noOptionsText}
      </div>
    )
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
