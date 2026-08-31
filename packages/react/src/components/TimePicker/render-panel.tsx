import React from 'react'
import {
  classNames,
  getTimePickerItemClasses,
  getTimePickerMobileSelectRowClasses,
  timePickerColumnClasses,
  timePickerColumnHeaderClasses,
  timePickerColumnListClasses,
  timePickerDesktopColumnsClasses,
  timePickerMobileSelectClasses,
  type TimePickerColumnModel,
  type TimePickerFocusUnit
} from '@expcat/tigercat-core'

export function TimePickerDesktopColumns({
  columns,
  onSelect,
  onKeyDown
}: {
  columns: TimePickerColumnModel[]
  onSelect: (unit: TimePickerFocusUnit, option: number | 'AM' | 'PM') => void
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
}) {
  return (
    <div className={timePickerDesktopColumnsClasses}>
      {columns.map((column) => {
        const active =
          column.options.find((option) => option.selected) ??
          column.options.find((option) => !option.disabled)
        return (
          <div key={column.unit} className={timePickerColumnClasses}>
            <div id={column.headerId} className={timePickerColumnHeaderClasses}>
              {column.label}
            </div>
            <div
              id={column.listId}
              role="listbox"
              aria-labelledby={column.headerId}
              aria-activedescendant={
                active ? `${column.listId}-${String(active.value)}` : undefined
              }
              className={timePickerColumnListClasses}
              onKeyDown={onKeyDown}>
              {column.options.map((option) => {
                const selected = option.selected
                const tabIndex = option.disabled ? -1 : selected || option === active ? 0 : -1
                return (
                  <div
                    key={String(option.value)}
                    id={`${column.listId}-${String(option.value)}`}
                    role="option"
                    tabIndex={tabIndex}
                    aria-selected={selected}
                    aria-disabled={option.disabled || undefined}
                    aria-label={option.ariaLabel}
                    data-tiger-timepicker-unit={column.unit}
                    className={getTimePickerItemClasses(selected, option.disabled)}
                    onClick={() => {
                      if (!option.disabled) onSelect(column.unit, option.value)
                    }}>
                    {option.label}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TimePickerMobileSelects({
  columns,
  onSelect
}: {
  columns: TimePickerColumnModel[]
  onSelect: (unit: TimePickerFocusUnit, option: number | 'AM' | 'PM') => void
}) {
  const count = columns.length as 2 | 3 | 4
  return (
    <div className={getTimePickerMobileSelectRowClasses(count)}>
      {columns.map((column) => {
        const selected = column.options.find((option) => option.selected)
        return (
          <select
            key={column.unit}
            className={classNames(timePickerMobileSelectClasses)}
            aria-label={column.label}
            value={selected ? String(selected.value) : ''}
            onChange={(event) => {
              const raw = event.target.value
              const option = column.unit === 'period' ? (raw as 'AM' | 'PM') : Number(raw)
              onSelect(column.unit, option)
            }}>
            {!selected ? <option value="" disabled /> : null}
            {column.options.map((option) => (
              <option
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        )
      })}
    </div>
  )
}
