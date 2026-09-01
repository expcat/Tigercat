import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  TIGER_CHROME_ATTR,
  TREE_SELECT_DEFAULT_HEIGHT,
  coerceTreeSelectFormValue,
  commitTreeSelectNode,
  getEmptyLabels,
  getFirstVisibleChildKey,
  getPickerComboboxAria,
  getPickerTreeAria,
  getSelectLabels,
  getTreeKeyboardAction,
  getTreeSelectDisplayLabel,
  getTreeSelectOpenExpandedKeys,
  getTreeSelectRootClasses,
  getTreeSelectSelectedKeys,
  getTreeSelectTreeItemId,
  getTreeSelectTriggerClasses,
  getTreeSelectTriggerKeyIntent,
  getTreeSelectVirtualItemHeight,
  getTreeSelectVisibleIndex,
  isSelectTypeaheadCharacter,
  isTreeNodeExpandable,
  isTreeSelectValueEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  normalizeTreeSelectValue,
  rememberTreeSelectLabel,
  resolveTreeSelectVisibleItems,
  serializeTreeSelectFormValues,
  shouldShowTreeSelectClear,
  toggleTreeSelectExpandedKey,
  type InputStatus,
  type TreeNode,
  type TreeSelectValue,
  type VisibleTreeItem
} from '@expcat/tigercat-core'
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
    clearable = false,
    emptyText,
    multiple = false,
    checkStrictly = true,
    checkStrategy = 'all',
    defaultExpandAll = false,
    expandedKeys,
    defaultExpandedKeys,
    virtual = false,
    height = TREE_SELECT_DEFAULT_HEIGHT,
    itemHeight: itemHeightProp,
    loading = false,
    loadData,
    filterFn,
    autoClearSearchValue = true,
    labels: labelsOverride,
    onSearchChange,
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
  const labels = useMemo(
    () => getSelectLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const emptyLabels = useMemo(() => getEmptyLabels(mergedLocale), [mergedLocale])

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
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

  const incomingValue =
    value !== undefined ? value : coerceTreeSelectFormValue(formItemControl?.value, multiple)
  const [selected, setSelected] = useControlledState<TreeSelectValue>({
    value: incomingValue,
    defaultValue: defaultValue ?? (multiple ? EMPTY_MULTIPLE_VALUE : undefined),
    onChange: (next) => {
      const normalized = normalizeTreeSelectValue(next, multiple)
      onChange?.(normalized)
      formItemControl?.onChange?.(normalized)
    },
    postState: (next) => normalizeTreeSelectValue(next, multiple)
  })

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [searchQuery, setSearchQuery] = useControlledState({
    value: searchValue,
    defaultValue: defaultSearchValue,
    onChange: onSearchChange
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
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const treeDataPropRef = useRef(treeDataProp)

  if (treeDataPropRef.current !== treeDataProp) {
    treeDataPropRef.current = treeDataProp
    setLoadedData(null)
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
  const placeholderText = placeholder ?? labels.placeholder
  const displayText = isTreeSelectValueEmpty(selected, multiple) ? placeholderText : displayLabel
  const emptyCopy = loading
    ? labels.loadingText
    : emptyText?.trim()
      ? emptyText
      : emptyLabels.noResults
  const showClear = shouldShowTreeSelectClear({
    clearable,
    disabled: effectiveDisabled,
    value: selected,
    multiple
  })
  const itemHeight = itemHeightProp ?? getTreeSelectVirtualItemHeight(size)

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
    if (effectiveDisabled) return
    setOpen(true)
  }, [effectiveDisabled, setOpen])

  const toggleDropdown = useCallback(() => {
    if (effectiveDisabled) return
    if (isOpen) closeDropdown()
    else openDropdown()
  }, [closeDropdown, effectiveDisabled, isOpen, openDropdown])

  const focusCombobox = useCallback(() => {
    triggerRef.current?.focus()
  }, [])

  const commitKey = useCallback(
    (key: string | number) => {
      const node = visibleItems.find((item) => item.key === key)?.node
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
      visibleItems
    ]
  )

  const toggleExpand = useCallback(
    (key: string | number) => {
      setExpanded(toggleTreeSelectExpandedKey(expandedSet, key))
    },
    [expandedSet, setExpanded]
  )

  const loadChildren = useCallback(
    async (node: TreeNode) => {
      if (!loadData) return
      setLoadingKeys((current) => new Set(current).add(node.key))
      try {
        const children = await loadData(node)
        const inject = (nodes: TreeNode[]): TreeNode[] =>
          nodes.map((item) =>
            item.key === node.key
              ? { ...item, children, isLeaf: children.length === 0 ? true : item.isLeaf }
              : item.children
                ? { ...item, children: inject(item.children) }
                : item
          )
        setLoadedData((current) => inject(current ?? treeDataProp))
        setExpanded(new Set(expandedSet).add(node.key))
      } finally {
        setLoadingKeys((current) => {
          const next = new Set(current)
          next.delete(node.key)
          return next
        })
      }
    },
    [expandedSet, loadData, setExpanded, treeDataProp]
  )

  const handleNodeSelect = useCallback(
    (item: VisibleTreeItem) => {
      if (item.node.disabled || effectiveDisabled) return
      const expandable = isTreeNodeExpandable(item.node, hasLoadData)
      if (expandable && (!item.node.children || item.node.children.length === 0) && loadData) {
        void loadChildren(item.node)
        return
      }
      setActiveKey(item.key)
      commitKey(item.key)
    },
    [commitKey, effectiveDisabled, hasLoadData, loadChildren, loadData]
  )

  const handleExpandClick = useCallback(
    (item: VisibleTreeItem, event: { stopPropagation: () => void }) => {
      event.stopPropagation()
      if (item.node.disabled) return
      const expandable = isTreeNodeExpandable(item.node, hasLoadData)
      if (expandable && (!item.node.children || item.node.children.length === 0) && loadData) {
        void loadChildren(item.node)
        return
      }
      toggleExpand(item.key)
      setActiveKey(item.key)
    },
    [hasLoadData, loadChildren, loadData, toggleExpand]
  )

  const clearSelection = useCallback(
    (event?: { stopPropagation: () => void }) => {
      event?.stopPropagation()
      setSelected(multiple ? [] : undefined)
      requestAnimationFrame(() => triggerRef.current?.focus())
    },
    [multiple, setSelected]
  )

  useEffect(() => {
    if (expandedKeys !== undefined) return
    if (!defaultExpandAll) return
    setLocalExpanded((current) => {
      const next = getTreeSelectOpenExpandedKeys({
        treeData,
        selectedKeys,
        defaultExpandAll: true,
        expandedKeys: current
      })
      if (next.size === current.size && [...next].every((key) => current.has(key))) {
        return current
      }
      return next
    })
  }, [defaultExpandAll, expandedKeys, selectedKeys, treeData])

  useEffect(() => {
    if (!isOpen) return
    setExpanded(
      getTreeSelectOpenExpandedKeys({
        treeData,
        selectedKeys,
        defaultExpandAll,
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
      const item = visibleItems.find((row) => row.key === current)
      if (!item) return
      const action = getTreeKeyboardAction({
        key,
        nodeKey: current,
        currentKey: current,
        focusableKeys: visibleItems.filter((row) => !row.node.disabled).map((row) => row.key),
        parentKey: item.parentKey,
        firstChildKey: getFirstVisibleChildKey(visibleItems, current),
        isExpandable: isTreeNodeExpandable(item.node, hasLoadData),
        isExpanded: expandedSet.has(current),
        isParentExpanded: item.parentKey !== undefined && expandedSet.has(item.parentKey),
        isChecked: selectedKeys.includes(current),
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
        toggleExpand(action.key)
        setActiveKey(action.key)
        return true
      }
      if (action.type === 'select') {
        commitKey(action.key)
        return true
      }
      if (action.type === 'check') {
        commitKey(action.key)
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
      commitKey,
      dir,
      expandedSet,
      hasLoadData,
      multiple,
      selectedKeys,
      toggleExpand,
      visibleItems
    ]
  )

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (effectiveDisabled) return
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

  const activeOptionId =
    isOpen && activeKey !== undefined ? getTreeSelectTreeItemId(treeId, activeKey) : undefined
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
    clearAriaLabel: labels.clearAriaLabel,
    searchPlaceholder: labels.searchPlaceholder,
    doneText: labels.doneText,
    expandAriaLabel: labels.expandAriaLabel,
    collapseAriaLabel: labels.collapseAriaLabel,
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
    height,
    itemHeight,
    dir,
    multiple,
    loading,
    loadingKeys,
    visibleItems,
    activeKey,
    setActiveKey,
    expandedSet,
    selectedKeys,
    hiddenValues: effectiveName ? serializeTreeSelectFormValues(selected, multiple) : [],
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
