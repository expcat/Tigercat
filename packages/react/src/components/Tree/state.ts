import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  getVisibleTreeItems,
  getFirstVisibleChildKey,
  getTreeKeyboardAction,
  getParentKeys,
  getAllKeys,
  findNode,
  calculateCheckedState,
  handleNodeCheck,
  getCheckedKeysByStrategy,
  filterTreeNodes,
  getAutoExpandKeys,
  checkedSetsFromState,
  mergeTigerLocale,
  type TreeNode,
  type TreeCheckedState
} from '@expcat/tigercat-core'
import { useTigerConfig } from '../ConfigProvider'
import type { TreeProps, TreeContext } from './types'

export function useTreeState(props: TreeProps): TreeContext {
  const {
    treeData = [],
    selectionMode,
    checkable = false,
    showIcon = true,
    showLine = false,
    defaultExpandedKeys = [],
    defaultSelectedKeys = [],
    defaultCheckedKeys = [],
    expandedKeys: controlledExpandedKeys,
    selectedKeys: controlledSelectedKeys,
    checkedKeys: controlledCheckedKeys,
    defaultExpandAll = false,
    checkStrictly = false,
    checkStrategy = 'all',
    selectable = true,
    multiple = false,
    loadData,
    filterValue = '',
    searchable = false,
    filterFn,
    autoExpandParent = true,
    blockNode = false,
    emptyText,
    ariaLabel = 'Tree',
    onExpand,
    onSelect,
    onCheck,
    onNodeClick,
    onNodeExpand,
    onNodeCollapse,
    className,
    draggable: isDraggable = false,
    onDrop,
    virtual = false,
    height = 400,
    itemHeight = 32,
    locale
  } = props

  const itemRefs = useRef(new Map<string | number, HTMLDivElement | null>())
  const dragNodeKeyRef = useRef<string | number | null>(null)
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )

  const effectiveSelectable = useMemo(() => {
    if (selectionMode !== undefined) {
      return selectionMode !== 'none'
    }
    return selectable
  }, [selectionMode, selectable])

  const effectiveMultiple = useMemo(() => {
    if (selectionMode !== undefined) {
      return selectionMode === 'multiple'
    }
    return multiple
  }, [selectionMode, multiple])

  // Internal state for expanded keys
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string | number>>(() => {
    // Explicit precedence:
    // 1) controlledExpandedKeys (even if empty)
    // 2) defaultExpandAll
    // 3) defaultExpandedKeys (when provided)
    if (controlledExpandedKeys !== undefined) {
      return new Set(controlledExpandedKeys)
    }

    if (defaultExpandAll) {
      return new Set(getAllKeys(treeData))
    }

    if (defaultExpandedKeys && defaultExpandedKeys.length > 0) {
      return new Set(defaultExpandedKeys)
    }

    return new Set()
  })

  // Internal state for selected keys
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string | number>>(
    () =>
      new Set(controlledSelectedKeys !== undefined ? controlledSelectedKeys : defaultSelectedKeys)
  )

  // Internal state for checked keys
  const [internalCheckedState, setInternalCheckedState] = useState<TreeCheckedState>(() => {
    if (controlledCheckedKeys !== undefined) {
      if (Array.isArray(controlledCheckedKeys)) {
        return calculateCheckedState(treeData, controlledCheckedKeys, checkStrictly)
      }
      return controlledCheckedKeys
    }
    return calculateCheckedState(treeData, defaultCheckedKeys, checkStrictly)
  })

  // Loading state for lazy loading nodes
  const [loadingNodes, setLoadingNodes] = useState<Set<string | number>>(new Set())

  // Filtered node keys
  const [filteredNodeKeys, setFilteredNodeKeys] = useState<Set<string | number>>(new Set())

  // Active (focus) key
  const [activeKey, setActiveKey] = useState<string | number>()

  // Computed expanded keys
  const computedExpandedKeys = useMemo(() => {
    if (controlledExpandedKeys !== undefined) {
      return new Set(controlledExpandedKeys)
    }
    return internalExpandedKeys
  }, [controlledExpandedKeys, internalExpandedKeys])

  const visibleItems = useMemo(
    () => getVisibleTreeItems(treeData, computedExpandedKeys, filteredNodeKeys),
    [treeData, computedExpandedKeys, filteredNodeKeys]
  )

  const focusableKeys = useMemo(
    () => visibleItems.filter((i) => !i.node.disabled).map((i) => i.key),
    [visibleItems]
  )

  const defaultActiveKey = focusableKeys[0]

  useEffect(() => {
    if (activeKey === undefined) return
    itemRefs.current.get(activeKey)?.focus()
  }, [activeKey])

  // Computed selected keys
  const computedSelectedKeys = useMemo(() => {
    if (controlledSelectedKeys !== undefined) {
      return new Set(controlledSelectedKeys)
    }
    return internalSelectedKeys
  }, [controlledSelectedKeys, internalSelectedKeys])

  // Computed checked state
  const computedCheckedState = useMemo(() => {
    if (controlledCheckedKeys !== undefined) {
      if (Array.isArray(controlledCheckedKeys)) {
        return calculateCheckedState(treeData, controlledCheckedKeys, checkStrictly)
      }
      return controlledCheckedKeys
    }
    return internalCheckedState
  }, [controlledCheckedKeys, internalCheckedState, treeData, checkStrictly])

  const checkedSets = useMemo(
    () => checkedSetsFromState(computedCheckedState),
    [computedCheckedState]
  )

  // v0.6.0: internal search state
  const [internalSearchValue, setInternalSearchValue] = useState('')
  const effectiveFilterValue = searchable ? internalSearchValue : filterValue

  // Update filtered nodes when filter value changes
  useEffect(() => {
    if (effectiveFilterValue) {
      const matched = filterTreeNodes(treeData, effectiveFilterValue, filterFn)
      setFilteredNodeKeys(matched)

      if (autoExpandParent) {
        const autoExpand = getAutoExpandKeys(treeData, matched)
        if (controlledExpandedKeys === undefined) {
          setInternalExpandedKeys((prev) => new Set([...prev, ...autoExpand]))
        }
      }
    } else {
      setFilteredNodeKeys(new Set())
    }
  }, [effectiveFilterValue, treeData, filterFn, autoExpandParent, controlledExpandedKeys])

  const handleExpand = useCallback(
    (nodeKey: string | number) => {
      const node = findNode(treeData, nodeKey)
      if (!node) return

      const newExpandedKeys = new Set(computedExpandedKeys)
      const isExpanded = newExpandedKeys.has(nodeKey)

      if (isExpanded) {
        newExpandedKeys.delete(nodeKey)
        onNodeCollapse?.(node, nodeKey)
      } else {
        newExpandedKeys.add(nodeKey)
        onNodeExpand?.(node, nodeKey)

        // Lazy loading
        if (loadData && !node.children && !node.isLeaf && !loadingNodes.has(nodeKey)) {
          setLoadingNodes((prev) => new Set([...prev, nodeKey]))
          loadData(node)
            .then((children) => {
              // Update node children
              node.children = children
              setLoadingNodes((prev) => {
                const next = new Set(prev)
                next.delete(nodeKey)
                return next
              })
            })
            .catch(() => {
              setLoadingNodes((prev) => {
                const next = new Set(prev)
                next.delete(nodeKey)
                return next
              })
            })
        }
      }

      if (controlledExpandedKeys === undefined) {
        setInternalExpandedKeys(newExpandedKeys)
      }

      onExpand?.(Array.from(newExpandedKeys), {
        expanded: !isExpanded,
        node
      })
    },
    [
      treeData,
      computedExpandedKeys,
      loadData,
      loadingNodes,
      controlledExpandedKeys,
      onExpand,
      onNodeExpand,
      onNodeCollapse
    ]
  )

  const handleSelect = useCallback(
    (nodeKey: string | number, event: React.SyntheticEvent) => {
      const node = findNode(treeData, nodeKey)
      if (!node || node.disabled || !effectiveSelectable) return

      const newSelectedKeys = new Set(computedSelectedKeys)

      if (effectiveMultiple) {
        if (newSelectedKeys.has(nodeKey)) {
          newSelectedKeys.delete(nodeKey)
        } else {
          newSelectedKeys.add(nodeKey)
        }
      } else {
        newSelectedKeys.clear()
        newSelectedKeys.add(nodeKey)
      }

      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(newSelectedKeys)
      }

      const selectedKeysArray = Array.from(newSelectedKeys)
      onSelect?.(selectedKeysArray, {
        selected: newSelectedKeys.has(nodeKey),
        selectedNodes: selectedKeysArray
          .map((k) => findNode(treeData, k))
          .filter(Boolean) as TreeNode[],
        node,
        event
      })
    },
    [
      treeData,
      computedSelectedKeys,
      effectiveSelectable,
      effectiveMultiple,
      controlledSelectedKeys,
      onSelect
    ]
  )

  const handleCheck = useCallback(
    (nodeKey: string | number, checked: boolean) => {
      const node = findNode(treeData, nodeKey)
      if (!node || node.disabled) return

      const currentCheckedKeys = computedCheckedState.checked
      const newCheckedState = handleNodeCheck(
        treeData,
        nodeKey,
        checked,
        currentCheckedKeys,
        checkStrictly
      )

      if (controlledCheckedKeys === undefined) {
        setInternalCheckedState(newCheckedState)
      }

      const returnKeys = getCheckedKeysByStrategy(newCheckedState, treeData, checkStrategy)

      onCheck?.(returnKeys, {
        checked,
        checkedNodes: newCheckedState.checked
          .map((k) => findNode(treeData, k))
          .filter(Boolean) as TreeNode[],
        node,
        checkedNodesPositions: newCheckedState
      })
    },
    [treeData, computedCheckedState, checkStrictly, checkStrategy, controlledCheckedKeys, onCheck]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, node: TreeNode, isExpanded: boolean, isChecked: boolean) => {
      if (node.disabled) return

      const currentKey = activeKey ?? defaultActiveKey ?? node.key
      const isExpandable =
        !!(node.children && node.children.length > 0) || !!(loadData && !node.isLeaf)

      const parents = getParentKeys(treeData, node.key)
      const parentKey = parents[parents.length - 1]

      const action = getTreeKeyboardAction({
        key: e.key,
        nodeKey: node.key,
        currentKey,
        focusableKeys,
        parentKey,
        firstChildKey: getFirstVisibleChildKey(visibleItems, node.key),
        isExpandable,
        isExpanded,
        isParentExpanded: parentKey !== undefined && computedExpandedKeys.has(parentKey),
        isChecked,
        selectable: effectiveSelectable,
        checkable
      })

      if (!action) return
      e.preventDefault()

      switch (action.type) {
        case 'focus':
          setActiveKey(action.key)
          break
        case 'toggleExpand':
          handleExpand(action.key)
          break
        case 'select':
          handleSelect(action.key, e)
          break
        case 'check':
          handleCheck(action.key, action.checked)
          break
        case 'collapseAndFocus':
          if (action.collapseKey !== undefined) handleExpand(action.collapseKey)
          setActiveKey(action.focusKey)
          break
      }
    },
    [
      activeKey,
      defaultActiveKey,
      focusableKeys,
      visibleItems,
      treeData,
      loadData,
      checkable,
      computedExpandedKeys,
      effectiveSelectable,
      handleExpand,
      handleSelect,
      handleCheck
    ]
  )

  return {
    treeData,
    className,
    ariaLabel,
    emptyText,
    mergedLocale,
    showIcon,
    showLine,
    blockNode,
    checkable,
    effectiveSelectable,
    effectiveMultiple,
    isDraggable,
    searchable,
    virtual,
    height,
    itemHeight,
    computedExpandedKeys,
    computedSelectedKeys,
    checkedSets,
    loadingNodes,
    filteredNodeKeys,
    visibleItems,
    activeKey,
    defaultActiveKey,
    internalSearchValue,
    setInternalSearchValue,
    itemRefs,
    dragNodeKeyRef,
    setActiveKey,
    loadData,
    onNodeClick,
    onDrop,
    handleExpand,
    handleSelect,
    handleCheck,
    handleKeyDown
  }
}
