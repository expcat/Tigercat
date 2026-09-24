import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  TIGER_CHROME_ATTR,
  calculateCheckedState,
  coerceTreeSelectFormValue,
  commitTreeSelectNode,
  countTreeNodes,
  decideAfterBranchLoad,
  gateBranchLoad,
  getEmptyLabels,
  getFirstVisibleChildKey,
  getPickerComboboxAria,
  getPickerTreeAria,
  getSelectLabels,
  getTreeKeyboardAction,
  getTreeSelectDisplayLabel,
  getTreeSelectLabels,
  getTreeSelectOpenExpandedKeys,
  getTreeSelectRootClasses,
  getTreeSelectSelectedKeys,
  getTreeSelectTreeItemId,
  getTreeSelectTriggerClasses,
  getTreeSelectTriggerKeyIntent,
  getFixedVirtualRange,
  getTreeSelectVirtualItemHeight,
  getTreeSelectVisibleIndex,
  isCurrentLoadToken,
  isSelectTypeaheadCharacter,
  isTreeNodeExpandable,
  isTreeSelectValueEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  nextLoadToken,
  nodeHasChildren,
  normalizeTreeSelectValue,
  rememberTreeSelectLabel,
  resolveTreeSelectListHeight,
  resolveTreeSelectVisibleItems,
  sameTreeKey,
  serializeTreeSelectFormValues,
  shouldApplyTreeSelectDefaultExpandAll,
  shouldSeedTreeSelectFormDefault,
  shouldShowTreeSelectClear,
  shouldSubmitNativeField,
  toggleTreeSelectExpandedKey,
  treeKeyId,
  treeSelectValuesEqual,
  treeSetHas,
  type InputStatus,
  type TreeNode,
  type TreeSelectValue,
  type VisibleTreeItem
} from '@expcat/tigercat-core'
import type { VirtualListHandle } from '../VirtualList'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../ConfigProvider'
import { useInputGroupContext } from '../InputGroup'
import { useFormItemControlContext } from '../FormItemContext'
import type { TreeSelectProps } from './types'

const EMPTY_TREE_DATA: TreeNode[] = []
const EMPTY_MULTIPLE_VALUE: (string | number)[] = []

export function useTreeSelectController(props: TreeSelectProps) {
  const {
    treeData: treeDataProp = EMPTY_TREE_DATA,
    size = 'md',
    disabled = false,
    placeholder,
    searchable = false,
    searchValue,
    defaultSearchValue = '',
    clearable = true,
    readOnly = false,
    emptyText,
    multiple = false,
    checkStrictly = false,
    checkStrategy = 'all',
    defaultExpandAll = false,
    expandedKeys,
    defaultExpandedKeys,
    virtual = false,
    listHeight,
    itemHeight: itemHeightProp,
    loading = false,
    loadData,
    filterFn,
    autoClearSearchValue = true,
    labels: labelsOverride,
    onSearch,
    onOpenChange,
    onExpand,
    className,
    value,
    defaultValue,
    onChange,
    open,
    defaultOpen = false,
    status: statusProp,
    name,
    locale,
    id,
    onBlur
  } = props

  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const dir: 'ltr' | 'rtl' = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const selectLabels = useMemo(
    () => getSelectLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const treeLabels = useMemo(
    () => getTreeSelectLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const emptyLabels = useMemo(() => getEmptyLabels(mergedLocale), [mergedLocale])

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const isReadOnly = Boolean(readOnly) && !effectiveDisabled
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim()
      ? props['aria-labelledby']
      : formItemControl?.labelId
  const ariaLabel =
    typeof props['aria-label'] === 'string' && props['aria-label'].trim()
      ? props['aria-label']
      : undefined
  const required = Boolean(formItemControl?.required)

  const formNamed = Boolean(formItemControl?.name)
  const incomingValue =
    value !== undefined
      ? value
      : formNamed
        ? coerceTreeSelectFormValue(formItemControl?.value, multiple)
        : undefined
  const [selected, setSelectedState] = useControlledState<TreeSelectValue>({
    value: incomingValue,
    defaultValue: defaultValue ?? (multiple ? EMPTY_MULTIPLE_VALUE : null),
    onChange: (next) => {
      const normalized = normalizeTreeSelectValue(next, multiple)
      onChange?.(normalized)
      formItemControl?.onChange?.(normalized)
    },
    postState: (next) => normalizeTreeSelectValue(next, multiple)
  })
  const setSelected = useCallback(
    (next: TreeSelectValue) => {
      const normalized = normalizeTreeSelectValue(next, multiple)
      if (treeSelectValuesEqual(normalized, selected, multiple)) return
      setSelectedState(normalized)
    },
    [multiple, selected, setSelectedState]
  )

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [searchQuery, setSearchQuery] = useControlledState({
    value: searchValue,
    defaultValue: defaultSearchValue,
    onChange: onSearch
  })

  const instanceId = useId()
  const treeId = `tiger-treeselect-tree-${instanceId}`
  const [loadedData, setLoadedData] = useState<TreeNode[] | null>(null)
  const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set())
  const [localExpanded, setLocalExpanded] = useState<Set<string | number>>(
    () => new Set(defaultExpandedKeys ?? [])
  )
  const [activeKey, setActiveKey] = useState<string | number | undefined>(undefined)
  const labelCacheRef = useRef(new Map<string | number, string>())
  const loadTokensRef = useRef(new Map<string, number>())
  const loadedIdsRef = useRef(new Set<string>())
  const treeCountRef = useRef(0)
  const seededRef = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const treeDataPropRef = useRef(treeDataProp)

  if (treeDataPropRef.current !== treeDataProp) {
    treeDataPropRef.current = treeDataProp
    setLoadedData(null)
    loadedIdsRef.current = new Set()
  }

  const treeData = loadedData ?? treeDataProp
  const hasLoadData = typeof loadData === 'function'

  const expandedSet = useMemo(() => {
    if (expandedKeys) return new Set(expandedKeys)
    return localExpanded
  }, [expandedKeys, localExpanded])

  const selectedKeys = useMemo(
    () => getTreeSelectSelectedKeys(selected, multiple),
    [multiple, selected]
  )

  const visibleItems = useMemo(
    () =>
      resolveTreeSelectVisibleItems({
        treeData,
        expandedKeys: expandedSet,
        searchQuery,
        filterFn
      }),
    [expandedSet, filterFn, searchQuery, treeData]
  )

  const displayLabel = getTreeSelectDisplayLabel(treeData, selected, labelCacheRef.current)
  const placeholderText = placeholder ?? selectLabels.placeholder
  const displayText = isTreeSelectValueEmpty(selected, multiple) ? placeholderText : displayLabel
  const emptyCopy = loading
    ? selectLabels.loadingText
    : emptyText?.trim()
      ? emptyText
      : emptyLabels.noResults
  const showClear = shouldShowTreeSelectClear({
    clearable,
    disabled: effectiveDisabled,
    value: selected,
    multiple,
    readOnly: isReadOnly
  })
  const itemHeight = itemHeightProp ?? getTreeSelectVirtualItemHeight(size)
  const listHeightPx = resolveTreeSelectListHeight(listHeight)
  const virtualListRef = useRef<VirtualListHandle | null>(null)
  const [listScrollTop, setListScrollTop] = useState(0)
  const activeIndex = visibleItems.findIndex((item) => sameTreeKey(item.key, activeKey))

  useLayoutEffect(() => {
    if (!isOpen || !virtual || activeIndex < 0) return
    virtualListRef.current?.scrollToIndex(activeIndex, 'auto')
  }, [activeIndex, isOpen, virtual])

  const setExpanded = useCallback(
    (next: Set<string | number>) => {
      if (expandedKeys === undefined) setLocalExpanded(next)
      onExpand?.([...next])
    },
    [expandedKeys, onExpand]
  )

  const closeDropdown = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const openDropdown = useCallback(() => {
    if (effectiveDisabled || isReadOnly) return
    setOpen(true)
  }, [effectiveDisabled, isReadOnly, setOpen])

  const toggleDropdown = useCallback(() => {
    if (effectiveDisabled || isReadOnly) return
    if (isOpen) closeDropdown()
    else openDropdown()
  }, [closeDropdown, effectiveDisabled, isOpen, isReadOnly, openDropdown])

  const focusCombobox = useCallback(() => {
    triggerRef.current?.focus()
  }, [])

  const commitKey = useCallback(
    (key: string | number) => {
      if (isReadOnly || effectiveDisabled) return
      const node = visibleItems.find((item) => sameTreeKey(item.key, key))?.node
      if (node) rememberTreeSelectLabel(labelCacheRef.current, key, node.label)
      const next = commitTreeSelectNode({
        treeData,
        key,
        value: selected,
        multiple,
        checkStrictly,
        checkStrategy
      })
      setSelected(next)
      if (multiple) {
        if (autoClearSearchValue) setSearchQuery('')
        return
      }
      closeDropdown()
      requestAnimationFrame(() => triggerRef.current?.focus())
    },
    [
      autoClearSearchValue,
      checkStrategy,
      checkStrictly,
      closeDropdown,
      multiple,
      selected,
      setSearchQuery,
      setSelected,
      treeData,
      visibleItems,
      isReadOnly,
      effectiveDisabled
    ]
  )

  const toggleExpand = useCallback(
    (key: string | number) => {
      setExpanded(toggleTreeSelectExpandedKey(expandedSet, key))
    },
    [expandedSet, setExpanded]
  )

  const loadChildren = useCallback(
    async (node: TreeNode, intent: 'select' | 'expand') => {
      if (!loadData || node.disabled) return
      const id = treeKeyId(node.key)
      const token = nextLoadToken(loadTokensRef.current, id)
      setLoadingKeys((current) => new Set(current).add(id))
      if (!treeSetHas(expandedSet, node.key)) {
        setExpanded(toggleTreeSelectExpandedKey(expandedSet, node.key))
      }
      try {
        const children = await loadData(node)
        if (!isCurrentLoadToken(loadTokensRef.current, id, token)) return
        loadedIdsRef.current.add(id)
        const inject = (nodes: TreeNode[]): TreeNode[] =>
          nodes.map((item) =>
            sameTreeKey(item.key, node.key)
              ? { ...item, children }
              : item.children
                ? { ...item, children: inject(item.children) }
                : item
          )
        setLoadedData((current) => inject(current ?? treeDataProp))
        const decision = decideAfterBranchLoad({
          childCount: children.length,
          intent,
          commitLoadedBranch: false
        })
        if (decision.expand && !treeSetHas(expandedSet, node.key)) {
          setExpanded(new Set(expandedSet).add(node.key))
        }
        if (decision.commit) commitKey(node.key)
      } catch {
        if (!isCurrentLoadToken(loadTokensRef.current, id, token)) return
      } finally {
        if (!isCurrentLoadToken(loadTokensRef.current, id, token)) return
        setLoadingKeys((current) => {
          const next = new Set(current)
          next.delete(id)
          return next
        })
      }
    },
    [commitKey, expandedSet, loadData, setExpanded, treeDataProp]
  )

  const handleNodeSelect = useCallback(
    (item: VisibleTreeItem) => {
      if (item.node.disabled || effectiveDisabled || isReadOnly) return
      const id = treeKeyId(item.key)
      const gate = gateBranchLoad({
        disabled: item.node.disabled,
        isLeaf: item.node.isLeaf,
        hasChildren: nodeHasChildren(item.node),
        hasLoadData,
        loaded: loadedIdsRef.current.has(id),
        loading: loadingKeys.has(id)
      })
      if (gate === 'reject') return
      if (gate === 'load') {
        void loadChildren(item.node, 'select')
        return
      }
      setActiveKey(item.key)
      commitKey(item.key)
    },
    [commitKey, effectiveDisabled, hasLoadData, isReadOnly, loadChildren, loadingKeys]
  )

  const handleExpandClick = useCallback(
    (item: VisibleTreeItem, event: { stopPropagation: () => void }) => {
      event.stopPropagation()
      if (item.node.disabled || isReadOnly) return
      const id = treeKeyId(item.key)
      const gate = gateBranchLoad({
        disabled: item.node.disabled,
        isLeaf: item.node.isLeaf,
        hasChildren: nodeHasChildren(item.node),
        hasLoadData,
        loaded: loadedIdsRef.current.has(id),
        loading: loadingKeys.has(id)
      })
      if (gate === 'load') {
        void loadChildren(item.node, 'expand')
        return
      }
      toggleExpand(item.key)
      setActiveKey(item.key)
    },
    [hasLoadData, isReadOnly, loadChildren, loadingKeys, toggleExpand]
  )

  const clearSelection = useCallback(
    (event?: { stopPropagation: () => void }) => {
      event?.stopPropagation()
      if (isReadOnly || effectiveDisabled) return
      setSelected(multiple ? [] : null)
      requestAnimationFrame(() => triggerRef.current?.focus())
    },
    [effectiveDisabled, isReadOnly, multiple, setSelected]
  )

  useEffect(() => {
    if (
      !shouldSeedTreeSelectFormDefault({
        alreadySeeded: seededRef.current,
        fieldName: formItemControl?.name,
        controlledValue: value,
        formValue: formItemControl?.value,
        defaultValue
      })
    ) {
      return
    }
    seededRef.current = true
    formItemControl?.onChange?.(normalizeTreeSelectValue(defaultValue, multiple))
  }, [defaultValue, formItemControl, multiple, value])

  useEffect(() => {
    const nextCount = countTreeNodes(treeData)
    const apply = shouldApplyTreeSelectDefaultExpandAll(
      treeCountRef.current,
      nextCount,
      defaultExpandAll
    )
    treeCountRef.current = nextCount
    if (!apply || expandedKeys !== undefined) return
    setLocalExpanded((current) =>
      getTreeSelectOpenExpandedKeys({
        treeData,
        selectedKeys,
        defaultExpandAll: true,
        expandedKeys: current
      })
    )
  }, [defaultExpandAll, expandedKeys, selectedKeys, treeData])

  useEffect(() => {
    if (!isOpen) return
    setExpanded(
      getTreeSelectOpenExpandedKeys({
        treeData,
        selectedKeys,
        defaultExpandAll: false,
        expandedKeys: expandedSet
      })
    )
    const visible = resolveTreeSelectVisibleItems({
      treeData,
      expandedKeys: expandedSet,
      searchQuery,
      filterFn
    })
    const index = getTreeSelectVisibleIndex(visible, selected)
    setActiveKey(visible[index]?.key ?? visible[0]?.key)
    if (searchable) searchInputRef.current?.focus()
    // only on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const applyTreeAction = useCallback(
    (key: string) => {
      const current = activeKey ?? visibleItems[0]?.key
      if (current === undefined) return
      const item = visibleItems.find((row) => sameTreeKey(row.key, current))
      if (!item) return
      const visual = calculateCheckedState(treeData, selectedKeys, checkStrictly)
      const fully = visual.checked.some((keyId) => sameTreeKey(keyId, current))
      const half = visual.halfChecked.some((keyId) => sameTreeKey(keyId, current))
      const action = getTreeKeyboardAction({
        key,
        nodeKey: current,
        currentKey: current,
        focusableKeys: visibleItems.filter((row) => !row.node.disabled).map((row) => row.key),
        parentKey: item.parentKey,
        firstChildKey: getFirstVisibleChildKey(visibleItems, current),
        isExpandable: isTreeNodeExpandable(item.node, hasLoadData),
        isExpanded: treeSetHas(expandedSet, current),
        isParentExpanded:
          item.parentKey !== undefined && treeSetHas(expandedSet, item.parentKey),
        isChecked: fully && !half,
        selectable: true,
        checkable: multiple,
        dir
      })
      if (!action) return false
      if (action.type === 'none') return key === 'Escape' ? false : true
      if (action.type === 'focus') {
        setActiveKey(action.key)
        return true
      }
      if (action.type === 'toggleExpand') {
        const target = visibleItems.find((row) => sameTreeKey(row.key, action.key))
        const gate = target
          ? gateBranchLoad({
              disabled: target.node.disabled,
              isLeaf: target.node.isLeaf,
              hasChildren: nodeHasChildren(target.node),
              hasLoadData,
              loaded: loadedIdsRef.current.has(treeKeyId(target.key)),
              loading: loadingKeys.has(treeKeyId(target.key))
            })
          : 'ready'
        if (target && gate === 'load' && !treeSetHas(expandedSet, target.key)) {
          void loadChildren(target.node, 'expand')
        } else {
          toggleExpand(action.key)
        }
        setActiveKey(action.key)
        return true
      }
      if (action.type === 'select' || action.type === 'check') {
        const target = visibleItems.find((row) => sameTreeKey(row.key, action.key))
        const gate = target
          ? gateBranchLoad({
              disabled: target.node.disabled,
              isLeaf: target.node.isLeaf,
              hasChildren: nodeHasChildren(target.node),
              hasLoadData,
              loaded: loadedIdsRef.current.has(treeKeyId(target.key)),
              loading: loadingKeys.has(treeKeyId(target.key))
            })
          : 'ready'
        if (target && gate === 'load') void loadChildren(target.node, 'select')
        else commitKey(action.key)
        return true
      }
      if (action.type === 'collapseAndFocus') {
        if (action.collapseKey !== undefined) toggleExpand(action.collapseKey)
        setActiveKey(action.focusKey)
        return true
      }
      return true
    },
    [
      activeKey,
      checkStrictly,
      commitKey,
      dir,
      expandedSet,
      hasLoadData,
      loadChildren,
      loadingKeys,
      multiple,
      selectedKeys,
      toggleExpand,
      treeData,
      visibleItems
    ]
  )

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (effectiveDisabled) return
    if (isReadOnly) return
    const fromSearchInput = event.currentTarget.tagName === 'INPUT'
    if (!isOpen && isSelectTypeaheadCharacter(event.key, event)) {
      event.preventDefault()
      openDropdown()
      if (searchable) setSearchQuery(event.key)
      return
    }
    const intent = getTreeSelectTriggerKeyIntent({
      key: event.key,
      open: isOpen,
      searchable,
      clearable,
      hasValue: !isTreeSelectValueEmpty(selected, multiple),
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
        triggerRef.current?.focus()
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
        const key = activeKey ?? visibleItems[0]?.key
        if (key !== undefined) commitKey(key)
        return
      }
      case 'tree-key': {
        event.preventDefault()
        const handled = applyTreeAction(intent.key)
        if (intent.key === 'Escape' && !handled) {
          closeDropdown()
          triggerRef.current?.focus()
        }
        return
      }
      default:
        return
    }
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (
      (rootRef.current && next && rootRef.current.contains(next)) ||
      (dropdownRef.current && next && dropdownRef.current.contains(next))
    ) {
      return
    }
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const virtualRange = getFixedVirtualRange(
    listScrollTop,
    listHeightPx,
    itemHeight,
    visibleItems.length,
    5
  )
  const activeInWindow =
    !virtual || (activeIndex >= virtualRange.startIndex && activeIndex <= virtualRange.endIndex)
  const activeOptionId =
    isOpen && activeKey !== undefined && activeInWindow
      ? getTreeSelectTreeItemId(treeId, activeKey)
      : undefined
  const comboboxAria = getPickerComboboxAria({
    expanded: isOpen,
    listboxId: treeId,
    activeOptionId,
    haspopup: 'tree'
  })
  const treeAria = getPickerTreeAria({
    id: treeId,
    multiselectable: multiple
  })

  return {
    rootRef,
    triggerRef,
    searchInputRef,
    dropdownRef,
    treeId,
    comboboxAria,
    treeAria,
    isOpen,
    searchable,
    searchQuery,
    setSearchQuery,
    displayText,
    placeholderText,
    emptyCopy,
    showClear,
    clearAriaLabel: selectLabels.clearAriaLabel,
    searchPlaceholder: selectLabels.searchPlaceholder,
    doneText: selectLabels.doneText,
    expandAriaLabel: treeLabels.expandAriaLabel,
    collapseAriaLabel: treeLabels.collapseAriaLabel,
    loadingText: selectLabels.loadingText,
    readOnly: isReadOnly,
    triggerClasses: getTreeSelectTriggerClasses({
      size,
      disabled: effectiveDisabled,
      isOpen,
      status,
      hasClear: showClear
    }),
    className: getTreeSelectRootClasses(inputGroup != null, className),
    chromeAttr: TIGER_CHROME_ATTR,
    status,
    shakeTrigger,
    effectiveId,
    effectiveName,
    effectiveDisabled,
    describedBy,
    labelledby,
    ariaLabel,
    required,
    size,
    virtual,
    height: listHeightPx,
    itemHeight,
    virtualListRef,
    onListScroll: setListScrollTop,
    dir,
    multiple,
    loading,
    loadingKeys,
    visibleItems,
    activeKey,
    setActiveKey,
    expandedSet,
    selectedKeys,
    hiddenValues: shouldSubmitNativeField({
      name: effectiveName,
      disabled: effectiveDisabled
    })
      ? serializeTreeSelectFormValues(selected, multiple)
      : [],
    checkedState: calculateCheckedState(treeData, selectedKeys, checkStrictly),
    isExpanded: (key: string | number) => treeSetHas(expandedSet, key),
    isLoadingKey: (key: string | number) => loadingKeys.has(treeKeyId(key)),
    handleNodeSelect,
    handleExpandClick,
    handleTriggerKeyDown,
    handleFocusOut,
    toggleDropdown,
    openDropdown,
    closeDropdown,
    clearSelection,
    focusCombobox,
    isExpandable: (node: TreeNode) => isTreeNodeExpandable(node, hasLoadData)
  }
}
