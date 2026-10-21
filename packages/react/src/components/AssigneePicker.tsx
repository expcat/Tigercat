import React, { useId, useState } from 'react'
import {
  filterAssignees,
  getInputClasses,
  getSelectOptionClasses,
  getSpaceClasses,
  selectDropdownBaseClasses,
  selectEmptyStateClasses,
  classNames,
  focusRingInsetClasses,
  getW9DataLabels,
  nextListboxIndex,
  toggleAssignee,
  type AssigneeOption
} from '@expcat/tigercat-core'

export interface AssigneePickerProps {
  options?: AssigneeOption[]
  selectedIds?: string[]
  locale?: string
  onChange?: (ids: string[]) => void
}

export function AssigneePicker({
  options = [],
  selectedIds = [],
  locale,
  onChange
}: AssigneePickerProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const instanceId = useId()
  const listboxId = `tiger-assignee-${instanceId}`
  const getOptionId = (id: string) => `${listboxId}-${id}`
  const labels = getW9DataLabels(locale)
  const filtered = filterAssignees(options, query)
  const activeIndex =
    filtered.length === 0 ? -1 : Math.min(Math.max(active, 0), filtered.length - 1)
  const activeOption = activeIndex >= 0 ? filtered[activeIndex] : undefined
  const emitIds = (ids: string[]) => onChange?.(ids)
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const next = nextListboxIndex(activeIndex, event.key, filtered.length)
    if (next !== activeIndex) {
      event.preventDefault()
      setActive(next)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && activeOption) {
      event.preventDefault()
      emitIds(toggleAssignee(selectedIds, activeOption.id))
    }
  }
  return (
    <div className={getSpaceClasses({ orientation: 'vertical', size: 'sm', align: 'stretch' })}>
      <input
        type="search"
        className={getInputClasses({ size: 'sm' })}
        value={query}
        aria-label={labels.assigneeList}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
      />
      {filtered.length === 0 ? (
        <p className={selectEmptyStateClasses}>{labels.emptyDirectory}</p>
      ) : (
        <div
          className={classNames(selectDropdownBaseClasses, focusRingInsetClasses)}
          role="listbox"
          aria-label={labels.assigneeList}
          aria-multiselectable="true"
          aria-activedescendant={activeOption ? getOptionId(activeOption.id) : undefined}
          tabIndex={0}
          onKeyDown={onKeyDown}>
          {filtered.map((option, index) => (
            <div
              key={option.id}
              className={getSelectOptionClasses({
                isSelected: selectedIds.includes(option.id),
                isDisabled: false,
                isActive: index === activeIndex,
                size: 'sm'
              })}
              role="option"
              id={getOptionId(option.id)}
              aria-selected={selectedIds.includes(option.id)}
              data-active={index === activeIndex ? 'true' : undefined}
              onClick={() => emitIds(toggleAssignee(selectedIds, option.id))}>
              {option.name}
              {option.department ? ` · ${option.department}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
