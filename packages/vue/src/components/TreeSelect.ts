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
  type CSSProperties,
  type VNode
} from 'vue'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  resolveTreeSelectListHeight,
  classNames,
  coerceClassValue,
  calculateCheckedState,
  coerceTreeSelectFormValue,
  commitTreeSelectNode,
  countTreeNodes,
  getEmptyLabels,
  getFirstVisibleChildKey,
  getPickerComboboxAria,
  getPickerTreeAria,
  decideAfterBranchLoad,
  gateBranchLoad,
  getSelectLabels,
  getTreeKeyboardAction,
  getTreeSelectLabels,
  getTreeSelectDisplayLabel,
  getTreeSelectExpandIconClasses,
  getTreeSelectNodeClasses,
  getTreeSelectDropdownMinWidth,
  getTreeSelectNodeIndentStyle,
  getTreeSelectOpenExpandedKeys,
  getTreeSelectRootClasses,
  getTreeSelectSelectedKeys,
  getTreeSelectTreeItemAria,
  getTreeSelectTreeItemId,
  getTreeSelectTriggerClasses,
  getTreeSelectTriggerKeyIntent,
  getFixedVirtualRange,
  getTreeSelectVirtualItemHeight,
  getTreeSelectVisibleIndex,
  isSelectTypeaheadCharacter,
  isCurrentLoadToken,
  isTreeNodeExpandable,
  isTreeSelectValueEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  nextLoadToken,
  nodeHasChildren,
  normalizeTreeSelectValue,
  rememberTreeSelectLabel,
  sameTreeKey,
  resolveTreeSelectVisibleItems,
  runShakeAnimation,
  selectChevronWrapClasses,
  selectChromeIconClasses,
  selectClearButtonClasses,
  selectClearIconClasses,
  selectTrailingSlotClasses,
  serializeTreeSelectFormValues,
  shouldApplyTreeSelectDefaultExpandAll,
  shouldSeedTreeSelectFormDefault,
  shouldShowTreeSelectClear,
  shouldSubmitNativeField,
  toggleTreeSelectExpandedKey,
  treeKeyId,
  treeSelectValuesEqual,
  treeSetHas,
  treeSelectDoneActionClasses,
  treeSelectDoneButtonClasses,
  treeSelectDropdownClasses,
  treeSelectEmptyClasses,
  treeSelectExpandButtonClasses,
  treeSelectTreeClasses,
  type ComponentSize,
  type FloatingPlacement,
  type InputStatus,
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  getCheckboxVisualClasses,
  type TigerLocale,
  type TigerLocaleSelect,
  type TigerLocaleTreeSelect,
  type TreeCheckStrategy,
  type TreeFilterFn,
  type TreeLoadDataFn,
  type TreeNode,
  type TreeSelectValue,
  type VisibleTreeItem
} from '@expcat/tigercat-core'
import {
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core/icons/picker'
import { useTigerConfig } from './tiger-config'
import { VirtualList, type VirtualListHandle } from './VirtualList'
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
  readOnly?: boolean
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
  listHeight?: number
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
  labels?: Partial<TigerLocaleSelect & TigerLocaleTreeSelect>
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
    readOnly: Boolean,
    clearable: { type: Boolean, default: true },
    multiple: Boolean,
    checkStrictly: { type: Boolean, default: false },
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
    listHeight: { type: Number, default: undefined },
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
    labels: { type: Object as PropType<Partial<TigerLocaleSelect & TigerLocaleTreeSelect>> },
    className: String
  },
  emits: [
    'update:modelValue',
    'update:searchValue',
    'update:open',
    'update:expandedKeys',
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
    const selectLabels = computed(() => getSelectLabels(mergedLocale.value, props.labels))
    const treeLabels = computed(() => getTreeSelectLabels(mergedLocale.value, props.labels))
    const emptyLabels = computed(() => getEmptyLabels(mergedLocale.value))
    const dir = computed<'ltr' | 'rtl'>(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const instanceId = useId()
    const treeId = computed(() => `tiger-treeselect-tree-${instanceId}`)

    const loadTokens = new Map<string, number>()
    const loadedIds = new Set<string>()
    let seeded = false
    let seenTreeCount = 0
    const formNamed = Boolean(formItemControl?.name.value)
    const localValue = ref<TreeSelectValue>(
      normalizeTreeSelectValue(
        props.modelValue !== undefined
          ? props.modelValue
          : formNamed
            ? (coerceTreeSelectFormValue(formItemControl?.value.value, props.multiple) ??
              props.defaultValue ??
              (props.multiple ? [] : null))
            : (props.defaultValue ?? (props.multiple ? [] : null)),
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

    const selected = computed(() => {
      if (props.modelValue !== undefined) {
        return normalizeTreeSelectValue(props.modelValue, props.multiple)
      }
      if (formItemControl?.name.value) {
        const coerced = coerceTreeSelectFormValue(formItemControl.value.value, props.multiple)
        if (coerced !== undefined) return normalizeTreeSelectValue(coerced, props.multiple)
      }
      return localValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const searchQuery = computed(() => props.searchValue ?? localSearch.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const isReadOnly = computed(() => props.readOnly && !effectiveDisabled.value)
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
    const placeholderText = computed(() => props.placeholder ?? selectLabels.value.placeholder)
    const displayText = computed(() =>
      isTreeSelectValueEmpty(selected.value, props.multiple)
        ? placeholderText.value
        : getTreeSelectDisplayLabel(treeData.value, selected.value, labelCache)
    )
    const emptyCopy = computed(() =>
      props.loading
        ? selectLabels.value.loadingText
        : props.emptyText?.trim()
          ? props.emptyText
          : emptyLabels.value.noResults
    )
    const showClear = computed(() =>
      shouldShowTreeSelectClear({
        clearable: props.clearable,
        disabled: effectiveDisabled.value,
        readOnly: isReadOnly.value,
        value: selected.value,
        multiple: props.multiple
      })
    )
    const itemHeight = computed(
      () => props.itemHeight ?? getTreeSelectVirtualItemHeight(props.size)
    )
    const overlayHeight = computed(() => resolveTreeSelectListHeight(props.listHeight))
    const virtualRef = ref<VirtualListHandle | null>(null)
    const listScrollTop = ref(0)
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
        loadedIds.clear()
      }
    )
    watch(
      () => props.treeData,
      (data) => {
        const nextCount = countTreeNodes(data)
        const apply = shouldApplyTreeSelectDefaultExpandAll(
          seenTreeCount,
          nextCount,
          props.defaultExpandAll
        )
        seenTreeCount = nextCount
        if (!apply || props.expandedKeys !== undefined) return
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
      if (next === isOpen.value) return
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
    }
    function setSearch(query: string) {
      if (query === searchQuery.value) return
      if (props.searchValue === undefined) localSearch.value = query
      emit('update:searchValue', query)
    }
    function setSelected(next: TreeSelectValue) {
      const normalized = normalizeTreeSelectValue(next, props.multiple)
      if (treeSelectValuesEqual(normalized, selected.value, props.multiple)) return
      if (props.modelValue === undefined) localValue.value = normalized
      emit('update:modelValue', normalized)
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
      if (effectiveDisabled.value || isReadOnly.value) return
      setOpen(true)
    }
    function toggleDropdown() {
      if (effectiveDisabled.value || isReadOnly.value) return
      if (isOpen.value) closeDropdown()
      else openDropdown()
    }
    function focusCombobox() {
      triggerRef.value?.focus()
    }
    function commitKey(key: string | number) {
      if (isReadOnly.value || effectiveDisabled.value) return
      const node = visibleItems.value.find((item) => sameTreeKey(item.key, key))?.node
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

    function nodeGate(node: TreeNode) {
      const id = treeKeyId(node.key)
      return gateBranchLoad({
        disabled: node.disabled,
        isLeaf: node.isLeaf,
        hasChildren: nodeHasChildren(node),
        hasLoadData: hasLoadData.value,
        loaded: loadedIds.has(id),
        loading: false
      })
    }

    async function loadChildren(node: TreeNode, intent: 'select' | 'expand') {
      if (!props.loadData || node.disabled) return
      const id = treeKeyId(node.key)
      const token = nextLoadToken(loadTokens, id)
      if (!treeSetHas(expandedSet.value, node.key)) {
        setExpanded(toggleTreeSelectExpandedKey(expandedSet.value, node.key))
      }
      try {
        const children = await props.loadData(node)
        if (!isCurrentLoadToken(loadTokens, id, token)) return
        loadedIds.add(id)
        const inject = (nodes: TreeNode[]): TreeNode[] =>
          nodes.map((item) =>
            sameTreeKey(item.key, node.key)
              ? { ...item, children }
              : item.children
                ? { ...item, children: inject(item.children) }
                : item
          )
        loadedData.value = inject(loadedData.value ?? props.treeData)
        const decision = decideAfterBranchLoad({
          childCount: children.length,
          intent,
          commitLoadedBranch: false
        })
        if (decision.expand) setExpanded(new Set(expandedSet.value).add(node.key))
        if (decision.commit) commitKey(node.key)
      } catch {
        if (!isCurrentLoadToken(loadTokens, id, token)) return
      }
    }

    function handleNodeSelect(item: VisibleTreeItem) {
      if (item.node.disabled || effectiveDisabled.value || isReadOnly.value) return
      if (nodeGate(item.node) === 'load') {
        void loadChildren(item.node, 'select')
        return
      }
      activeKey.value = item.key
      commitKey(item.key)
    }

    function handleExpandClick(item: VisibleTreeItem, event: Event) {
      event.stopPropagation()
      if (item.node.disabled || isReadOnly.value) return
      if (nodeGate(item.node) === 'load') {
        void loadChildren(item.node, 'expand')
        return
      }
      toggleExpand(item.key)
      activeKey.value = item.key
    }

    function clearSelection(event?: Event) {
      event?.stopPropagation()
      if (isReadOnly.value || effectiveDisabled.value) return
      setSelected(props.multiple ? [] : null)
      nextTick(() => triggerRef.value?.focus())
    }

    function applyTreeAction(key: string): boolean {
      const current = activeKey.value ?? visibleItems.value[0]?.key
      if (current === undefined) return false
      const item = visibleItems.value.find((row) => sameTreeKey(row.key, current))
      if (!item) return false
      const visual = calculateCheckedState(treeData.value, selectedKeys.value, props.checkStrictly)
      const fully = visual.checked.some((keyId) => sameTreeKey(keyId, current))
      const half = visual.halfChecked.some((keyId) => sameTreeKey(keyId, current))
      const action = getTreeKeyboardAction({
        key,
        nodeKey: current,
        currentKey: current,
        focusableKeys: visibleItems.value.filter((row) => !row.node.disabled).map((row) => row.key),
        parentKey: item.parentKey,
        firstChildKey: getFirstVisibleChildKey(visibleItems.value, current),
        isExpandable: isTreeNodeExpandable(item.node, hasLoadData.value),
        isExpanded: treeSetHas(expandedSet.value, current),
        isParentExpanded:
          item.parentKey !== undefined && treeSetHas(expandedSet.value, item.parentKey),
        isChecked: fully && !half,
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
        const target = visibleItems.value.find((row) => sameTreeKey(row.key, action.key))
        if (
          target &&
          nodeGate(target.node) === 'load' &&
          !treeSetHas(expandedSet.value, target.key)
        ) {
          void loadChildren(target.node, 'expand')
        } else {
          toggleExpand(action.key)
        }
        activeKey.value = action.key
        return true
      }
      if (action.type === 'select' || action.type === 'check') {
        const target = visibleItems.value.find((row) => sameTreeKey(row.key, action.key))
        if (target && nodeGate(target.node) === 'load') void loadChildren(target.node, 'select')
        else commitKey(action.key)
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
      if (effectiveDisabled.value || isReadOnly.value) return
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

    function maybeSeedTreeSelect() {
      if (
        !shouldSeedTreeSelectFormDefault({
          alreadySeeded: seeded,
          fieldName: formItemControl?.name.value,
          controlledValue: props.modelValue,
          formValue: formItemControl?.value.value,
          defaultValue: props.defaultValue
        })
      ) {
        return
      }
      seeded = true
      formItemControl?.onChange(normalizeTreeSelectValue(props.defaultValue, props.multiple))
    }
    maybeSeedTreeSelect()

    watch(isOpen, (open, previous) => {
      if (!open || previous) return
      setExpanded(
        getTreeSelectOpenExpandedKeys({
          treeData: treeData.value,
          selectedKeys: selectedKeys.value,
          defaultExpandAll: false,
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

    watch(
      () =>
        [
          isOpen.value,
          props.virtual,
          activeKey.value,
          visibleItems.value,
          itemHeight.value,
          overlayHeight.value
        ] as const,
      () => {
        if (!isOpen.value || !props.virtual || activeKey.value === undefined) return
        const index = visibleItems.value.findIndex((item) => sameTreeKey(item.key, activeKey.value))
        if (index >= 0) virtualRef.value?.scrollToIndex(index, 'auto')
      },
      { flush: 'post' }
    )

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
      const activeIndex = visibleItems.value.findIndex((item) =>
        sameTreeKey(item.key, activeKey.value)
      )
      const virtualRange = getFixedVirtualRange(
        listScrollTop.value,
        overlayHeight.value,
        itemHeight.value,
        visibleItems.value.length,
        5
      )
      const activeInWindow =
        !props.virtual ||
        (activeIndex >= virtualRange.startIndex && activeIndex <= virtualRange.endIndex)
      const activeOptionId =
        isOpen.value && activeKey.value !== undefined && activeInWindow
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
      let trigger: VNode
      if (searchOpen) {
        trigger = h('input', {
          ref: (node) => {
            const el = node instanceof HTMLInputElement ? node : null
            searchInputRef.value = el
            triggerRef.value = el
          },
          type: 'text',
          class: classNames(triggerClasses, 'bg-transparent'),
          disabled: effectiveDisabled.value,
          readonly: isReadOnly.value,
          'aria-readonly': isReadOnly.value || undefined,
          value: searchQuery.value,
          placeholder: displayText.value,
          onInput: (event: Event) => setSearch((event.target as HTMLInputElement).value),
          onKeydown: (event: KeyboardEvent) => handleKeyDown(event, true),
          onFocusout: handleFocusOut,
          ...comboboxProps
        })
      } else {
        trigger = h(
          'div',
          {
            ref: triggerRef,
            tabindex: effectiveDisabled.value ? -1 : 0,
            'aria-disabled': effectiveDisabled.value || undefined,
            'aria-readonly': isReadOnly.value || undefined,
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
                    'text-[var(--tiger-text-secondary)]'
                )
              },
              displayText.value
            )
          ]
        )
      }

      const checkedState = calculateCheckedState(
        treeData.value,
        selectedKeys.value,
        props.checkStrictly
      )
      function renderNode(item: VisibleTreeItem) {
        const checked = checkedState.checked.some((key) => sameTreeKey(key, item.key))
        const halfChecked = checkedState.halfChecked.some((key) => sameTreeKey(key, item.key))
        const selectedNode = props.multiple
          ? checked
          : selectedKeys.value.some((key) => sameTreeKey(key, item.key))
        const isActive = activeKey.value !== undefined && sameTreeKey(activeKey.value, item.key)
        const expandable = isTreeNodeExpandable(item.node, hasLoadData.value)
        const expanded = treeSetHas(expandedSet.value, item.key)
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
              expandable,
              isLeaf: item.node.isLeaf,
              checkable: props.multiple,
              checked,
              halfChecked
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
                      ? treeLabels.value.collapseAriaLabel
                      : treeLabels.value.expandAriaLabel,
                    tabindex: -1,
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => handleExpandClick(item, event)
                  },
                  [
                    h('span', { class: getTreeSelectExpandIconClasses(expanded, dir.value) }, [
                      iconVNode(
                        chevronRightSolidIcon20PathD,
                        'w-4 h-4 text-[var(--tiger-text-secondary)]'
                      )
                    ])
                  ]
                )
              : h('span', { class: 'inline-flex w-6 h-6 shrink-0', 'aria-hidden': 'true' }),
            props.multiple
              ? h(
                  'span',
                  {
                    'data-tiger-tree-check': '',
                    'aria-hidden': 'true',
                    class: classNames(
                      getCheckboxVisualClasses({
                        size: 'sm',
                        checked,
                        indeterminate: halfChecked,
                        disabled: Boolean(item.node.disabled)
                      }),
                      'me-2'
                    )
                  },
                  checked || halfChecked
                    ? [
                        h(
                          'svg',
                          {
                            class: checkboxIconSizeClasses.sm,
                            viewBox: checkboxIconViewBox,
                            fill: 'none',
                            stroke: 'currentColor',
                            'stroke-width': '2',
                            'stroke-linecap': 'round',
                            'stroke-linejoin': 'round',
                            'aria-hidden': 'true',
                            focusable: 'false'
                          },
                          [
                            h('path', {
                              d: halfChecked ? checkboxIndeterminatePathD : checkboxCheckPathD
                            })
                          ]
                        )
                      ]
                    : []
                )
              : null,
            h('span', { class: 'flex-1 truncate' }, item.node.label)
          ]
        )
      }

      const body =
        visibleItems.value.length === 0
          ? h('div', { class: treeSelectEmptyClasses }, emptyCopy.value)
          : props.virtual
            ? h(
                'div',
                {
                  class: treeSelectTreeClasses,
                  style: { height: `${overlayHeight.value}px` },
                  ...treeAria
                },
                [
                  h(
                    VirtualList,
                    {
                      ref: virtualRef,
                      role: 'none',
                      'data-tiger-treeselect-virtual': '',
                      itemCount: visibleItems.value.length,
                      itemHeight: itemHeight.value,
                      height: overlayHeight.value,
                      getItemKey: (index: number) =>
                        String(visibleItems.value[index]?.key ?? index),
                      onScroll: (top: number) => {
                        listScrollTop.value = top
                      }
                    },
                    {
                      default: ({ index }: { index: number }) => {
                        const item = visibleItems.value[index]
                        return item ? renderNode(item) : null
                      }
                    }
                  )
                ]
              )
            : h(
                'div',
                {
                  class: treeSelectTreeClasses,
                  style: { maxHeight: `${overlayHeight.value}px` },
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
                style: {
                  ...(overlay.floatingStyles.value as CSSProperties),
                  minWidth: getTreeSelectDropdownMinWidth()
                },
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
                    selectLabels.value.doneText
                  )
                ])
              ]
            ),
            overlay.target.value
          )
        : null

      const hiddenValues = shouldSubmitNativeField({
        name: effectiveName,
        disabled: effectiveDisabled.value
      })
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
                      'aria-label': selectLabels.value.clearAriaLabel,
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
