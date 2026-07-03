import React from 'react'
import {
  classNames,
  selectDropdownBaseClasses,
  selectSearchInputClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses
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
        className={classNames(ctx.triggerClasses, ctx.showClearButton ? 'pr-14' : 'pr-9')}
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
      </button>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1">
        {ctx.showClearButton && (
          <button
            type="button"
            className="pointer-events-auto inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-select-ring,var(--tiger-primary,#2563eb))]"
            data-tiger-select-clear
            aria-label={ctx.clearAriaLabel}
            onClick={ctx.clearSelection}>
            <SelectClearIcon />
          </button>
        )}
        <span className={classNames('inline-flex', ctx.isOpen && 'rotate-180')} aria-hidden="true">
          <SelectChevronIcon />
        </span>
      </span>

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
          <div className={selectDoneActionClasses}>
            <button
              type="button"
              className={selectDoneButtonClasses}
              onClick={ctx.closeDropdown}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation()
                }
              }}>
              {ctx.doneText}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
