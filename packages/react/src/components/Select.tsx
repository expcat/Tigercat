import React from 'react'
import {
  classNames,
  selectDropdownBaseClasses,
  selectSearchInputClasses
} from '@expcat/tigercat-core'
import { useSelectState } from './Select/state'
import { renderOptions } from './Select/render-option'
import { SelectClearIcon, SelectChevronIcon } from './Select/icons'
import type { SelectProps } from './Select/types'

export type {
  SelectBaseProps,
  SelectSingleProps,
  SelectMultipleProps,
  SelectProps
} from './Select/types'

export const Select: React.FC<SelectProps> = (props) => {
  const ctx = useSelectState(props)

  return (
    <div {...ctx.divProps} className={ctx.containerClasses}>
      <button
        ref={ctx.triggerRef}
        type="button"
        className={ctx.triggerClasses}
        disabled={ctx.disabled}
        onClick={ctx.toggleDropdown}
        onKeyDown={ctx.handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={ctx.isOpen}
        aria-controls={ctx.listboxId}
        aria-activedescendant={
          ctx.isOpen && ctx.activeIndex >= 0 ? ctx.getOptionId(ctx.activeIndex) : undefined
        }
        data-state={ctx.isOpen ? 'open' : 'closed'}>
        <span
          className={classNames(
            'flex-1 text-left truncate',
            ctx.displayText === ctx.placeholder &&
              'text-[var(--tiger-select-placeholder,var(--tiger-text-muted,#9ca3af))]'
          )}>
          {ctx.displayText}
        </span>
        <span className="flex items-center gap-1">
          {ctx.showClearButton && (
            <span
              className="inline-flex"
              data-tiger-select-clear
              aria-label={ctx.clearAriaLabel}
              onClick={ctx.clearSelection}>
              <SelectClearIcon />
            </span>
          )}
          <span className={classNames('inline-flex', ctx.isOpen && 'rotate-180')}>
            <SelectChevronIcon />
          </span>
        </span>
      </button>

      {ctx.isOpen && (
        <div
          ref={ctx.dropdownRef}
          className={selectDropdownBaseClasses}
          role="listbox"
          id={ctx.listboxId}
          aria-multiselectable={ctx.isMultiple ? true : undefined}
          onKeyDown={ctx.handleDropdownKeyDown}>
          {ctx.searchable && (
            <input
              ref={ctx.searchInputRef}
              type="text"
              className={selectSearchInputClasses}
              placeholder={ctx.searchPlaceholder}
              value={ctx.searchQuery}
              onChange={ctx.handleSearchInput}
              onKeyDown={ctx.handleSearchKeyDown}
            />
          )}
          {renderOptions(ctx)}
        </div>
      )}
    </div>
  )
}
