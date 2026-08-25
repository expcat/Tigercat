import { defineComponent, h, ref, computed, watch, nextTick, type PropType } from 'vue'
import type { TreeNode } from '@expcat/tigercat-core'
import type { ComponentSize, TreeSelectValue, FlatTreeSelectNode } from '@expcat/tigercat-core'
import {
  treeSelectBaseClasses,
  treeSelectSearchClasses,
  treeSelectEmptyClasses,
  getTreeSelectTriggerClasses,
  getTreeSelectNodeClasses,
  getTreeSelectDropdownClasses,
  getTreeSelectDisplayLabel,
  getAllTreeSelectKeys,
  flattenTreeSelectNodes,
  filterTreeSelectNodes,
  getTreeSelectVisibleIndex,
  alignTreeSelectVirtualScroll,
  TREE_SELECT_DEFAULT_HEIGHT,
  TREE_SELECT_DEFAULT_ITEM_HEIGHT,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionAria,
  getPickerTriggerKeyAction,
  getPickerNavigationIndex,
  getPickerOptionId,
  findFirstEnabledIndex,
  coerceClassValue,
  classNames,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD,
  resolveLocaleText,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import type { TigerLocale } from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { VirtualList } from './VirtualList'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'

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
      type: String as PropType<ComponentSize>,
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
    searchable: {
      type: Boolean,
      default: false
    },
    searchValue: {
      type: String,
      default: undefined
    },
    defaultSearchValue: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: undefined
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    /**
     * Enable virtualized rendering of the dropdown tree.
     * Visible flattened rows are rendered through VirtualList with fixed item height.
     */
    virtual: {
      type: Boolean,
      default: false
    },
    /**
     * Pixel height of the virtualized dropdown viewport.
     * @default 400
     */
    height: {
      type: Number,
      default: TREE_SELECT_DEFAULT_HEIGHT
    },
    /**
     * Pixel height of each virtualized tree row.
     * @default 32
     */
    itemHeight: {
      type: Number,
      default: TREE_SELECT_DEFAULT_ITEM_HEIGHT
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
    const instanceId = ++treeSelectInstanceId
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const listboxId = `tiger-treeselect-listbox-${instanceId}`

    const isOpen = ref(false)
    const uncontrolledSearchValue = ref(props.defaultSearchValue)
    const searchQuery = computed(() => props.searchValue ?? uncontrolledSearchValue.value)
    const containerRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)
    const virtualListWrapperRef = ref<HTMLElement | null>(null)
    const activeIndex = ref(-1)
    const lastActiveKey = ref<string | number | undefined>()
    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: dropdownRef,
      containerRef,
      placement: 'bottom-start',
      offset: 4,
      matchReferenceWidth: true,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      onDismiss: closeDropdown
    })

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

    function isNodeDisabled(item: FlatTreeSelectNode): boolean {
      return !!item.node.disabled
    }

    function getVirtualScrollEl(): HTMLElement | null {
      const wrapper = virtualListWrapperRef.value
      return (wrapper?.firstElementChild as HTMLElement | null) ?? wrapper
    }

    function resolveActiveIndex(): number {
      const selected = getTreeSelectVisibleIndex(visibleNodes.value, props.modelValue)
      if (selected >= 0 && !visibleNodes.value[selected]?.node.disabled) return selected
      return findFirstEnabledIndex(visibleNodes.value, isNodeDisabled)
    }

    function commitActiveIndex(index: number) {
      activeIndex.value = index
      lastActiveKey.value = index >= 0 ? visibleNodes.value[index]?.node.key : undefined
    }

    function alignVirtualScroll(index: number) {
      if (!props.virtual) return
      alignTreeSelectVirtualScroll(getVirtualScrollEl(), index, props.itemHeight, props.height)
    }

    watch(isOpen, (open) => {
      if (!open) {
        commitActiveIndex(-1)
        return
      }
      commitActiveIndex(resolveActiveIndex())
      nextTick(() => alignVirtualScroll(activeIndex.value))
    })

    watch(activeIndex, (idx) => {
      if (!isOpen.value) return
      nextTick(() => alignVirtualScroll(idx))
    })

    watch(searchQuery, () => {
      if (!isOpen.value) return
      commitActiveIndex(resolveActiveIndex())
    })

    watch([expandedKeys, () => props.treeData], () => {
      if (!isOpen.value) return
      const remapped = getTreeSelectVisibleIndex(visibleNodes.value, lastActiveKey.value)
      if (remapped >= 0) activeIndex.value = remapped
    })

    function handleVirtualListKeyDown(e: KeyboardEvent) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      commitActiveIndex(
        getPickerNavigationIndex(visibleNodes.value, activeIndex.value, e.key, isNodeDisabled)
      )
    }

    function openDropdown() {
      if (props.disabled) return
      isOpen.value = true
    }

    function closeDropdown() {
      isOpen.value = false
      updateSearchValue('')
    }

    function updateSearchValue(value: string) {
      if (props.searchValue === undefined) {
        uncontrolledSearchValue.value = value
      }
      emit('update:searchValue', value)
      emit('search-change', value)
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

    function handleOpenListKeyDown(e: KeyboardEvent, fromSearchInput = false): boolean {
      const key = e.key
      if (fromSearchInput && key === ' ') return false

      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
        e.preventDefault()
        e.stopPropagation()
        commitActiveIndex(
          getPickerNavigationIndex(visibleNodes.value, activeIndex.value, key, isNodeDisabled)
        )
        return true
      }

      if (key === 'Enter' || key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        const item = visibleNodes.value[activeIndex.value]
        if (item && !item.node.disabled) {
          handleNodeSelect(item.node)
        }
        return true
      }

      if (key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        const item = visibleNodes.value[activeIndex.value]
        if (item?.hasChildren && !item.isExpanded) {
          toggleExpand(item.node.key)
        }
        return true
      }

      if (key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        const item = visibleNodes.value[activeIndex.value]
        if (item?.hasChildren && item.isExpanded) {
          toggleExpand(item.node.key)
        }
        return true
      }

      return false
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (props.disabled) return
      if (isOpen.value && handleOpenListKeyDown(e)) return

      const action = getPickerTriggerKeyAction(e.key, isOpen.value)
      if (action === 'none') return

      e.preventDefault()
      if (action === 'toggle') {
        if (isOpen.value) closeDropdown()
        else openDropdown()
      } else if (action === 'open') {
        openDropdown()
      } else if (action === 'close') {
        closeDropdown()
      }
    }

    function handleDropdownKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      if (!isOpen.value) return
      handleOpenListKeyDown(e)
    }

    function handleSearchKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case ' ':
          e.stopPropagation()
          return
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
          handleOpenListKeyDown(e, true)
          return
        case 'Escape':
          e.preventDefault()
          e.stopPropagation()
          closeDropdown()
          nextTick(() => {
            ;(triggerRef.value as HTMLButtonElement | null)?.focus()
          })
          return
        default:
          return
      }
    }

    function renderFlatNode(flatNode: FlatTreeSelectNode, index: number) {
      const { node, level, hasChildren, isExpanded } = flatNode
      const selected = isSelected(node.key)
      const isActive = index === activeIndex.value
      const indent = level * 20

      return h(
        'div',
        {
          key: node.key,
          id: getPickerOptionId(listboxId, index),
          'data-active': isActive || undefined,
          ...getPickerOptionAria({ selected, disabled: !!node.disabled }),
          class: getTreeSelectNodeClasses(selected || isActive, !!node.disabled, props.size),
          style: { paddingLeft: `${indent + 8}px`, height: props.virtual ? '100%' : undefined },
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            handleNodeSelect(node)
          }
        },
        [
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
          h('span', { class: 'flex-1 truncate' }, node.label)
        ]
      )
    }

    return () => {
      const containerClasses = classNames(treeSelectBaseClasses, coerceClassValue(attrs.class))

      return h('div', { ref: containerRef, class: containerClasses }, [
        // Trigger
        h(
          'button',
          {
            ref: triggerRef,
            type: 'button',
            class: classNames(
              getTreeSelectTriggerClasses(props.size, props.disabled, isOpen.value),
              showClearButton.value ? 'pr-14' : undefined
            ),
            ...getPickerComboboxAria({
              expanded: isOpen.value,
              listboxId,
              activeIndex: isOpen.value ? activeIndex.value : -1
            }),
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
            )
          ]
        ),
        h(
          'span',
          { class: 'pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1' },
          [
            showClearButton.value
              ? h(
                  'button',
                  {
                    type: 'button',
                    class:
                      'pointer-events-auto inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-treeselect-ring,var(--tiger-primary,#2563eb))] text-[var(--tiger-treeselect-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-treeselect-clear-hover,var(--tiger-text,#111827))]',
                    'data-tiger-treeselect-clear': '',
                    'aria-label': resolveLocaleText(
                      'Clear selection',
                      mergedLocale.value?.common?.clearText
                    ),
                    onClick: handleClear
                  },
                  [ClearIcon]
                )
              : null,
            h(
              'span',
              {
                class: classNames(
                  'inline-flex text-[var(--tiger-text-muted,#9ca3af)]',
                  isOpen.value && 'rotate-180'
                ),
                'aria-hidden': 'true'
              },
              [ChevronDownIcon]
            )
          ]
        ),

        // Dropdown
        isOpen.value
          ? renderVueOverlayTeleport(
              h(
                'div',
                {
                  ref: dropdownRef,
                  ...getPickerListboxAria({ id: listboxId }),
                  class: classNames(
                    getTreeSelectDropdownClasses(props.virtual),
                    overlay.floatingClasses.value
                  ),
                  style: overlay.floatingStyles.value,
                  'data-positioned': overlay.positioned.value,
                  onKeydown: handleDropdownKeyDown
                },
                [
                  // Search
                  props.searchable
                    ? h('input', {
                        type: 'text',
                        class: treeSelectSearchClasses,
                        placeholder: resolveLocaleText(
                          'Search...',
                          mergedLocale.value?.common?.searchPlaceholder
                        ),
                        value: searchQuery.value,
                        'aria-label': resolveLocaleText(
                          'Search tree',
                          mergedLocale.value?.common?.searchPlaceholder
                        ),
                        onInput: (e: Event) =>
                          updateSearchValue((e.target as HTMLInputElement).value),
                        onKeydown: handleSearchKeyDown
                      })
                    : null,

                  // Tree nodes
                  visibleNodes.value.length > 0
                    ? props.virtual
                      ? h(
                          'div',
                          {
                            ref: virtualListWrapperRef,
                            'data-tiger-treeselect-virtual': '',
                            tabindex: 0,
                            onKeydown: handleVirtualListKeyDown
                          },
                          [
                            h(
                              VirtualList,
                              {
                                itemCount: visibleNodes.value.length,
                                itemHeight: props.itemHeight,
                                height: props.height
                              },
                              {
                                default: ({ index }: { index: number }) => {
                                  const item = visibleNodes.value[index]
                                  return item ? renderFlatNode(item, index) : null
                                }
                              }
                            )
                          ]
                        )
                      : visibleNodes.value.map((flatNode, index) => renderFlatNode(flatNode, index))
                    : h(
                        'div',
                        { class: treeSelectEmptyClasses },
                        resolveLocaleText(
                          'No data',
                          props.emptyText,
                          mergedLocale.value?.common?.emptyText
                        )
                      )
                ]
              ),
              overlay.target.value
            )
          : null
      ])
    }
  }
})

export default TreeSelect
