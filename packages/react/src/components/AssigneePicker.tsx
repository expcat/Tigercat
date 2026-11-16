import React, { useId, useState } from 'react'
import {
  filterAssignees,
  formatW9Label,
  getCommonLabels,
  getEmptyDescription,
  getInputClasses,
  getSelectOptionClasses,
  getSpaceClasses,
  selectDropdownBaseClasses,
  selectEmptyStateClasses,
  selectListboxClasses,
  classNames,
  focusRingInsetClasses,
  getW9DataLabels,
  isBrowser,
  mergeTigerLocale,
  type TigerLocale,
  nextListboxIndex,
  toggleAssignee,
  type AssigneeOption
} from '@expcat/tigercat-core'

import { useTigerConfig } from './tiger-config'

function revealAssigneeOption(id: string | undefined): void {
  if (!id || !isBrowser()) return
  document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
}

export interface AssigneePickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  options?: AssigneeOption[]
  selectedIds?: string[]
  locale?: Partial<TigerLocale>
  onChange?: (ids: string[]) => void
}

export function AssigneePicker({
  options = [],
  selectedIds = [],
  locale,
  onChange,
  className,
  ...rest
}: AssigneePickerProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const instanceId = useId()
  const listboxId = `tiger-assignee-${instanceId}`
  const getOptionId = (id: string) => `${listboxId}-${id}`
  const config = useTigerConfig()
  const mergedLocale = mergeTigerLocale(config.locale, locale)
  const labels = getW9DataLabels(mergedLocale)
  const filtered = filterAssignees(options, query)
  const activeIndex =
    filtered.length === 0 ? -1 : Math.min(Math.max(active, 0), filtered.length - 1)
  const activeOption = activeIndex >= 0 ? filtered[activeIndex] : undefined
  const emitIds = (ids: string[]) => onChange?.(ids)
  const onKeyDown = (event: React.KeyboardEvent, fromSearch = false) => {
    const next = nextListboxIndex(activeIndex, event.key, filtered.length)
    if (next !== activeIndex) {
      event.preventDefault()
      setActive(next)
      revealAssigneeOption(getOptionId(filtered[next].id))
      return
    }
    if ((event.key === 'Enter' || (!fromSearch && event.key === ' ')) && activeOption) {
      event.preventDefault()
      emitIds(toggleAssignee(selectedIds, activeOption.id))
    }
  }
  const listboxClass = classNames(
    selectDropdownBaseClasses.replace('overflow-hidden', ''),
    selectListboxClasses,
    focusRingInsetClasses,
    'max-h-60'
  )
  return (
    <div
      {...rest}
      className={classNames(
        getSpaceClasses({ orientation: 'vertical', size: 'sm', align: 'stretch' }),
        className
      )}>
      <input
        type="search"
        className={getInputClasses({ size: 'sm' })}
        value={query}
        aria-label={getCommonLabels(mergedLocale).searchPlaceholder}
        aria-controls={filtered.length > 0 ? listboxId : undefined}
        aria-activedescendant={activeOption ? getOptionId(activeOption.id) : undefined}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
        onKeyDown={(event) => onKeyDown(event, true)}
      />
      {selectedIds.length > 0 ? (
        <p>{formatW9Label(labels.selectionCount, { count: selectedIds.length })}</p>
      ) : null}
      {filtered.length === 0 ? (
        <p className={selectEmptyStateClasses}>
          {options.length === 0
            ? labels.emptyDirectory
            : getEmptyDescription('no-results', mergedLocale)}
        </p>
      ) : (
        <div
          id={listboxId}
          className={listboxClass}
          role="listbox"
          aria-label={labels.assigneeList}
          aria-multiselectable="true"
          aria-activedescendant={activeOption ? getOptionId(activeOption.id) : undefined}
          tabIndex={0}
          onKeyDown={(event) => onKeyDown(event)}>
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
              onClick={() => {
                setActive(index)
                emitIds(toggleAssignee(selectedIds, option.id))
              }}>
              {option.name}
              {option.department ? ` · ${option.department}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
