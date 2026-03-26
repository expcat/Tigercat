import { defineComponent, h, ref, computed, type PropType } from 'vue'
import type { TransferItem, TransferSize } from '@expcat/tigercat-core'
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
  coerceClassValue,
  classNames,
  icon20ViewBox,
  chevronLeftSolidIcon20PathD,
  chevronRightSolidIcon20PathD
} from '@expcat/tigercat-core'

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
      default: () => []
    },
    dataSource: {
      type: Array as PropType<TransferItem[]>,
      default: () => []
    },
    size: {
      type: String as PropType<TransferSize>,
      default: 'md'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    sourceTitle: {
      type: String,
      default: 'Source'
    },
    targetTitle: {
      type: String,
      default: 'Target'
    },
    notFoundText: {
      type: String,
      default: 'No data'
    },
    filterOption: {
      type: Function as PropType<(inputValue: string, item: TransferItem) => boolean>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const sourceSelectedKeys = ref<Set<string | number>>(new Set())
    const targetSelectedKeys = ref<Set<string | number>>(new Set())
    const sourceSearch = ref('')
    const targetSearch = ref('')

    const { sourceItems, targetItems } = computed(() =>
      splitTransferData(props.dataSource, props.modelValue)
    ).value

    const computedData = computed(() => splitTransferData(props.dataSource, props.modelValue))

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
      const keysToMove = [...sourceSelectedKeys.value].filter((key) => {
        const item = props.dataSource.find((d) => d.key === key)
        return item && !item.disabled
      })
      const newTargetKeys = [...props.modelValue, ...keysToMove]
      sourceSelectedKeys.value = new Set()
      emit('update:modelValue', newTargetKeys)
      emit('change', newTargetKeys, 'right', keysToMove)
    }

    function moveLeft() {
      if (!canMoveLeft.value) return
      const keysToRemove = new Set(
        [...targetSelectedKeys.value].filter((key) => {
          const item = props.dataSource.find((d) => d.key === key)
          return item && !item.disabled
        })
      )
      const newTargetKeys = props.modelValue.filter((k) => !keysToRemove.has(k))
      targetSelectedKeys.value = new Set()
      emit('update:modelValue', newTargetKeys)
      emit('change', newTargetKeys, 'left', [...keysToRemove])
    }

    function renderPanel(
      title: string,
      items: TransferItem[],
      selectedKeys: Set<string | number>,
      toggleFn: (key: string | number) => void,
      searchValue: string,
      onSearch: (val: string) => void
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
        props.showSearch
          ? h('input', {
              type: 'text',
              class: transferSearchClasses,
              placeholder: 'Search...',
              value: searchValue,
              'aria-label': `Search ${title}`,
              onInput: (e: Event) => onSearch((e.target as HTMLInputElement).value)
            })
          : null,

        // Body
        h(
          'div',
          { class: transferPanelBodyClasses, role: 'listbox' },
          items.length > 0
            ? items.map((item) => {
                const isSelected = selectedKeys.has(item.key)
                const isDisabled = props.disabled || !!item.disabled
                return h(
                  'label',
                  {
                    key: item.key,
                    class: getTransferItemClasses(isSelected, isDisabled, props.size),
                    role: 'option',
                    'aria-selected': isSelected,
                    'aria-disabled': isDisabled
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
            : [h('div', { class: transferEmptyClasses }, props.notFoundText)]
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
          (val) => {
            sourceSearch.value = val
          }
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
          (val) => {
            targetSearch.value = val
          }
        )
      ])
    }
  }
})

export default Transfer
