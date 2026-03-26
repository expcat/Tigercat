import { defineComponent, h, ref, computed, watch, onBeforeUnmount, type PropType } from 'vue'
import type { TreeNode } from '@expcat/tigercat-core'
import type { TreeSelectSize, TreeSelectValue } from '@expcat/tigercat-core'
import {
  treeSelectBaseClasses,
  treeSelectDropdownClasses,
  treeSelectSearchClasses,
  treeSelectEmptyClasses,
  getTreeSelectTriggerClasses,
  getTreeSelectNodeClasses,
  getTreeSelectDisplayLabel,
  getAllTreeSelectKeys,
  flattenTreeSelectNodes,
  filterTreeSelectNodes,
  coerceClassValue,
  classNames,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'

let treeSelectInstanceId = 0

const ChevronDownIcon = h(
  'svg',
  {
    class: 'w-4 h-4 transition-transform',
    viewBox: icon20ViewBox,
    fill: 'currentColor',
    xmlns: 'http://www.w3.org/2000/svg'
  },
  [
    h('path', {
      d: chevronDownSolidIcon20PathD,
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd'
    })
  ]
)

const ClearIcon = h(
  'svg',
  {
    class: 'w-4 h-4',
    viewBox: icon20ViewBox,
    fill: 'currentColor',
    xmlns: 'http://www.w3.org/2000/svg'
  },
  [
    h('path', {
      d: closeSolidIcon20PathD,
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd'
    })
  ]
)

export type VueTreeSelectProps = InstanceType<typeof TreeSelect>['$props']

export const TreeSelect = defineComponent({
  name: 'TigerTreeSelect',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<TreeSelectValue>,
      default: undefined
    },
    treeData: {
      type: Array as PropType<TreeNode[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Please select'
    },
    size: {
      type: String as PropType<TreeSelectSize>,
      default: 'md'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    notFoundText: {
      type: String,
      default: 'No data'
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const instanceId = ++treeSelectInstanceId
    const listboxId = `tiger-treeselect-listbox-${instanceId}`

    const isOpen = ref(false)
    const searchQuery = ref('')
    const containerRef = ref<HTMLElement | null>(null)

    const expandedKeys = ref<Set<string | number>>(
      props.defaultExpandAll ? new Set(getAllTreeSelectKeys(props.treeData)) : new Set()
    )

    const displayLabel = computed(() => getTreeSelectDisplayLabel(props.treeData, props.modelValue))

    const showClearButton = computed(
      () =>
        props.clearable &&
        !props.disabled &&
        props.modelValue !== undefined &&
        (Array.isArray(props.modelValue) ? props.modelValue.length > 0 : props.modelValue !== '')
    )

    const matchedKeys = computed(() => {
      if (!searchQuery.value) return null
      return filterTreeSelectNodes(props.treeData, searchQuery.value)
    })

    const effectiveExpandedKeys = computed(() => {
      if (matchedKeys.value) {
        return matchedKeys.value
      }
      return expandedKeys.value
    })

    const flatNodes = computed(() =>
      flattenTreeSelectNodes(props.treeData, effectiveExpandedKeys.value)
    )

    const visibleNodes = computed(() => {
      if (!matchedKeys.value) return flatNodes.value
      return flatNodes.value.filter((f) => matchedKeys.value!.has(f.node.key))
    })

    function openDropdown() {
      if (props.disabled) return
      isOpen.value = true
    }

    function closeDropdown() {
      isOpen.value = false
      searchQuery.value = ''
    }

    function toggleDropdown() {
      if (isOpen.value) closeDropdown()
      else openDropdown()
    }

    function toggleExpand(key: string | number) {
      const next = new Set(expandedKeys.value)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      expandedKeys.value = next
    }

    function isSelected(key: string | number): boolean {
      if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(key)
      }
      return props.modelValue === key
    }

    function handleNodeSelect(node: TreeNode) {
      if (node.disabled) return

      if (props.multiple) {
        const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
        const idx = current.indexOf(node.key)
        if (idx >= 0) {
          current.splice(idx, 1)
        } else {
          current.push(node.key)
        }
        emit('update:modelValue', current)
        emit('change', current)
      } else {
        emit('update:modelValue', node.key)
        emit('change', node.key)
        closeDropdown()
      }
    }

    function handleClear(e: Event) {
      e.stopPropagation()
      const val = props.multiple ? [] : undefined
      emit('update:modelValue', val)
      emit('change', val)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeDropdown()
      } else if ((e.key === 'Enter' || e.key === ' ') && !isOpen.value) {
        e.preventDefault()
        openDropdown()
      }
    }

    // Click outside
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        closeDropdown()
      }
    }

    watch(isOpen, (val) => {
      if (val) {
        document.addEventListener('click', handleClickOutside)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => {
      const containerClasses = classNames(treeSelectBaseClasses, coerceClassValue(attrs.class))

      return h('div', { ref: containerRef, class: containerClasses }, [
        // Trigger
        h(
          'button',
          {
            type: 'button',
            class: getTreeSelectTriggerClasses(props.size, props.disabled, isOpen.value),
            role: 'combobox',
            'aria-expanded': String(isOpen.value),
            'aria-haspopup': 'listbox',
            'aria-controls': isOpen.value ? listboxId : undefined,
            disabled: props.disabled,
            onClick: toggleDropdown,
            onKeydown: handleKeyDown
          },
          [
            h(
              'span',
              {
                class: classNames(
                  'flex-1 truncate',
                  !displayLabel.value
                    ? 'text-[var(--tiger-treeselect-placeholder,var(--tiger-text-muted,#9ca3af))]'
                    : ''
                )
              },
              displayLabel.value || props.placeholder
            ),

            // Clear or chevron
            showClearButton.value
              ? h(
                  'span',
                  {
                    class:
                      'absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-treeselect-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-treeselect-clear-hover,var(--tiger-text,#111827))]',
                    'aria-label': 'Clear selection',
                    onClick: handleClear
                  },
                  [ClearIcon]
                )
              : h(
                  'span',
                  {
                    class:
                      'absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-text-muted,#9ca3af)] pointer-events-none'
                  },
                  [ChevronDownIcon]
                )
          ]
        ),

        // Dropdown
        isOpen.value
          ? h(
              'div',
              {
                id: listboxId,
                role: 'listbox',
                class: treeSelectDropdownClasses
              },
              [
                // Search
                props.showSearch
                  ? h('input', {
                      type: 'text',
                      class: treeSelectSearchClasses,
                      placeholder: 'Search...',
                      value: searchQuery.value,
                      'aria-label': 'Search tree',
                      onInput: (e: Event) => {
                        searchQuery.value = (e.target as HTMLInputElement).value
                      }
                    })
                  : null,

                // Tree nodes
                visibleNodes.value.length > 0
                  ? visibleNodes.value.map((flatNode) => {
                      const { node, level, hasChildren, isExpanded } = flatNode
                      const selected = isSelected(node.key)
                      const indent = level * 20

                      return h(
                        'div',
                        {
                          key: node.key,
                          role: 'option',
                          'aria-selected': selected,
                          'aria-disabled': node.disabled,
                          class: getTreeSelectNodeClasses(selected, !!node.disabled, props.size),
                          style: { paddingLeft: `${indent + 8}px` },
                          onClick: (e: MouseEvent) => {
                            e.stopPropagation()
                            handleNodeSelect(node)
                          }
                        },
                        [
                          // Expand toggle
                          hasChildren
                            ? h(
                                'span',
                                {
                                  class: classNames(
                                    'inline-flex items-center justify-center w-4 h-4 mr-1 transition-transform',
                                    isExpanded ? 'rotate-90' : ''
                                  ),
                                  onClick: (e: MouseEvent) => {
                                    e.stopPropagation()
                                    toggleExpand(node.key)
                                  }
                                },
                                [
                                  h(
                                    'svg',
                                    {
                                      class: 'w-3 h-3',
                                      viewBox: icon20ViewBox,
                                      fill: 'currentColor'
                                    },
                                    [
                                      h('path', {
                                        d: chevronRightSolidIcon20PathD,
                                        'fill-rule': 'evenodd',
                                        'clip-rule': 'evenodd'
                                      })
                                    ]
                                  )
                                ]
                              )
                            : h('span', { class: 'w-4 mr-1' }),

                          // Label
                          h('span', { class: 'flex-1 truncate' }, node.label)
                        ]
                      )
                    })
                  : h('div', { class: treeSelectEmptyClasses }, props.notFoundText)
              ]
            )
          : null
      ])
    }
  }
})

export default TreeSelect
