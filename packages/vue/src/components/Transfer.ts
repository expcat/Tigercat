import { defineComponent, h, ref, computed, type PropType } from 'vue'
import type { TransferItem, TransferSearchValue, ComponentSize } from '@expcat/tigercat-core'
import {
  transferBaseClasses,
  transferPanelClasses,
  transferPanelHeaderClasses,
  transferPanelBodyClasses,
  transferSearchClasses,
  transferEmptyClasses,
  transferOperationClasses,
  getTransferItemClasses,
  getTransferCheckboxClasses,
  getTransferButtonClasses,
  splitTransferData,
  filterTransferItems,
  moveTransferItems,
  getPickerListboxAria,
  getPickerOptionAria,
  coerceClassValue,
  classNames,
  icon20ViewBox,
  chevronLeftSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  resolveLocaleText,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import type { TigerLocale } from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

function ArrowIcon(pathD: string) {
  return h(
    'svg',
    {
      class: 'w-4 h-4',
      viewBox: icon20ViewBox,
      fill: 'currentColor',
      xmlns: 'http://www.w3.org/2000/svg'
    },
    [
      h('path', {
        d: pathD,
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd'
      })
    ]
  )
}

export type VueTransferProps = InstanceType<typeof Transfer>['$props']

export const Transfer = defineComponent({
  name: 'TigerTransfer',
  props: {
    modelValue: {
      type: Array as PropType<(string | number)[]>,
      default: undefined
    },
    /**
     * Target keys alias (core/shared name). Used when `modelValue` /
     * `v-model` is not bound; `modelValue` takes priority.
     */
    targetKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined
    },
    dataSource: {
      type: Array as PropType<TransferItem[]>,
      default: () => []
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    },
    searchValue: {
      type: Object as PropType<TransferSearchValue>,
      default: undefined
    },
    defaultSearchValue: {
      type: Object as PropType<TransferSearchValue>,
      default: () => ({})
    },
    sourceTitle: {
      type: String,
      default: 'Source'
    },
    targetTitle: {
      type: String,
      default: 'Target'
    },
    emptyText: {
      type: String,
      default: undefined
    },
    filterOption: {
      type: Function as PropType<(inputValue: string, item: TransferItem) => boolean>,
      default: undefined
    },
    /**
     * Locale overrides merged on top of ConfigProvider locale
     */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:searchValue', 'change', 'search-change'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const sourceSelectedKeys = ref<Set<string | number>>(new Set())
    const targetSelectedKeys = ref<Set<string | number>>(new Set())
    const uncontrolledSearchValue = ref<TransferSearchValue>({ ...props.defaultSearchValue })
    const resolvedSearchValue = computed(() => props.searchValue ?? uncontrolledSearchValue.value)
    const sourceSearch = computed(() => resolvedSearchValue.value.source ?? '')
    const targetSearch = computed(() => resolvedSearchValue.value.target ?? '')

    function updateSearchValue(panel: keyof TransferSearchValue, value: string) {
      const next = { ...resolvedSearchValue.value, [panel]: value }
      if (props.searchValue === undefined) {
        uncontrolledSearchValue.value = next
      }
      emit('update:searchValue', next)
      emit('search-change', next)
    }

    // `modelValue` (v-model) takes priority; `targetKeys` is the shared alias.
    const resolvedTargetKeys = computed(() => props.modelValue ?? props.targetKeys ?? [])

    const computedData = computed(() =>
      splitTransferData(props.dataSource, resolvedTargetKeys.value)
    )

    const filteredSourceItems = computed(() =>
      filterTransferItems(computedData.value.sourceItems, sourceSearch.value, props.filterOption)
    )

    const filteredTargetItems = computed(() =>
      filterTransferItems(computedData.value.targetItems, targetSearch.value, props.filterOption)
    )

    const canMoveRight = computed(() => {
      if (props.disabled) return false
      for (const key of sourceSelectedKeys.value) {
        const item = props.dataSource.find((d) => d.key === key)
        if (item && !item.disabled) return true
      }
      return false
    })

    const canMoveLeft = computed(() => {
      if (props.disabled) return false
      for (const key of targetSelectedKeys.value) {
        const item = props.dataSource.find((d) => d.key === key)
        if (item && !item.disabled) return true
      }
      return false
    })

    function toggleSourceItem(key: string | number) {
      const next = new Set(sourceSelectedKeys.value)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      sourceSelectedKeys.value = next
    }

    function toggleTargetItem(key: string | number) {
      const next = new Set(targetSelectedKeys.value)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      targetSelectedKeys.value = next
    }

    function moveRight() {
      if (!canMoveRight.value) return
      const { targetKeys: newTargetKeys, movedKeys } = moveTransferItems(
        'right',
        resolvedTargetKeys.value,
        sourceSelectedKeys.value,
        props.dataSource
      )
      sourceSelectedKeys.value = new Set()
      emit('update:modelValue', newTargetKeys)
      emit('change', newTargetKeys, 'right', movedKeys)
    }

    function moveLeft() {
      if (!canMoveLeft.value) return
      const { targetKeys: newTargetKeys, movedKeys } = moveTransferItems(
        'left',
        resolvedTargetKeys.value,
        targetSelectedKeys.value,
        props.dataSource
      )
      targetSelectedKeys.value = new Set()
      emit('update:modelValue', newTargetKeys)
      emit('change', newTargetKeys, 'left', movedKeys)
    }

    function renderPanel(
      title: string,
      items: TransferItem[],
      selectedKeys: Set<string | number>,
      toggleFn: (key: string | number) => void,
      searchValue: string,
      onSearchInput: (val: string) => void
    ) {
      return h('div', { class: transferPanelClasses, role: 'group', 'aria-label': title }, [
        // Header
        h('div', { class: transferPanelHeaderClasses }, [
          h(
            'span',
            { class: 'font-medium text-[var(--tiger-transfer-title,var(--tiger-text,#111827))]' },
            `${title} (${items.length})`
          )
        ]),

        // Search
        props.searchable
          ? h('input', {
              type: 'text',
              class: transferSearchClasses,
              placeholder: resolveLocaleText(
                'Search...',
                mergedLocale.value?.common?.searchPlaceholder
              ),
              value: searchValue,
              'aria-label': `Search ${title}`,
              onInput: (e: Event) => onSearchInput((e.target as HTMLInputElement).value)
            })
          : null,

        // Body
        h(
          'div',
          {
            class: transferPanelBodyClasses,
            ...getPickerListboxAria({ label: `${title} items` })
          },
          items.length > 0
            ? items.map((item) => {
                const isSelected = selectedKeys.has(item.key)
                const isDisabled = props.disabled || !!item.disabled
                return h(
                  'label',
                  {
                    key: item.key,
                    class: getTransferItemClasses(isSelected, isDisabled, props.size),
                    ...getPickerOptionAria({ selected: isSelected, disabled: isDisabled })
                  },
                  [
                    h('input', {
                      type: 'checkbox',
                      class: getTransferCheckboxClasses(props.size),
                      checked: isSelected,
                      disabled: isDisabled,
                      onChange: () => {
                        if (!isDisabled) toggleFn(item.key)
                      }
                    }),
                    h('span', { class: 'flex-1 truncate' }, item.label)
                  ]
                )
              })
            : [
                h(
                  'div',
                  { class: transferEmptyClasses },
                  resolveLocaleText(
                    'No data',
                    props.emptyText,
                    mergedLocale.value?.common?.emptyText
                  )
                )
              ]
        )
      ])
    }

    return () => {
      const containerClasses = classNames(transferBaseClasses, coerceClassValue(attrs.class))

      return h('div', { class: containerClasses }, [
        // Source panel
        renderPanel(
          props.sourceTitle,
          filteredSourceItems.value,
          sourceSelectedKeys.value,
          toggleSourceItem,
          sourceSearch.value,
          (value) => updateSearchValue('source', value)
        ),

        // Operation buttons
        h('div', { class: transferOperationClasses }, [
          h(
            'button',
            {
              type: 'button',
              class: getTransferButtonClasses(!canMoveRight.value),
              disabled: !canMoveRight.value,
              'aria-label': 'Move selected to target',
              onClick: moveRight
            },
            [ArrowIcon(chevronRightSolidIcon20PathD)]
          ),
          h(
            'button',
            {
              type: 'button',
              class: getTransferButtonClasses(!canMoveLeft.value),
              disabled: !canMoveLeft.value,
              'aria-label': 'Move selected to source',
              onClick: moveLeft
            },
            [ArrowIcon(chevronLeftSolidIcon20PathD)]
          )
        ]),

        // Target panel
        renderPanel(
          props.targetTitle,
          filteredTargetItems.value,
          targetSelectedKeys.value,
          toggleTargetItem,
          targetSearch.value,
          (value) => updateSearchValue('target', value)
        )
      ])
    }
  }
})

export default Transfer
