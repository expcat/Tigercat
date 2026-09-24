import React, { useState } from 'react'
import {
  getW9DataLabels,
  resolveFormattedExportRows,
  resolveTableSelectLoadedKeys,
  selectionAnnouncement,
  shiftSelectTableKeys,
  type TableColumn
} from '@expcat/tigercat-core'

export interface TableW9PanelProps {
  active?: boolean
  columns: TableColumn[]
  sorts?: { key: string; direction: 'asc' | 'desc' }[]
  pageKeys: (string | number)[]
  loadedKeys: (string | number)[]
  disabledKeys?: (string | number)[]
  pageRecords: Record<string, unknown>[]
  processedRecords: Record<string, unknown>[]
  processedKeys: (string | number)[]
  selectedKeys: (string | number)[]
  remote?: boolean
  onSort?: (key: string) => void
  onFilter?: (key: string, value: string) => void
  onHide?: (key: string) => void
  onResize?: (key: string, width: number) => void
  onSelection?: (keys: (string | number)[], announcement: string) => void
  onRemoteSelect?: () => void
}

export function TableW9Panel({
  active = false,
  columns,
  sorts = [],
  pageKeys,
  loadedKeys,
  disabledKeys = [],
  pageRecords,
  processedRecords,
  processedKeys,
  selectedKeys,
  remote = false,
  onSort,
  onFilter,
  onHide,
  onResize,
  onSelection,
  onRemoteSelect
}: TableW9PanelProps) {
  const [draft, setDraft] = useState('')
  const [anchor, setAnchor] = useState<string | number | null>(null)
  const [previousCount, setPreviousCount] = useState<number | null>(null)
  const [live, setLive] = useState('')
  const [exportText, setExportText] = useState('')
  const labels = getW9DataLabels()
  if (!active) return null
  const filterKey = columns[0]?.key

  function announce(keys: (string | number)[]) {
    const text = selectionAnnouncement(previousCount, keys.length, labels.selectionCount)
    setPreviousCount(keys.length)
    if (text) setLive(text)
    onSelection?.(keys, text ?? live)
  }

  return (
    <div data-tiger-header-menu="">
      <form
        data-tiger-filter-menu=""
        onSubmit={(event) => {
          event.preventDefault()
          if (filterKey) onFilter?.(filterKey, draft)
        }}>
        <input
          aria-label={labels.filterMenu}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit">{labels.filterApply}</button>
      </form>
      {columns.map((column) => (
        <button
          type="button"
          key={`sort-${column.key}`}
          data-tiger-sort={column.key}
          data-sort-direction={sorts.find((level) => level.key === column.key)?.direction}
          onClick={() => onSort?.(column.key)}>
          {column.title || column.key}
        </button>
      ))}
      {columns.map((column) => (
        <button
          type="button"
          key={`hide-${column.key}`}
          data-tiger-hide={column.key}
          onClick={() => onHide?.(column.key)}>
          {column.key}
        </button>
      ))}
      {columns.map((column) => (
        <input
          key={`resize-${column.key}`}
          type="range"
          data-tiger-resize={column.key}
          aria-label={labels.columnDragHandle}
          min={40}
          max={400}
          defaultValue={120}
          onChange={(event) => onResize?.(column.key, Number(event.target.value))}
        />
      ))}
      <button
        type="button"
        data-tiger-select-page=""
        onClick={() => {
          const disabled = new Set(disabledKeys.map(String))
          announce(pageKeys.filter((key) => !disabled.has(String(key))))
        }}>
        {labels.selectThisPage}
      </button>
      <button
        type="button"
        data-tiger-select-loaded=""
        onClick={() => {
          const result = resolveTableSelectLoadedKeys({
            remote,
            selectedKeys,
            loadedSelectableKeys: loadedKeys,
            checked: true
          })
          if (result.emitOnly) {
            onRemoteSelect?.()
            return
          }
          announce(result.keys)
        }}>
        {labels.selectLoadedRows}
      </button>
      <button type="button" data-tiger-select-remote="" onClick={() => onRemoteSelect?.()}>
        {labels.selectAllRemote}
      </button>
      {pageKeys.map((key) => (
        <button
          type="button"
          key={`shift-${key}`}
          data-tiger-shift-key={String(key)}
          onClick={(event) => {
            if (event.shiftKey) {
              announce(
                shiftSelectTableKeys({
                  orderedKeys: pageKeys,
                  anchor,
                  target: key,
                  disabledKeys
                })
              )
              return
            }
            setAnchor(key)
            announce([key])
          }}>
          {String(key)}
        </button>
      ))}
      {(['page', 'selected', 'all'] as const).map((scope) => (
        <button
          type="button"
          key={`export-${scope}`}
          data-tiger-export-scope={scope}
          onClick={() => {
            const formatted = resolveFormattedExportRows({
              scope,
              pageRecords,
              processedRecords,
              processedKeys,
              selectedKeys,
              columns
            })
            setExportText(formatted.rows.map((row) => row.join(',')).join('\n'))
          }}>
          {scope}
        </button>
      ))}
      <div role="status" data-tiger-selection-live="">
        {live}
      </div>
      <pre data-tiger-export-text="">{exportText}</pre>
    </div>
  )
}
