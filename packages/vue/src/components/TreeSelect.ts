import {
  defineComponent,
  computed,
  ref,
  h,
  inject,
  watch,
  nextTick,
  useId,
  type PropType,
  type CSSProperties
} from 'vue'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  TREE_SELECT_DEFAULT_HEIGHT,
  classNames,
  coerceClassValue,
  coerceTreeSelectFormValue,
  commitTreeSelectNode,
  getEmptyLabels,
  getFirstVisibleChildKey,
  getPickerComboboxAria,
  getPickerTreeAria,
  getSelectLabels,
  getTreeKeyboardAction,
  getTreeSelectDisplayLabel,
  getTreeSelectExpandIconClasses,
  getTreeSelectNodeClasses,
  getTreeSelectNodeIndentStyle,
  getTreeSelectOpenExpandedKeys,
  getTreeSelectRootClasses,
  getTreeSelectSelectedKeys,
  getTreeSelectTreeItemAria,
  getTreeSelectTreeItemId,
  getTreeSelectTriggerClasses,
  getTreeSelectTriggerKeyIntent,
  getTreeSelectVirtualItemHeight,
  getTreeSelectVisibleIndex,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD,
  isSelectTypeaheadCharacter,
  isTreeNodeExpandable,
  isTreeSelectValueEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  normalizeTreeSelectValue,
  rememberTreeSelectLabel,
  resolveTreeSelectVisibleItems,
  runShakeAnimation,
  selectChevronWrapClasses,
  selectChromeIconClasses,
  selectClearButtonClasses,
  selectClearIconClasses,
  selectTrailingSlotClasses,
  serializeTreeSelectFormValues,
  shouldShowTreeSelectClear,
  toggleTreeSelectExpandedKey,
  treeSelectDoneActionClasses,
  treeSelectDoneButtonClasses,
  treeSelectDropdownClasses,
  treeSelectEmptyClasses,
  treeSelectExpandButtonClasses,
  treeSelectTreeClasses,
  type ComponentSize,
  type FloatingPlacement,
  type InputStatus,
  type TigerLocale,
  type TigerLocaleSelect,
  type TreeCheckStrategy,
  type TreeFilterFn,
  type TreeLoadDataFn,
  type TreeNode,
  type TreeSelectValue,
  type VisibleTreeItem
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

function iconVNode(path: string, className: string) {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: icon20ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        d: path,
        'clip-rule': 'evenodd'
      })
    ]
  )
}

export interface VueTreeSelectProps {
  modelValue?: TreeSelectValue
  defaultValue?: TreeSelectValue
  open?: boolean
  defaultOpen?: boolean
  treeData?: TreeNode[]
  placeholder?: string
  size?: ComponentSize
  disabled?: boolean
  clearable?: boolean
  multiple?: boolean
  checkStrictly?: boolean
  checkStrategy?: TreeCheckStrategy
  searchable?: boolean
  searchValue?: string
  defaultSearchValue?: string
  autoClearSearchValue?: boolean
  emptyText?: string
  defaultExpandAll?: boolean
  expandedKeys?: (string | number)[]
  defaultExpandedKeys?: (string | number)[]
  virtual?: boolean
  height?: number
  itemHeight?: number
  loading?: boolean
  loadData?: TreeLoadDataFn
  filterFn?: TreeFilterFn
  status?: InputStatus
  name?: string
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleSelect>
  className?: string
}

export type TreeSelectProps = VueTreeSelectProps
export type { TreeSelectValue }

export const TreeSelect = defineComponent({
  name: 'TigerTreeSelect',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Array] as PropType<TreeSelectValue>, default: undefined },
    defaultValue: {
      type: [String, Number, Array] as PropType<TreeSelectValue>,
      default: undefined
    },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    treeData: { type: Array as PropType<TreeNode[]>, default: () => [] },
    placeholder: { type: String, default: undefined },
    size: { type: String as PropType<ComponentSize>, default: 'md' as ComponentSize },
    disabled: Boolean,
    clearable: Boolean,
    multiple: Boolean,
    checkStrictly: { type: Boolean, default: true },
    checkStrategy: { type: String as PropType<TreeCheckStrategy>, default: 'all' },
    searchable: Boolean,
    searchValue: { type: String, default: undefined },
    defaultSearchValue: { type: String, default: '' },
    autoClearSearchValue: { type: Boolean, default: true },
    emptyText: { type: String, default: undefined },
    defaultExpandAll: Boolean,
    expandedKeys: { type: Array as PropType<(string | number)[]>, default: undefined },
    defaultExpandedKeys: { type: Array as PropType<(string | number)[]>, default: undefined },
    virtual: Boolean,
    height: { type: Number, default: TREE_SELECT_DEFAULT_HEIGHT },
    itemHeight: { type: Number, default: undefined },
    loading: Boolean,
    loadData: { type: Function as PropType<TreeLoadDataFn> },
    filterFn: { type: Function as PropType<TreeFilterFn> },
    status: { type: String as PropType<InputStatus>, default: undefined },
    name: String,
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    offset: { type: Number, default: 4 },
    dropdownClassName: String,
    getPopupContainer: { type: Function as PropType<() => HTMLElement | null> },
    locale: { type: Object as PropType<Partial<TigerLocale>> },
    labels: { type: Object as PropType<Partial<TigerLocaleSelect>> },
    className: String
  },
  emits: [
    'update:modelValue',
    'update:searchValue',
    'update:open',
    'update:expandedKeys',
    'change',
    'search-change',
    'open-change',
    'expand',
    'blur'
  ],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getSelectLabels(mergedLocale.value, props.labels))
    const emptyLabels = computed(() => getEmptyLabels(mergedLocale.value))
    const dir = computed<'ltr' | 'rtl'>(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const instanceId = useId()
    const treeId = computed(() => `tiger-treeselect-tree-${instanceId}`)

    const localValue = ref<TreeSelectValue>(
      normalizeTreeSelectValue(
        props.modelValue ??
          coerceTreeSelectFormValue(formItemControl?.value.value, props.multiple) ??
          props.defaultValue ??
          (props.multiple ? [] : undefined),
        props.multiple
      )
    )
    const localOpen = ref(props.defaultOpen)
    const localSearch = ref(props.defaultSearchValue)
    const loadedData = ref<TreeNode[] | null>(null)
    const localExpanded = ref(new Set<string | number>(props.defaultExpandedKeys ?? []))
    const activeKey = ref<string | number | undefined>(undefined)
    const labelCache = new Map<string | number, string>()
    const rootRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)

    const selected = computed(() =>
      props.modelValue !== undefined
        ? normalizeTreeSelectValue(props.modelValue, props.multiple)
        : (coerceTreeSelectFormValue(formItemControl?.value.value, props.multiple) ??
          localValue.value)
    )
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const searchQuery = computed(() => props.searchValue ?? localSearch.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const treeData = computed(() => loadedData.value ?? props.treeData)
    const expandedSet = computed(() =>
      props.expandedKeys ? new Set(props.expandedKeys) : localExpanded.value
    )
    const selectedKeys = computed(() => getTreeSelectSelectedKeys(selected.value, props.multiple))
    const visibleItems = computed(() =>
      resolveTreeSelectVisibleItems({
        treeData: treeData.value,
        expandedKeys: expandedSet.value,
        searchQuery: searchQuery.value,
        filterFn: props.filterFn
      })
    )
    const placeholderText = computed(() => props.placeholder ?? labels.value.placeholder)
    const displayText = computed(() =>
      isTreeSelectValueEmpty(selected.value, props.multiple)
        ? placeholderText.value
        : getTreeSelectDisplayLabel(treeData.value, selected.value, labelCache)
    )
    const emptyCopy = computed(() =>
      props.loading
        ? labels.value.loadingText
        : props.emptyText?.trim()
          ? props.emptyText
          : emptyLabels.value.noResults
    )
    const showClear = computed(() =>
      shouldShowTreeSelectClear({
        clearable: props.clearable,
        disabled: effectiveDisabled.value,
        value: selected.value,
        multiple: props.multiple
      })
    )
    const itemHeight = computed(
      () => props.itemHeight ?? getTreeSelectVirtualItemHeight(props.size)
    )
    const hasLoadData = computed(() => typeof props.loadData === 'function')

    watch(
      () => [props.modelValue, formItemControl?.value.value] as const,
      ([model, formValue]) => {
        const next =
          model !== undefined ? model : coerceTreeSelectFormValue(formValue, props.multiple)
        if (next === undefined) return
        localValue.value = normalizeTreeSelectValue(next, props.multiple)
      }
    )
    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )
    watch(
      () => props.treeData,
      () => {
        loadedData.value = null
      }
    )
    watch(
      () => props.treeData,
      (data) => {
        if (props.expandedKeys !== undefined || !props.defaultExpandAll) return
        localExpanded.value = getTreeSelectOpenExpandedKeys({
          treeData: data,
          selectedKeys: selectedKeys.value,
          defaultExpandAll: true,
          expandedKeys: localExpanded.value
        })
      },
      { immediate: true }
    )

    function setOpen(next: boolean) {
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }
    function setSearch(query: string) {
      if (props.searchValue === undefined) localSearch.value = query
      emit('update:searchValue', query)
      emit('search-change', query)
    }
    function setSelected(next: TreeSelectValue) {
      const normalized = normalizeTreeSelectValue(next, props.multiple)
      if (props.modelValue === undefined) localValue.value = normalized
      emit('update:modelValue', normalized)
      emit('change', normalized)
      formItemControl?.onChange(normalized)
    }
    function setExpanded(next: Set<string | number>) {
      if (props.expandedKeys === undefined) localExpanded.value = next
      const keys = [...next]
      emit('update:expandedKeys', keys)
      emit('expand', keys)
    }
    function closeDropdown() {
      setOpen(false)
    }
    function openDropdown() {
      if (effectiveDisabled.value) return
      setOpen(true)
    }
    function toggleDropdown() {
      if (effectiveDisabled.value) return
      if (isOpen.value) closeDropdown()
      else openDropdown()
    }
    function focusCombobox() {
      triggerRef.value?.focus()
    }
    function commitKey(key: string | number) {
      const node = visibleItems.value.find((item) => item.key === key)?.node
      if (node) rememberTreeSelectLabel(labelCache, key, node.label)
      const next = commitTreeSelectNode({
        treeData: treeData.value,
        key,
        value: selected.value,
        multiple: props.multiple,
        checkStrictly: props.checkStrictly,
        checkStrategy: props.checkStrategy
      })
      setSelected(next)
      if (props.multiple) {
        if (props.autoClearSearchValue) setSearch('')
        return
      }
      closeDropdown()
      nextTick(() => triggerRef.value?.focus())
    }
    function toggleExpand(key: string | number) {
      setExpanded(toggleTreeSelectExpandedKey(expandedSet.value, key))
    }

    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: dropdownRef,
      placement: () => props.placement ?? 'bottom-start',
      offset: () => props.offset ?? 4,
      layout: 'fullscreen-sm',
      matchReferenceWidth: false,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: () => props.getPopupContainer?.() ?? null,
      onDismiss: closeDropdown
    })

    async function loadChildren(node: TreeNode) {
      if (!props.loadData) return
      const inject = (nodes: TreeNode[], children: TreeNode[]): TreeNode[] =>
        nodes.map((item) =>
          item.key === node.key
            ? { ...item, children, isLeaf: children.length === 0 ? true : item.isLeaf }
            : item.children
              ? { ...item, children: inject(item.children, children) }
              : item
        )
      const children = await props.loadData(node)
      loadedData.value = inject(loadedData.value ?? props.treeData, children)
      setExpanded(new Set(expandedSet.value).add(node.key))
    }

    function handleNodeSelect(item: VisibleTreeItem) {
      if (item.node.disabled || effectiveDisabled.value) return
      const expandable = isTreeNodeExpandable(item.node, hasLoadData.value)
      if (
        expandable &&
        (!item.node.children || item.node.children.length === 0) &&
        props.loadData
      ) {
        void loadChildren(item.node)
        return
      }
      activeKey.value = item.key
      commitKey(item.key)
    }

    function handleExpandClick(item: VisibleTreeItem, event: Event) {
      event.stopPropagation()
      if (item.node.disabled) return
      const expandable = isTreeNodeExpandable(item.node, hasLoadData.value)
      if (
        expandable &&
        (!item.node.children || item.node.children.length === 0) &&
        props.loadData
      ) {
        void loadChildren(item.node)
        return
      }
      toggleExpand(item.key)
      activeKey.value = item.key
    }

    function clearSelection(event?: Event) {
      event?.stopPropagation()
      setSelected(props.multiple ? [] : undefined)
      nextTick(() => triggerRef.value?.focus())
    }

    function applyTreeAction(key: string): boolean {
      const current = activeKey.value ?? visibleItems.value[0]?.key
      if (current === undefined) return false
      const item = visibleItems.value.find((row) => row.key === current)
      if (!item) return false
      const action = getTreeKeyboardAction({
        key,
        nodeKey: current,
        currentKey: current,
        focusableKeys: visibleItems.value.filter((row) => !row.node.disabled).map((row) => row.key),
        parentKey: item.parentKey,
        firstChildKey: getFirstVisibleChildKey(visibleItems.value, current),
        isExpandable: isTreeNodeExpandable(item.node, hasLoadData.value),
        isExpanded: expandedSet.value.has(current),
        isParentExpanded: item.parentKey !== undefined && expandedSet.value.has(item.parentKey),
        isChecked: selectedKeys.value.includes(current),
        selectable: true,
        checkable: props.multiple,
        dir: dir.value
      })
      if (!action) return false
      if (action.type === 'none') return key !== 'Escape'
      if (action.type === 'focus') {
        activeKey.value = action.key
        return true
      }
      if (action.type === 'toggleExpand') {
        toggleExpand(action.key)
        activeKey.value = action.key
        return true
      }
      if (action.type === 'select' || action.type === 'check') {
        commitKey(action.key)
        return true
      }
      if (action.type === 'collapseAndFocus') {
        if (action.collapseKey !== undefined) toggleExpand(action.collapseKey)
        activeKey.value = action.focusKey
        return true
      }
      return true
    }

    function handleKeyDown(event: KeyboardEvent, fromSearchInput = false) {
      if (effectiveDisabled.value) return
      if (!isOpen.value && isSelectTypeaheadCharacter(event.key, event)) {
        event.preventDefault()
        openDropdown()
        if (props.searchable) setSearch(event.key)
        return
      }
      const intent = getTreeSelectTriggerKeyIntent({
        key: event.key,
        open: isOpen.value,
        searchable: props.searchable,
        clearable: props.clearable,
        hasValue: !isTreeSelectValueEmpty(selected.value, props.multiple),
        fromSearchInput
      })
      switch (intent.type) {
        case 'open':
          event.preventDefault()
          openDropdown()
          return
        case 'close':
          if (event.key !== 'Tab') event.preventDefault()
          closeDropdown()
          triggerRef.value?.focus()
          return
        case 'clear':
          event.preventDefault()
          clearSelection()
          return
        case 'prevent-scroll':
          event.preventDefault()
          openDropdown()
          return
        case 'select-active': {
          event.preventDefault()
          const key = activeKey.value ?? visibleItems.value[0]?.key
          if (key !== undefined) commitKey(key)
          return
        }
        case 'tree-key': {
          event.preventDefault()
          const handled = applyTreeAction(intent.key)
          if (intent.key === 'Escape' && !handled) {
            closeDropdown()
            triggerRef.value?.focus()
          }
          return
        }
        default:
          return
      }
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.value && next && rootRef.value.contains(next)) ||
        (dropdownRef.value && next && dropdownRef.value.contains(next))
      ) {
        return
      }
      formItemControl?.onBlur()
      emit('blur', event)
    }

    watch(isOpen, (open) => {
      if (!open) return
      setExpanded(
        getTreeSelectOpenExpandedKeys({
          treeData: treeData.value,
          selectedKeys: selectedKeys.value,
          defaultExpandAll: props.defaultExpandAll,
          expandedKeys: expandedSet.value
        })
      )
      const visible = resolveTreeSelectVisibleItems({
        treeData: treeData.value,
        expandedKeys: expandedSet.value,
        searchQuery: searchQuery.value,
        filterFn: props.filterFn
      })
      const index = getTreeSelectVisibleIndex(visible, selected.value)
      activeKey.value = visible[index]?.key ?? visible[0]?.key
      if (props.searchable) nextTick(() => searchInputRef.value?.focus())
    })

    expose({ focus: focusCombobox, open: openDropdown, close: closeDropdown })

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const ariaLabel =
        typeof restAttrs['aria-label'] === 'string' ? restAttrs['aria-label'] : undefined
      const attrLabelledby =
        typeof restAttrs['aria-labelledby'] === 'string' ? restAttrs['aria-labelledby'] : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? restAttrs['aria-describedby']
          : undefined,
        formItemControl?.describedBy.value
      )
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const effectiveId = attrId ?? formItemControl?.id.value
      const effectiveName = props.name ?? formItemControl?.name.value
      const activeOptionId =
        isOpen.value && activeKey.value !== undefined
          ? getTreeSelectTreeItemId(treeId.value, activeKey.value)
          : undefined
      const comboboxAria = getPickerComboboxAria({
        expanded: isOpen.value,
        listboxId: treeId.value,
        activeOptionId,
        haspopup: 'tree'
      })
      const treeAria = getPickerTreeAria({
        id: treeId.value,
        multiselectable: props.multiple
      })
      const triggerClasses = getTreeSelectTriggerClasses({
        size: props.size,
        disabled: effectiveDisabled.value,
        isOpen: isOpen.value,
        status: status.value,
        hasClear: showClear.value
      })
      const comboboxProps = {
        ...comboboxAria,
        id: effectiveId,
        'aria-label': ariaLabel,
        'aria-labelledby': labelledby,
        'aria-describedby': describedBy,
        'aria-invalid': status.value === 'error' ? true : undefined,
        'aria-required': formItemControl?.required.value ? true : undefined,
        'aria-autocomplete': props.searchable ? 'list' : 'none'
      }
      const searchOpen = props.searchable && isOpen.value
      const trigger = searchOpen
        ? h('input', {
            ref: (node: HTMLInputElement | null) => {
              searchInputRef.value = node
              triggerRef.value = node
            },
            type: 'text',
            class: classNames(triggerClasses, 'bg-transparent'),
            disabled: effectiveDisabled.value,
            value: searchQuery.value,
            placeholder: displayText.value,
            onInput: (event: Event) => setSearch((event.target as HTMLInputElement).value),
            onKeydown: (event: KeyboardEvent) => handleKeyDown(event, true),
            onFocusout: handleFocusOut,
            ...comboboxProps
          })
        : h(
            'div',
            {
              ref: triggerRef,
              tabindex: effectiveDisabled.value ? -1 : 0,
              class: triggerClasses,
              onClick: toggleDropdown,
              onKeydown: (event: KeyboardEvent) => handleKeyDown(event, false),
              onFocusout: handleFocusOut,
              ...comboboxProps
            },
            [
              h(
                'span',
                {
                  class: classNames(
                    'flex-1 truncate',
                    displayText.value === placeholderText.value &&
                      'text-[var(--tiger-text-muted,#9ca3af)]'
                  )
                },
                displayText.value
              )
            ]
          )

      function renderNode(item: VisibleTreeItem) {
        const selectedNode = selectedKeys.value.includes(item.key)
        const isActive = activeKey.value === item.key
        const expandable = isTreeNodeExpandable(item.node, hasLoadData.value)
        const expanded = expandedSet.value.has(item.key)
        return h(
          'div',
          {
            key: String(item.key),
            id: getTreeSelectTreeItemId(treeId.value, item.key),
            class: getTreeSelectNodeClasses({
              isSelected: selectedNode,
              isDisabled: Boolean(item.node.disabled),
              isActive,
              size: props.size
            }),
            style: {
              ...getTreeSelectNodeIndentStyle(item.level),
              height: `${itemHeight.value}px`
            },
            ...getTreeSelectTreeItemAria({
              selected: selectedNode,
              disabled: Boolean(item.node.disabled),
              level: item.level,
              expanded,
              expandable
            }),
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onClick: () => handleNodeSelect(item)
          },
          [
            expandable
              ? h(
                  'button',
                  {
                    type: 'button',
                    class: treeSelectExpandButtonClasses,
                    'aria-label': expanded
                      ? labels.value.collapseAriaLabel
                      : labels.value.expandAriaLabel,
                    'aria-expanded': expanded,
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => handleExpandClick(item, event)
                  },
                  [
                    h('span', { class: getTreeSelectExpandIconClasses(expanded, dir.value) }, [
                      iconVNode(
                        chevronRightSolidIcon20PathD,
                        'w-4 h-4 text-[var(--tiger-text-muted,#9ca3af)]'
                      )
                    ])
                  ]
                )
              : h('span', { class: 'inline-flex w-6 h-6 shrink-0', 'aria-hidden': 'true' }),
            props.multiple
              ? h('input', {
                  type: 'checkbox',
                  class: 'me-2',
                  tabindex: -1,
                  checked: selectedNode,
                  disabled: Boolean(item.node.disabled),
                  readonly: true,
                  'aria-hidden': 'true'
                })
              : null,
            h('span', { class: 'flex-1 truncate' }, item.node.label)
          ]
        )
      }

      const body =
        visibleItems.value.length === 0
          ? h('div', { class: treeSelectEmptyClasses }, emptyCopy.value)
          : h(
              'div',
              {
                class: treeSelectTreeClasses,
                style: { maxHeight: `${props.height}px` },
                ...treeAria
              },
              visibleItems.value.map(renderNode)
            )

      const dropdown = isOpen.value
        ? renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: dropdownRef,
                class: classNames(
                  treeSelectDropdownClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value as CSSProperties,
                'data-positioned': overlay.positioned.value,
                'data-tiger-treeselect-dropdown': '',
                onMousedown: (event: MouseEvent) => event.preventDefault(),
                onFocusout: handleFocusOut
              },
              [
                body,
                h('div', { class: treeSelectDoneActionClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: treeSelectDoneButtonClasses,
                      'data-tiger-treeselect-done': '',
                      onMousedown: (event: MouseEvent) => event.preventDefault(),
                      onClick: closeDropdown
                    },
                    labels.value.doneText
                  )
                ])
              ]
            ),
            overlay.target.value
          )
        : null

      const hiddenValues = effectiveName
        ? serializeTreeSelectFormValues(selected.value, props.multiple)
        : []

      return h(
        'div',
        {
          ref: rootRef,
          class: getTreeSelectRootClasses(
            inputGroup != null,
            classNames(props.className, coerceClassValue(attrClass))
          ),
          style: (attrStyle as CSSProperties) ?? undefined,
          [TIGER_CHROME_ATTR]: '',
          onAnimationend: () => rootRef.value?.classList.remove(SHAKE_CLASS)
        },
        [
          h('div', { class: 'relative' }, [
            trigger,
            h('span', { class: selectTrailingSlotClasses }, [
              showClear.value
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: selectClearButtonClasses,
                      'data-tiger-treeselect-clear': '',
                      'aria-label': labels.value.clearAriaLabel,
                      onMousedown: (event: MouseEvent) => event.preventDefault(),
                      onClick: clearSelection
                    },
                    iconVNode(closeSolidIcon20PathD, selectClearIconClasses)
                  )
                : null,
              h(
                'span',
                {
                  class: classNames(selectChevronWrapClasses, isOpen.value && 'rotate-180'),
                  'aria-hidden': 'true'
                },
                iconVNode(chevronDownSolidIcon20PathD, selectChromeIconClasses)
              )
            ])
          ]),
          ...hiddenValues.map((value, index) =>
            h('input', {
              key: `${effectiveName}-${index}-${value}`,
              type: 'hidden',
              name: effectiveName,
              value
            })
          ),
          dropdown
        ]
      )
    }
  }
})
