import { defineComponent, h, ref, type PropType } from 'vue'
import {
  getW9DataLabels,
  resolveFormattedExportRows,
  resolveTableSelectLoadedKeys,
  selectionAnnouncement,
  shiftSelectTableKeys,
  type TableColumn
} from '@expcat/tigercat-core'

export const TableW9Panel = defineComponent({
  name: 'TigerTableW9Panel',
  props: {
    active: { type: Boolean, default: false },
    columns: { type: Array as PropType<TableColumn[]>, default: () => [] },
    sorts: {
      type: Array as PropType<{ key: string; direction: 'asc' | 'desc' }[]>,
      default: () => []
    },
    pageKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    loadedKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    disabledKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    pageRecords: { type: Array as PropType<Record<string, unknown>[]>, default: () => [] },
    processedRecords: { type: Array as PropType<Record<string, unknown>[]>, default: () => [] },
    processedKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    selectedKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    remote: { type: Boolean, default: false },
    onSort: { type: Function as PropType<(key: string) => void>, default: undefined },
    onFilter: { type: Function as PropType<(key: string, value: string) => void>, default: undefined },
    onHide: { type: Function as PropType<(key: string) => void>, default: undefined },
    onResize: { type: Function as PropType<(key: string, width: number) => void>, default: undefined },
    onSelection: {
      type: Function as PropType<(keys: (string | number)[], announcement: string) => void>,
      default: undefined
    },
    onRemoteSelect: { type: Function as PropType<() => void>, default: undefined },
    onWidths: { type: Function as PropType<() => void>, default: undefined }
  },
  setup(props) {
    const draft = ref('')
    const anchor = ref<string | number | null>(null)
    const previousCount = ref<number | null>(null)
    const live = ref('')
    const exportText = ref('')
    const labels = getW9DataLabels()

    function announce(keys: (string | number)[]) {
      const text = selectionAnnouncement(
        previousCount.value,
        keys.length,
        labels.selectionCount
      )
      previousCount.value = keys.length
      if (text) live.value = text
      props.onSelection?.(keys, live.value)
    }

    return () => {
      if (!props.active) return null
      const filterKey = props.columns[0]?.key
      return h('div', { 'data-tiger-header-menu': '' }, [
        h(
          'form',
          {
            'data-tiger-filter-menu': '',
            onSubmit: (event: Event) => {
              event.preventDefault()
              if (filterKey) props.onFilter?.(filterKey, draft.value)
            }
          },
          [
            h('input', {
              'aria-label': labels.filterMenu,
              value: draft.value,
              onInput: (event: Event) => {
                draft.value = (event.target as HTMLInputElement).value
              }
            }),
            h('button', { type: 'submit' }, labels.filterApply)
          ]
        ),
        ...props.columns.map((column) =>
          h(
            'button',
            {
              type: 'button',
              key: `sort-${column.key}`,
              'data-tiger-sort': column.key,
              'data-sort-direction': props.sorts.find((level) => level.key === column.key)?.direction,
              onClick: () => props.onSort?.(column.key)
            },
            column.title || column.key
          )
        ),
        ...props.columns.map((column) =>
          h(
            'button',
            {
              type: 'button',
              key: `hide-${column.key}`,
              'data-tiger-hide': column.key,
              onClick: () => props.onHide?.(column.key)
            },
            column.key
          )
        ),
        ...props.columns.map((column) =>
          h('input', {
            key: `resize-${column.key}`,
            type: 'range',
            'data-tiger-resize': column.key,
            'aria-label': labels.columnDragHandle,
            min: '40',
            max: '400',
            value: '120',
            onChange: (event: Event) => {
              props.onResize?.(column.key, Number((event.target as HTMLInputElement).value))
            }
          })
        ),
        h(
          'button',
          {
            type: 'button',
            'data-tiger-select-page': '',
            onClick: () => {
              const disabled = new Set(props.disabledKeys.map(String))
              announce(props.pageKeys.filter((key) => !disabled.has(String(key))))
            }
          },
          labels.selectThisPage
        ),
        h(
          'button',
          {
            type: 'button',
            'data-tiger-select-loaded': '',
            onClick: () => {
              const result = resolveTableSelectLoadedKeys({
                remote: props.remote,
                selectedKeys: props.selectedKeys,
                loadedSelectableKeys: props.loadedKeys,
                checked: true
              })
              if (result.emitOnly) {
                props.onRemoteSelect?.()
                return
              }
              announce(result.keys)
            }
          },
          labels.selectLoadedRows
        ),
        h(
          'button',
          {
            type: 'button',
            'data-tiger-select-remote': '',
            onClick: () => props.onRemoteSelect?.()
          },
          labels.selectAllRemote
        ),
        ...props.pageKeys.map((key) =>
          h(
            'button',
            {
              type: 'button',
              key: `shift-${key}`,
              'data-tiger-shift-key': String(key),
              onClick: (event: MouseEvent) => {
                if (event.shiftKey) {
                  announce(
                    shiftSelectTableKeys({
                      orderedKeys: props.pageKeys,
                      anchor: anchor.value,
                      target: key,
                      disabledKeys: props.disabledKeys
                    })
                  )
                  return
                }
                anchor.value = key
                announce([key])
              }
            },
            String(key)
          )
        ),
        ...(['page', 'selected', 'all'] as const).map((scope) =>
          h(
            'button',
            {
              type: 'button',
              key: `export-${scope}`,
              'data-tiger-export-scope': scope,
              onClick: () => {
                const formatted = resolveFormattedExportRows({
                  scope,
                  pageRecords: props.pageRecords,
                  processedRecords: props.processedRecords,
                  processedKeys: props.processedKeys,
                  selectedKeys: props.selectedKeys,
                  columns: props.columns
                })
                exportText.value = formatted.rows.map((row) => row.join(',')).join('\n')
              }
            },
            scope
          )
        ),
        h('div', { role: 'status', 'data-tiger-selection-live': '' }, live.value),
        h('pre', { 'data-tiger-export-text': '' }, exportText.value)
      ])
    }
  }
})
