import { computed, defineComponent, h, ref, useId, type PropType } from 'vue'
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
  type AssigneePickerOption
} from '@expcat/tigercat-core'

import { useTigerConfig } from './tiger-config'

function revealAssigneeOption(id: string | undefined): void {
  if (!id || !isBrowser()) return
  document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
}

export type VueAssigneePickerProps = InstanceType<typeof AssigneePicker>['$props']

export const AssigneePicker = defineComponent({
  name: 'TigerAssigneePicker',
  props: {
    options: { type: Array as PropType<AssigneePickerOption[]>, default: () => [] },
    selectedIds: { type: Array as PropType<string[]>, default: () => [] },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
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
    const config = useTigerConfig()
    const emitIds = (ids: string[]) => {
      emit('update:selectedIds', ids)
      emit('change', ids)
    }
    return () => {
      const locale = mergeTigerLocale(config.value.locale, props.locale)
      const labels = getW9DataLabels(locale)
      const onKeyDown = (event: KeyboardEvent, fromSearch = false) => {
        const next = nextListboxIndex(activeIndex.value, event.key, filtered.value.length)
        if (next !== activeIndex.value) {
          event.preventDefault()
          active.value = next
          revealAssigneeOption(getOptionId(filtered.value[next].id))
          return
        }
        if ((event.key === 'Enter' || (!fromSearch && event.key === ' ')) && activeOption.value) {
          event.preventDefault()
          emitIds(toggleAssignee(props.selectedIds, activeOption.value.id))
        }
      }
      const listboxClass = classNames(
        selectDropdownBaseClasses.replace('overflow-hidden', ''),
        selectListboxClasses,
        focusRingInsetClasses,
        'max-h-60'
      )
      return h(
        'div',
        { class: getSpaceClasses({ orientation: 'vertical', size: 'sm', align: 'stretch' }) },
        [
          h('input', {
            type: 'search',
            class: getInputClasses({ size: 'sm' }),
            value: query.value,
            'aria-label': getCommonLabels(locale).searchPlaceholder,
            'aria-controls': filtered.value.length > 0 ? listboxId : undefined,
            'aria-activedescendant': activeOption.value
              ? getOptionId(activeOption.value.id)
              : undefined,
            onInput: (event: Event) => {
              query.value = (event.target as HTMLInputElement).value
              active.value = 0
            },
            onKeydown: (event: KeyboardEvent) => onKeyDown(event, true)
          }),
          props.selectedIds.length > 0
            ? h('p', formatW9Label(labels.selectionCount, { count: props.selectedIds.length }))
            : null,
          filtered.value.length === 0
            ? h(
                'p',
                { class: selectEmptyStateClasses },
                props.options.length === 0
                  ? labels.emptyDirectory
                  : getEmptyDescription('no-results', locale)
              )
            : h(
                'div',
                {
                  id: listboxId,
                  class: listboxClass,
                  role: 'listbox',
                  'aria-label': labels.assigneeList,
                  'aria-multiselectable': 'true',
                  'aria-activedescendant': activeOption.value
                    ? getOptionId(activeOption.value.id)
                    : undefined,
                  tabindex: 0,
                  onKeydown: (event: KeyboardEvent) => onKeyDown(event)
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
                      onClick: () => {
                        active.value = index
                        emitIds(toggleAssignee(props.selectedIds, option.id))
                      }
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
