import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  EMPTY_TREE_DATA,
  EMPTY_TREE_KEYS,
  applyLoadedChildren,
  applyTreeDrop,
  applyTreeFilter,
  applyTreeKeyboard,
  createTreeKeyIdSet,
  decideAfterBranchLoad,
  filterTreeNodes,
  formatTreeSelectNodeLabel,
  gateBranchLoad,
  getTreeLabels,
  isCurrentLoadToken,
  lookupTreeNode,
  mergeLoadedChildren,
  mergeTigerLocale,
  nextLoadToken,
  nextTreeCheckedState,
  nextTreeExpandedKeys,
  nextTreeRangeSelection,
  nextTreeSelectedKeys,
  nodeHasChildren,
  createTypeaheadHighlight,
  reconcileUncontrolledExpandedKeys,
  resolveCheckedInput,
  resolveInitialExpandedKeys,
  resolveLocaleText,
  resolveOutwardCheckedKeys,
  resolveTreeDropPosition,
  resolveTreeKeyboardAction,
  resolveTreeSelection,
  alignTreeVirtualScroll,
  createTreeEdgeScroll,
  resolveDisplayedExpandedKeys,
  resolveTreeView,
  sameTreeKey,
  treeKeyId,
  uniqueTreeKeys,
  warnControlledExpandedFilter,
  devWarn,
  type TreeCheckedState,
  type TreeDropPosition,
  type TreeNode,
  type TreeNodeKey,
  type VirtualListHandle
} from '@expcat/tigercat-core'
import { useTigerConfig } from '../tiger-config'
import { useDrag } from '../../hooks/useDrag'
import type { TreeContext, TreeProps } from './types'

function checkedKeysInput(
  value: TreeNodeKey[] | TreeCheckedState | undefined
): TreeNodeKey[] | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value : value.checked
}

function sameKeyList(a: readonly TreeNodeKey[], b: readonly TreeNodeKey[]): boolean {
  if (a.length !== b.length) return false
  const ids = createTreeKeyIdSet(a)
  return b.every((key) => ids.has(treeKeyId(key)))
}

export function useTreeState(props: TreeProps): TreeContext & {
  virtualRef: React.RefObject<VirtualListHandle | null>
} {
  const {
    treeData: treeDataProp,
    selectionMode,
    checkable = false,
    showIcon = true,
    showLine = false,
    defaultExpandedKeys,
    defaultSelectedKeys,
    defaultCheckedKeys,
    expandedKeys: controlledExpandedKeys,
    selectedKeys: controlledSelectedKeys,
    checkedKeys: controlledCheckedKeys,
    defaultExpandAll = false,
    checkStrictly = false,
    checkStrategy = 'all',
    allowDeselect = false,
    loadData,
    loadedKeys: controlledLoadedKeys,
    searchValue,
    defaultSearchValue,
    searchable = false,
    filterFn,
    filterMode,
    autoExpandParent = true,
    expandOnClick = false,
    blockNode = false,
    emptyText,
    ariaLabel,
    onExpandedKeysChange,
    onSelectedKeysChange,
    onCheckedKeysChange,
    onSearch,
    onExpand,
    onSelect,
    onCheck,
    onLoad,
    onLoadedKeysChange,
    onDrop,
    onTreeDataChange,
    onNodeClick,
    onNodeExpand,
    onNodeCollapse,
    className,
    draggable = false,
    virtual = false,
    height = 400,
    itemHeight = 32,
    locale,
    'aria-labelledby': labelledBy
  } = props

  const treeData = treeDataProp ?? EMPTY_TREE_DATA
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getTreeLabels(mergedLocale), [mergedLocale])
  const dir = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const selection = resolveTreeSelection({ selectionMode })
  const edgeScroll = useRef(createTreeEdgeScroll())
  const hasLoadData = typeof loadData === 'function'

  const itemRefs = useRef(new Map<string, HTMLElement>())
  const virtualRef = useRef<VirtualListHandle | null>(null)
  const dropPosRef = useRef<TreeDropPosition>('inside')
  const savedExpandRef = useRef<TreeNodeKey[] | null>(null)
  const loadTokensRef = useRef(new Map<string, number>())
  const selectionAnchorRef = useRef<TreeNodeKey | null>(null)
  const typeaheadRef = useRef(createTypeaheadHighlight())
  const reactId = useId()
  const dragContainerId = `tiger-tree-${reactId}`
  const [dropIndicator, setDropIndicator] = useState<{
    key: TreeNodeKey
    position: TreeDropPosition
  } | null>(null)

  const [loadedMap, setLoadedMap] = useState(() => new Map<string, TreeNode[]>())
  const [dropTree, setDropTree] = useState<TreeNode[] | undefined>(undefined)
  const [dropTreeFrom, setDropTreeFrom] = useState<TreeNode[] | undefined>(undefined)
  if (dropTreeFrom !== undefined && dropTreeFrom !== treeData && dropTree !== undefined) {
    setDropTree(undefined)
    setDropTreeFrom(undefined)
  }

  const sourceTree = dropTree ?? treeData
  const derivedTree = useMemo(
    () => mergeLoadedChildren(sourceTree, loadedMap),
    [sourceTree, loadedMap]
  )

  const [userHasToggled, setUserHasToggled] = useState(false)
  const [internalExpanded, setInternalExpanded] = useState<TreeNodeKey[]>(
    () =>
      resolveInitialExpandedKeys({
        treeData: derivedTree,
        expandedKeys: controlledExpandedKeys,
        defaultExpandedKeys,
        defaultExpandAll
      }).keys
  )
  const [internalSelected, setInternalSelected] = useState<TreeNodeKey[]>(
    () => controlledSelectedKeys ?? defaultSelectedKeys ?? EMPTY_TREE_KEYS
  )
  const [internalChecked, setInternalChecked] = useState(() =>
    resolveCheckedInput(
      derivedTree,
      checkedKeysInput(controlledCheckedKeys),
      defaultCheckedKeys,
      checkStrictly
    )
  )
  const [loadingIds, setLoadingIds] = useState(() => new Set<string>())
  const [activeKey, setActiveKey] = useState<TreeNodeKey | undefined>(undefined)
  const [internalSearch, setInternalSearch] = useState(defaultSearchValue ?? '')

  useEffect(() => {
    if (controlledExpandedKeys !== undefined) return
    setInternalExpanded((current) =>
      reconcileUncontrolledExpandedKeys({
        current,
        treeData: derivedTree,
        defaultExpandAll,
        userHasToggled
      })
    )
  }, [derivedTree, defaultExpandAll, userHasToggled, controlledExpandedKeys])

  const computedExpanded =
    controlledExpandedKeys !== undefined ? controlledExpandedKeys : internalExpanded
  const computedSelected =
    controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelected
  const computedChecked =
    controlledCheckedKeys !== undefined
      ? resolveCheckedInput(
          derivedTree,
          checkedKeysInput(controlledCheckedKeys),
          undefined,
          checkStrictly
        )
      : internalChecked

  const searchQuery = searchValue !== undefined ? searchValue : internalSearch

  const matchedKeys = useMemo(
    () =>
      searchQuery ? filterTreeNodes(derivedTree, searchQuery, filterFn, filterMode) : undefined,
    [derivedTree, searchQuery, filterFn, filterMode]
  )

  useEffect(() => {
    const result = applyTreeFilter({
      treeData: derivedTree,
      query: searchQuery,
      filterFn,
      filterMode,
      autoExpandParent,
      currentExpanded: computedExpanded,
      savedExpanded: savedExpandRef.current
    })
    savedExpandRef.current = result.savedExpanded
    if (sameKeyList(computedExpanded, result.nextExpandedKeys)) return
    if (controlledExpandedKeys === undefined) {
      setInternalExpanded(result.nextExpandedKeys)
    }
    onExpandedKeysChange?.(result.nextExpandedKeys)
    if (controlledExpandedKeys !== undefined) warnControlledExpandedFilter(true)
  }, [
    derivedTree,
    searchQuery,
    filterFn,
    filterMode,
    autoExpandParent,
    computedExpanded,
    controlledExpandedKeys,
    onExpandedKeysChange
  ])

  const view = useMemo(
    () =>
      resolveTreeView({
        treeData: derivedTree,
        expandedKeys: computedExpanded,
        selectedKeys: computedSelected,
        checkedState: computedChecked,
        matchedKeys,
        loadingKeys: loadingIds,
        checkable,
        selectable: selection.selectable,
        hasLoadData
      }),
    [
      derivedTree,
      computedExpanded,
      computedSelected,
      computedChecked,
      searchQuery,
      matchedKeys,
      loadingIds,
      checkable,
      selection.selectable,
      hasLoadData
    ]
  )

  const loadedIds = useMemo(() => {
    const ids = new Set(loadedMap.keys())
    if (controlledLoadedKeys) {
      for (const key of controlledLoadedKeys) ids.add(treeKeyId(key))
    }
    return ids
  }, [loadedMap, controlledLoadedKeys])

  const commitExpanded = useCallback(
    (next: TreeNodeKey[], node: TreeNode, expanded: boolean) => {
      setUserHasToggled(true)
      if (controlledExpandedKeys === undefined) setInternalExpanded(next)
      onExpandedKeysChange?.(next)
      onExpand?.(next, { expanded, node })
      if (expanded) onNodeExpand?.(node, node.key)
      else onNodeCollapse?.(node, node.key)
    },
    [controlledExpandedKeys, onExpandedKeysChange, onExpand, onNodeExpand, onNodeCollapse]
  )

  const applyLoadedNode = useCallback(
    (node: TreeNode, children: TreeNode[], token: number, intent: 'select' | 'expand') => {
      const id = treeKeyId(node.key)
      if (!isCurrentLoadToken(loadTokensRef.current, id, token)) return
      setLoadedMap((prev) => {
        const nextMap = new Map(prev)
        nextMap.set(id, children)
        return nextMap
      })
      setLoadingIds((prev) => {
        const nextSet = new Set(prev)
        nextSet.delete(id)
        return nextSet
      })
      const nextTree = applyLoadedChildren(derivedTree, node.key, children)
      onLoad?.(node, children)
      onLoadedKeysChange?.(uniqueTreeKeys([...(controlledLoadedKeys ?? []), node.key]))
      onTreeDataChange?.(nextTree)
      const decision = decideAfterBranchLoad({
        childCount: children.length,
        intent,
        commitLoadedBranch: intent === 'select'
      })
      if (decision.commit && selection.selectable) {
        const next = nextTreeSelectedKeys({
          current: computedSelected,
          key: node.key,
          multiple: selection.multiple,
          allowDeselect
        })
        if (controlledSelectedKeys === undefined) setInternalSelected(next)
        onSelectedKeysChange?.(next)
        onSelect?.(next, {
          selected: next.some((key) => sameTreeKey(key, node.key)),
          selectedNodes: next
            .map((key) => lookupTreeNode(view.index, key))
            .filter((item): item is TreeNode => Boolean(item)),
          node
        })
      }
    },
    [
      derivedTree,
      onLoad,
      onLoadedKeysChange,
      controlledLoadedKeys,
      onTreeDataChange,
      selection.selectable,
      selection.multiple,
      computedSelected,
      allowDeselect,
      controlledSelectedKeys,
      onSelectedKeysChange,
      onSelect,
      view.index
    ]
  )

  const requestLoad = useCallback(
    (node: TreeNode, intent: 'select' | 'expand') => {
      if (!loadData || node.disabled) return
      const id = treeKeyId(node.key)
      const token = nextLoadToken(loadTokensRef.current, id)
      const expanded = computedExpanded.some((key) => sameTreeKey(key, node.key))
      if (!expanded) {
        commitExpanded(nextTreeExpandedKeys(computedExpanded, node.key, true), node, true)
      }
      setLoadingIds((prev) => new Set(prev).add(id))
      loadData(node)
        .then((children) => {
          applyLoadedNode(node, children, token, intent)
        })
        .catch(() => {
          if (!isCurrentLoadToken(loadTokensRef.current, id, token)) return
          setLoadingIds((prev) => {
            const nextSet = new Set(prev)
            nextSet.delete(id)
            return nextSet
          })
          devWarn('Tree.loadData', 'Tree loadData rejected; the node is not mutated.')
        })
    },
    [loadData, computedExpanded, commitExpanded, applyLoadedNode]
  )

  const handleExpand = useCallback(
    (nodeKey: TreeNodeKey) => {
      const node = lookupTreeNode(view.index, nodeKey)
      if (!node || node.disabled) return
      const expanded = computedExpanded.some((key) => sameTreeKey(key, nodeKey))
      if (!expanded) {
        const gate = gateBranchLoad({
          disabled: node.disabled,
          isLeaf: node.isLeaf,
          hasChildren: nodeHasChildren(node),
          hasLoadData,
          loaded: loadedIds.has(treeKeyId(node.key)),
          loading: loadingIds.has(treeKeyId(node.key))
        })
        if (gate === 'load') {
          requestLoad(node, 'expand')
          return
        }
      }
      const next = nextTreeExpandedKeys(computedExpanded, node.key, !expanded)
      commitExpanded(next, node, !expanded)
    },
    [view.index, computedExpanded, hasLoadData, loadedIds, loadingIds, requestLoad, commitExpanded]
  )

  const handleSelect = useCallback(
    (nodeKey: TreeNodeKey, shiftKey = false) => {
      const node = lookupTreeNode(view.index, nodeKey)
      if (!node || node.disabled || !selection.selectable) return
      const range =
        shiftKey && selection.multiple
          ? nextTreeRangeSelection({
              visibleKeys: view.visibleItems.map((item) => item.key),
              disabledKeys: view.visibleItems
                .filter((item) => lookupTreeNode(view.index, item.key)?.disabled)
                .map((item) => item.key),
              anchor: selectionAnchorRef.current ?? node.key,
              key: node.key
            })
          : null
      const next = range
        ? range.keys
        : nextTreeSelectedKeys({
            current: computedSelected,
            key: node.key,
            multiple: selection.multiple,
            allowDeselect
          })
      selectionAnchorRef.current = range ? range.anchor : node.key
      if (controlledSelectedKeys === undefined) setInternalSelected(next)
      onSelectedKeysChange?.(next)
      onSelect?.(next, {
        selected: next.some((key) => sameTreeKey(key, node.key)),
        selectedNodes: next
          .map((key) => lookupTreeNode(view.index, key))
          .filter((item): item is TreeNode => Boolean(item)),
        node
      })
    },
    [
      view.index,
      view.visibleItems,
      selection.selectable,
      selection.multiple,
      computedSelected,
      allowDeselect,
      controlledSelectedKeys,
      onSelectedKeysChange,
      onSelect
    ]
  )

  const handleCheck = useCallback(
    (nodeKey: TreeNodeKey, checked: boolean) => {
      const node = lookupTreeNode(view.index, nodeKey)
      if (!node || node.disabled) return
      const nextState = nextTreeCheckedState(
        derivedTree,
        node.key,
        checked,
        computedChecked.checked,
        checkStrictly
      )
      if (controlledCheckedKeys === undefined) setInternalChecked(nextState)
      const returnKeys = resolveOutwardCheckedKeys(
        nextState,
        derivedTree,
        checkStrategy,
        checkStrictly
      )
      onCheckedKeysChange?.(returnKeys)
      onCheck?.(returnKeys, {
        checked,
        checkedNodes: returnKeys
          .map((key) => lookupTreeNode(view.index, key))
          .filter((item): item is TreeNode => Boolean(item)),
        node,
        halfChecked: nextState.halfChecked
      })
    },
    [
      view.index,
      derivedTree,
      computedChecked.checked,
      checkStrictly,
      checkStrategy,
      controlledCheckedKeys,
      onCheckedKeysChange,
      onCheck
    ]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, nodeKey: TreeNodeKey) => {
      const labels = view.visibleItems.map((item) => {
        const entry = lookupTreeNode(view.index, item.key)
        return typeof entry?.label === 'string' || typeof entry?.label === 'number'
          ? String(entry.label)
          : ''
      })
      const from = view.visibleItems.findIndex((item) => sameTreeKey(item.key, nodeKey))
      const hit = typeaheadRef.current.push(
        event.key,
        labels,
        Math.max(0, from),
        view.visibleItems.map((item) => Boolean(lookupTreeNode(view.index, item.key)?.disabled))
      )
      if (hit && hit.index >= 0) {
        event.preventDefault()
        setActiveKey(view.visibleItems[hit.index].key)
        return
      }
      const action = resolveTreeKeyboardAction({
        key: event.key,
        nodeKey,
        view,
        expandedKeys: computedExpanded,
        activeKey,
        checkable,
        selectable: selection.selectable,
        hasLoadData,
        dir
      })
      const patch = applyTreeKeyboard(action)
      if (!patch.preventDefault) return
      event.preventDefault()
      event.stopPropagation()
      if (patch.activeKey !== undefined) {
        setActiveKey(patch.activeKey)
        const index = view.visibleItems.findIndex((item) => sameTreeKey(item.key, patch.activeKey))
        if (virtual) {
          alignTreeVirtualScroll(virtualRef.current?.getScrollElement(), index, itemHeight, height)
        }
        const id = treeKeyId(patch.activeKey)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => itemRefs.current.get(id)?.focus())
        })
      }
      if (patch.expandKey !== undefined) handleExpand(patch.expandKey)
      if (patch.selectKey !== undefined) {
        const node = lookupTreeNode(view.index, patch.selectKey)
        const gate = node
          ? gateBranchLoad({
              disabled: node.disabled,
              isLeaf: node.isLeaf,
              hasChildren: nodeHasChildren(node),
              hasLoadData,
              loaded: loadedIds.has(treeKeyId(node.key)),
              loading: loadingIds.has(treeKeyId(node.key))
            })
          : 'ready'
        if (node && gate === 'load') requestLoad(node, 'select')
        else handleSelect(patch.selectKey)
      }
      if (patch.checkKey !== undefined && patch.checkChecked !== undefined) {
        handleCheck(patch.checkKey, patch.checkChecked)
      }
    },
    [
      view,
      computedExpanded,
      activeKey,
      checkable,
      selection.selectable,
      hasLoadData,
      dir,
      handleExpand,
      handleSelect,
      handleCheck,
      virtual,
      loadedIds,
      loadingIds,
      requestLoad
    ]
  )

  const drag = useDrag({
    containerId: dragContainerId,
    onDrop: (event) => {
      const dropKey = event.overItem?.id
      if (dropKey == null || sameTreeKey(dropKey, event.item.id)) return
      const dropNode = lookupTreeNode(view.index, dropKey)
      const canInside = dropNode ? dropNode.isLeaf !== true : false
      const position = dropPosRef.current ?? (canInside ? 'inside' : 'after')
      const nextTree = applyTreeDrop({
        treeData: derivedTree,
        dragKey: event.item.id,
        dropKey,
        position
      })
      if (!nextTree) return
      if (treeDataProp === undefined || dropTree !== undefined) {
        setDropTree(nextTree)
        setDropTreeFrom(treeData)
      }
      onTreeDataChange?.(nextTree)
      onDrop?.({
        dragKey: event.item.id,
        dropKey,
        dropPosition: position,
        treeData: nextTree
      })
      setDropIndicator(null)
    }
  })

  useLayoutEffect(() => {
    if (activeKey === undefined) return
    const index = view.visibleItems.findIndex((item) => sameTreeKey(item.key, activeKey))
    if (index < 0) return
    if (virtual) {
      alignTreeVirtualScroll(virtualRef.current?.getScrollElement(), index, itemHeight, height)
    }
    const focus = () => itemRefs.current.get(treeKeyId(activeKey))?.focus()
    focus()
    const frame = requestAnimationFrame(focus)
    return () => cancelAnimationFrame(frame)
  }, [activeKey, view.visibleItems, virtual])

  const setSearchQuery = useCallback(
    (value: string) => {
      if (searchValue === undefined) setInternalSearch(value)
      onSearch?.(value)
    },
    [searchValue, onSearch]
  )

  return {
    treeData: derivedTree,
    className,
    ariaLabel: labelledBy
      ? undefined
      : resolveLocaleText(labels.ariaLabel, ariaLabel, labels.ariaLabel),
    labelledBy: typeof labelledBy === 'string' ? labelledBy : undefined,
    emptyText: resolveLocaleText(
      mergedLocale?.empty?.noData ?? mergedLocale?.common?.emptyText ?? 'No data',
      emptyText,
      mergedLocale?.empty?.noData,
      mergedLocale?.common?.emptyText
    ),
    showIcon,
    showLine,
    blockNode,
    checkable,
    selectable: selection.selectable,
    multiple: selection.multiple,
    draggable,
    searchable,
    virtual,
    height,
    itemHeight,
    searchQuery,
    setSearchQuery,
    searchPlaceholder: resolveLocaleText(
      'Search',
      mergedLocale?.common?.searchPlaceholder,
      mergedLocale?.select?.searchPlaceholder
    ),
    selectNodeLabel: (label) => formatTreeSelectNodeLabel(labels.selectNode, label),
    loadingText: resolveLocaleText(
      'Loading...',
      mergedLocale?.common?.loadingText,
      mergedLocale?.select?.loadingText
    ),
    dragContainerId,
    view,
    loadingIds,
    activeKey,
    dropKey: dropIndicator?.key,
    dropPosition: dropIndicator?.position,
    itemRefs,
    virtualRef,
    dir,
    setActiveKey,
    handleExpand,
    handleSelect,
    handleCheck,
    handleKeyDown,
    handleNodeClick: (node, event) => {
      if (node.disabled) return
      setActiveKey(node.key)
      onNodeClick?.(node, event)
      const gate = gateBranchLoad({
        disabled: node.disabled,
        isLeaf: node.isLeaf,
        hasChildren: nodeHasChildren(node),
        hasLoadData,
        loaded: loadedIds.has(treeKeyId(node.key)),
        loading: loadingIds.has(treeKeyId(node.key))
      })
      if (gate === 'load') {
        requestLoad(node, 'select')
        return
      }
      const expandable = !node.isLeaf && (nodeHasChildren(node) || Boolean(node.children?.length))
      if (expandOnClick && expandable) handleExpand(node.key)
      if (selection.selectable) handleSelect(node.key, event.shiftKey)
    },
    startTreeDrag: (nodeKey, event) => {
      const target = event.target as Element | null
      if (target?.closest('button, input, label, [data-tiger-tree-check]')) {
        event.preventDefault()
        return
      }
      const index = view.visibleItems.findIndex((item) => sameTreeKey(item.key, nodeKey))
      drag.startDrag(
        { id: nodeKey, index: Math.max(0, index), containerId: dragContainerId },
        event
      )
    },
    overTreeDrag: (nodeKey, event) => {
      event.preventDefault()
      const index = view.visibleItems.findIndex((item) => sameTreeKey(item.key, nodeKey))
      drag.dragOver({ id: nodeKey, index: Math.max(0, index), containerId: dragContainerId }, event)
      const node = lookupTreeNode(view.index, nodeKey)
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const position = resolveTreeDropPosition(
        event.clientY,
        rect.top,
        rect.height,
        node ? node.isLeaf !== true : false
      )
      dropPosRef.current = position
      setDropIndicator({ key: nodeKey, position })
      if (virtual) {
        const scroller = virtualRef.current?.getScrollElement()
        if (scroller) {
          const box = scroller.getBoundingClientRect()
          const edge = 24
          if (event.clientY < box.top + edge) edgeScroll.current.nudge(scroller, -16)
          else if (event.clientY > box.bottom - edge) edgeScroll.current.nudge(scroller, 16)
        }
      }
    },
    dropTreeDrag: (event) => {
      drag.drop(event)
      setDropIndicator(null)
    },
    endTreeDrag: () => {
      drag.endDrag()
      setDropIndicator(null)
    }
  }
}
