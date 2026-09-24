import { defineComponent, h, ref, type PropType } from 'vue'
import {
  filterAssignees,
  getW9DataLabels,
  nextListboxIndex,
  toggleAssignee,
  type AssigneeOption
} from '@expcat/tigercat-core'

export const AssigneePicker = defineComponent({
  name: 'TigerAssigneePicker',
  props: {
    options: { type: Array as PropType<AssigneeOption[]>, default: () => [] },
    selectedIds: { type: Array as PropType<string[]>, default: () => [] },
    locale: { type: String, default: undefined }
  },
  emits: ['update:selectedIds', 'change'],
  setup(props, { emit }) {
    const query = ref('')
    const active = ref(0)
    const labels = () => getW9DataLabels(props.locale)
    const emitIds = (ids: string[]) => {
      emit('update:selectedIds', ids)
      emit('change', ids)
    }
    return () => {
      const filtered = filterAssignees(props.options, query.value)
      const onKeyDown = (event: KeyboardEvent) => {
        const next = nextListboxIndex(active.value, event.key, filtered.length)
        if (next !== active.value) {
          event.preventDefault()
          active.value = next
          return
        }
        if ((event.key === 'Enter' || event.key === ' ') && filtered[active.value]) {
          event.preventDefault()
          emitIds(toggleAssignee(props.selectedIds, filtered[active.value].id))
        }
      }
      return h('div', [
        h('input', {
          type: 'search',
          value: query.value,
          'aria-label': labels().assigneeList,
          onInput: (event: Event) => {
            query.value = (event.target as HTMLInputElement).value
            active.value = 0
          }
        }),
        filtered.length === 0
          ? h('p', labels().emptyDirectory)
          : h(
              'div',
              {
                role: 'listbox',
                'aria-label': labels().assigneeList,
                'aria-multiselectable': 'true',
                tabindex: 0,
                onKeydown: onKeyDown
              },
              filtered.map((option, index) =>
                h(
                  'div',
                  {
                    key: option.id,
                    role: 'option',
                    id: `tiger-assignee-${option.id}`,
                    'aria-selected': props.selectedIds.includes(option.id) ? 'true' : 'false',
                    'data-active': index === active.value ? 'true' : undefined,
                    onClick: () => emitIds(toggleAssignee(props.selectedIds, option.id))
                  },
                  `${option.name}${option.department ? ` · ${option.department}` : ''}`
                )
              )
            )
      ])
    }
  }
})
