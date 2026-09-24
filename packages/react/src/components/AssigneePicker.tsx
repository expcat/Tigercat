import React, { useState } from 'react'
import {
  filterAssignees,
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
  const labels = getW9DataLabels(locale)
  const filtered = filterAssignees(options, query)
  const emitIds = (ids: string[]) => onChange?.(ids)
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const next = nextListboxIndex(active, event.key, filtered.length)
    if (next !== active) {
      event.preventDefault()
      setActive(next)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && filtered[active]) {
      event.preventDefault()
      emitIds(toggleAssignee(selectedIds, filtered[active].id))
    }
  }
  return (
    <div>
      <input
        type="search"
        value={query}
        aria-label={labels.assigneeList}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
      />
      {filtered.length === 0 ? (
        <p>{labels.emptyDirectory}</p>
      ) : (
        <div
          role="listbox"
          aria-label={labels.assigneeList}
          aria-multiselectable="true"
          tabIndex={0}
          onKeyDown={onKeyDown}>
          {filtered.map((option, index) => (
            <div
              key={option.id}
              role="option"
              id={`tiger-assignee-${option.id}`}
              aria-selected={selectedIds.includes(option.id)}
              data-active={index === active ? 'true' : undefined}
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
