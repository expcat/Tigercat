import { computed, defineComponent, h, ref, useId, type PropType } from 'vue'
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

export type VueAssigneePickerProps = InstanceType<typeof AssigneePicker>['$props']

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
    const instanceId = useId()
    const listboxId = `tiger-assignee-${instanceId}`
    const getOptionId = (id: string) => `${listboxId}-${id}`
    const filtered = computed(() => filterAssignees(props.options, query.value))
    const activeIndex = computed(() => {
      if (filtered.value.length === 0) return -1
      return Math.min(Math.max(active.value, 0), filtered.value.length - 1)
    })
    const activeOption = computed(() =>
      activeIndex.value >= 0 ? filtered.value[activeIndex.value] : undefined
    )
    const labels = () => getW9DataLabels(props.locale)
    const emitIds = (ids: string[]) => {
      emit('update:selectedIds', ids)
      emit('change', ids)
    }
    return () => {
      const onKeyDown = (event: KeyboardEvent) => {
        const next = nextListboxIndex(activeIndex.value, event.key, filtered.value.length)
        if (next !== activeIndex.value) {
          event.preventDefault()
          active.value = next
          return
        }
        if ((event.key === 'Enter' || event.key === ' ') && activeOption.value) {
          event.preventDefault()
          emitIds(toggleAssignee(props.selectedIds, activeOption.value.id))
        }
      }
      return h(
        'div',
        { class: getSpaceClasses({ orientation: 'vertical', size: 'sm', align: 'stretch' }) },
        [
          h('input', {
            type: 'search',
            class: getInputClasses({ size: 'sm' }),
            value: query.value,
            'aria-label': labels().assigneeList,
            onInput: (event: Event) => {
              query.value = (event.target as HTMLInputElement).value
              active.value = 0
            }
          }),
          filtered.value.length === 0
            ? h('p', { class: selectEmptyStateClasses }, labels().emptyDirectory)
            : h(
                'div',
                {
                  class: classNames(selectDropdownBaseClasses, focusRingInsetClasses),
                  role: 'listbox',
                  'aria-label': labels().assigneeList,
                  'aria-multiselectable': 'true',
                  'aria-activedescendant': activeOption.value
                    ? getOptionId(activeOption.value.id)
                    : undefined,
                  tabindex: 0,
                  onKeydown: onKeyDown
                },
                filtered.value.map((option, index) =>
                  h(
                    'div',
                    {
                      key: option.id,
                      class: getSelectOptionClasses({
                        isSelected: props.selectedIds.includes(option.id),
                        isDisabled: false,
                        isActive: index === activeIndex.value,
                        size: 'sm'
                      }),
                      role: 'option',
                      id: getOptionId(option.id),
                      'aria-selected': props.selectedIds.includes(option.id) ? 'true' : 'false',
                      'data-active': index === activeIndex.value ? 'true' : undefined,
                      onClick: () => emitIds(toggleAssignee(props.selectedIds, option.id))
                    },
                    `${option.name}${option.department ? ` · ${option.department}` : ''}`
                  )
                )
              )
        ]
      )
    }
  }
})
