import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  classNames,
  getTreeNodeClasses,
  getTreeNodeExpandIconClasses,
  treeBaseClasses,
  treeNodeWrapperClasses,
  treeNodeIndentClasses,
  treeNodeCheckboxClasses,
  treeNodeIconClasses,
  treeNodeLabelClasses,
  treeNodeChildrenClasses,
  treeLoadingClasses,
  treeEmptyStateClasses,
  treeLineClasses,
  getSpinnerSVG,
  getVisibleTreeItems,
  getParentKeys,
  getAllKeys,
  findNode,
  calculateCheckedState,
  handleNodeCheck,
  getCheckedKeysByStrategy,
  filterTreeNodes,
  getAutoExpandKeys,
  type TreeNode,
  type TreeSelectionMode,
  type TreeCheckStrategy,
  type TreeCheckedState,
  type TreeLoadDataFn,
  type TreeFilterFn,
} from '@tigercat/core';

const spinnerSvg = getSpinnerSVG('spinner');

// Expand icon component
const ExpandIcon: React.FC<{ expanded: boolean; hasChildren: boolean }> = ({
  expanded,
  hasChildren,
}) => {
  if (!hasChildren) {
    return <span className={treeNodeIndentClasses} />;
  }

  return (
    <svg
      className={getTreeNodeExpandIconClasses(expanded)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor">
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  );
};

// Loading spinner
const LoadingSpinner: React.FC = () => (
  <svg
    className={treeLoadingClasses}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={spinnerSvg.viewBox}>
    {spinnerSvg.elements.map((el, index) => {
      if (el.type === 'circle') return <circle key={index} {...el.attrs} />;
      if (el.type === 'path') return <path key={index} {...el.attrs} />;
      return null;
    })}
  </svg>
);

export interface TreeProps {
  /**
   * Tree data source
   */
  treeData?: TreeNode[];
  /**
   * Selection mode
   * When provided, it will override selectable/multiple.
   */
  selectionMode?: TreeSelectionMode;
  /**
   * Whether to show checkboxes
   * @default false
   */
  checkable?: boolean;
  /**
   * Whether to show expand/collapse icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Whether to show connecting lines
   * @default false
   */
  showLine?: boolean;
  /**
   * Default expanded node keys
   */
  defaultExpandedKeys?: (string | number)[];
  /**
   * Default selected node keys
   */
  defaultSelectedKeys?: (string | number)[];
  /**
   * Default checked node keys
   */
  defaultCheckedKeys?: (string | number)[];
  /**
   * Expanded node keys (controlled)
   */
  expandedKeys?: (string | number)[];
  /**
   * Selected node keys (controlled)
   */
  selectedKeys?: (string | number)[];
  /**
   * Checked node keys (controlled)
   */
  checkedKeys?: (string | number)[] | TreeCheckedState;
  /**
   * Whether to expand all nodes by default
   * @default false
   */
  defaultExpandAll?: boolean;
  /**
   * Whether parent and children are associated when checked
   * @default false
   */
  checkStrictly?: boolean;
  /**
   * Check strategy for return values
   * @default 'all'
   */
  checkStrategy?: TreeCheckStrategy;
  /**
   * Whether to allow node selection
   * @default true
   */
  selectable?: boolean;
  /**
   * Whether multiple nodes can be selected
   * @default false
   */
  multiple?: boolean;
  /**
   * Whether to load data asynchronously
   */
  loadData?: TreeLoadDataFn;
  /**
   * Filter value for highlighting matched nodes
   */
  filterValue?: string;
  /**
   * Custom filter function
   */
  filterFn?: TreeFilterFn;
  /**
   * Whether to auto expand parent nodes when filtering
   * @default true
   */
  autoExpandParent?: boolean;
  /**
   * Block node style (full width)
   * @default false
   */
  blockNode?: boolean;
  /**
   * Empty state text
   * @default 'No data'
   */
  emptyText?: string;

  /**
   * Accessible label for the tree container
   * @default 'Tree'
   */
  ariaLabel?: string;
  /**
   * Expand event handler
   */
  onExpand?: (
    expandedKeys: (string | number)[],
    info: { expanded: boolean; node: TreeNode }
  ) => void;
  /**
   * Select event handler
   */
  onSelect?: (
    selectedKeys: (string | number)[],
    info: {
      selected: boolean;
      selectedNodes: TreeNode[];
      node: TreeNode;
      event: React.SyntheticEvent;
    }
  ) => void;
  /**
   * Check event handler
   */
  onCheck?: (
    checkedKeys: (string | number)[],
    info: {
      checked: boolean;
      checkedNodes: TreeNode[];
      node: TreeNode;
      checkedNodesPositions: TreeCheckedState;
    }
  ) => void;
  /**
   * Node click event handler
   */
  onNodeClick?: (node: TreeNode, event: React.MouseEvent) => void;
  /**
   * Node expand event handler
   */
  onNodeExpand?: (node: TreeNode, key: string | number) => void;
  /**
   * Node collapse event handler
   */
  onNodeCollapse?: (node: TreeNode, key: string | number) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Tree: React.FC<TreeProps> = ({
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
  filterFn,
  autoExpandParent = true,
  blockNode = false,
  emptyText = 'No data',
  ariaLabel = 'Tree',
  onExpand,
  onSelect,
  onCheck,
  onNodeClick,
  onNodeExpand,
  onNodeCollapse,
  className,
}) => {
  const itemRefs = useRef(new Map<string | number, HTMLDivElement | null>());

  const effectiveSelectable = useMemo(() => {
    if (selectionMode !== undefined) {
      return selectionMode !== 'none';
    }
    return selectable;
  }, [selectionMode, selectable]);

  const effectiveMultiple = useMemo(() => {
    if (selectionMode !== undefined) {
      return selectionMode === 'multiple';
    }
    return multiple;
  }, [selectionMode, multiple]);

  // Internal state for expanded keys
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<
    Set<string | number>
  >(() => {
    // Explicit precedence:
    // 1) controlledExpandedKeys (even if empty)
    // 2) defaultExpandAll
    // 3) defaultExpandedKeys (when provided)
    if (controlledExpandedKeys !== undefined) {
      return new Set(controlledExpandedKeys);
    }

    if (defaultExpandAll) {
      return new Set(getAllKeys(treeData));
    }

    if (defaultExpandedKeys && defaultExpandedKeys.length > 0) {
      return new Set(defaultExpandedKeys);
    }

    return new Set();
  });

  // Internal state for selected keys
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<
    Set<string | number>
  >(
    () =>
      new Set(
        controlledSelectedKeys !== undefined
          ? controlledSelectedKeys
          : defaultSelectedKeys
      )
  );

  // Internal state for checked keys
  const [internalCheckedState, setInternalCheckedState] =
    useState<TreeCheckedState>(() => {
      if (controlledCheckedKeys !== undefined) {
        if (Array.isArray(controlledCheckedKeys)) {
          return calculateCheckedState(
            treeData,
            controlledCheckedKeys,
            checkStrictly
          );
        }
        return controlledCheckedKeys;
      }
      return calculateCheckedState(treeData, defaultCheckedKeys, checkStrictly);
    });

  // Loading state for lazy loading nodes
  const [loadingNodes, setLoadingNodes] = useState<Set<string | number>>(
    new Set()
  );

  // Filtered node keys
  const [filteredNodeKeys, setFilteredNodeKeys] = useState<
    Set<string | number>
  >(new Set());

  // Active (focus) key
  const [activeKey, setActiveKey] = useState<string | number>();

  // Computed expanded keys
  const computedExpandedKeys = useMemo(() => {
    if (controlledExpandedKeys !== undefined) {
      return new Set(controlledExpandedKeys);
    }
    return internalExpandedKeys;
  }, [controlledExpandedKeys, internalExpandedKeys]);

  const visibleItems = useMemo(
    () => getVisibleTreeItems(treeData, computedExpandedKeys, filteredNodeKeys),
    [treeData, computedExpandedKeys, filteredNodeKeys]
  );

  const focusableKeys = useMemo(
    () => visibleItems.filter((i) => !i.node.disabled).map((i) => i.key),
    [visibleItems]
  );

  const defaultActiveKey = focusableKeys[0];

  useEffect(() => {
    if (activeKey === undefined) return;
    itemRefs.current.get(activeKey)?.focus();
  }, [activeKey]);

  // Computed selected keys
  const computedSelectedKeys = useMemo(() => {
    if (controlledSelectedKeys !== undefined) {
      return new Set(controlledSelectedKeys);
    }
    return internalSelectedKeys;
  }, [controlledSelectedKeys, internalSelectedKeys]);

  // Computed checked state
  const computedCheckedState = useMemo(() => {
    if (controlledCheckedKeys !== undefined) {
      if (Array.isArray(controlledCheckedKeys)) {
        return calculateCheckedState(
          treeData,
          controlledCheckedKeys,
          checkStrictly
        );
      }
      return controlledCheckedKeys;
    }
    return internalCheckedState;
  }, [controlledCheckedKeys, internalCheckedState, treeData, checkStrictly]);

  // Update filtered nodes when filter value changes
  useEffect(() => {
    if (filterValue) {
      const matched = filterTreeNodes(treeData, filterValue, filterFn);
      setFilteredNodeKeys(matched);

      if (autoExpandParent) {
        const autoExpand = getAutoExpandKeys(treeData, matched);
        if (controlledExpandedKeys === undefined) {
          setInternalExpandedKeys((prev) => new Set([...prev, ...autoExpand]));
        }
      }
    } else {
      setFilteredNodeKeys(new Set());
    }
  }, [
    filterValue,
    treeData,
    filterFn,
    autoExpandParent,
    controlledExpandedKeys,
  ]);

  const handleExpand = useCallback(
    (nodeKey: string | number) => {
      const node = findNode(treeData, nodeKey);
      if (!node) return;

      const newExpandedKeys = new Set(computedExpandedKeys);
      const isExpanded = newExpandedKeys.has(nodeKey);

      if (isExpanded) {
        newExpandedKeys.delete(nodeKey);
        onNodeCollapse?.(node, nodeKey);
      } else {
        newExpandedKeys.add(nodeKey);
        onNodeExpand?.(node, nodeKey);

        // Lazy loading
        if (
          loadData &&
          !node.children &&
          !node.isLeaf &&
          !loadingNodes.has(nodeKey)
        ) {
          setLoadingNodes((prev) => new Set([...prev, nodeKey]));
          loadData(node)
            .then((children) => {
              // Update node children
              node.children = children;
              setLoadingNodes((prev) => {
                const next = new Set(prev);
                next.delete(nodeKey);
                return next;
              });
            })
            .catch(() => {
              setLoadingNodes((prev) => {
                const next = new Set(prev);
                next.delete(nodeKey);
                return next;
              });
              newExpandedKeys.delete(nodeKey);
            });
        }
      }

      if (controlledExpandedKeys === undefined) {
        setInternalExpandedKeys(newExpandedKeys);
      }

      onExpand?.(Array.from(newExpandedKeys), {
        expanded: !isExpanded,
        node,
      });
    },
    [
      treeData,
      computedExpandedKeys,
      loadData,
      loadingNodes,
      controlledExpandedKeys,
      onExpand,
      onNodeExpand,
      onNodeCollapse,
    ]
  );

  const handleSelect = useCallback(
    (nodeKey: string | number, event: React.SyntheticEvent) => {
      const node = findNode(treeData, nodeKey);
      if (!node || node.disabled || !effectiveSelectable) return;

      const newSelectedKeys = new Set(computedSelectedKeys);

      if (effectiveMultiple) {
        if (newSelectedKeys.has(nodeKey)) {
          newSelectedKeys.delete(nodeKey);
        } else {
          newSelectedKeys.add(nodeKey);
        }
      } else {
        newSelectedKeys.clear();
        newSelectedKeys.add(nodeKey);
      }

      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(newSelectedKeys);
      }

      const selectedKeysArray = Array.from(newSelectedKeys);
      onSelect?.(selectedKeysArray, {
        selected: newSelectedKeys.has(nodeKey),
        selectedNodes: selectedKeysArray
          .map((k) => findNode(treeData, k))
          .filter(Boolean) as TreeNode[],
        node,
        event,
      });
    },
    [
      treeData,
      computedSelectedKeys,
      effectiveSelectable,
      effectiveMultiple,
      controlledSelectedKeys,
      onSelect,
    ]
  );

  const handleCheck = useCallback(
    (nodeKey: string | number, checked: boolean) => {
      const node = findNode(treeData, nodeKey);
      if (!node || node.disabled) return;

      const currentCheckedKeys = computedCheckedState.checked;
      const newCheckedState = handleNodeCheck(
        treeData,
        nodeKey,
        checked,
        currentCheckedKeys,
        checkStrictly
      );

      if (controlledCheckedKeys === undefined) {
        setInternalCheckedState(newCheckedState);
      }

      const returnKeys = getCheckedKeysByStrategy(
        newCheckedState,
        treeData,
        checkStrategy
      );

      onCheck?.(returnKeys, {
        checked,
        checkedNodes: newCheckedState.checked
          .map((k) => findNode(treeData, k))
          .filter(Boolean) as TreeNode[],
        node,
        checkedNodesPositions: newCheckedState,
      });
    },
    [
      treeData,
      computedCheckedState,
      checkStrictly,
      checkStrategy,
      controlledCheckedKeys,
      onCheck,
    ]
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      node: TreeNode,
      isExpanded: boolean,
      isChecked: boolean
    ) => {
      if (node.disabled) return;

      const currentKey = activeKey ?? defaultActiveKey ?? node.key;
      const currentIndex = focusableKeys.findIndex((k) => k === currentKey);
      const isExpandable =
        !!(node.children && node.children.length > 0) ||
        !!(loadData && !node.isLeaf);

      const parents = getParentKeys(treeData, node.key);
      const parentKey = parents[parents.length - 1];

      const getFirstChildKey = () => {
        const list = visibleItems;
        const index = list.findIndex((i) => i.key === node.key);
        if (index < 0) return undefined;

        const base = list[index];
        for (let i = index + 1; i < list.length; i++) {
          const item = list[i];
          if (item.level <= base.level) break;
          if (item.parentKey === node.key && !item.node.disabled)
            return item.key;
        }

        return undefined;
      };

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveKey(focusableKeys[currentIndex + 1] ?? currentKey);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveKey(focusableKeys[currentIndex - 1] ?? currentKey);
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setActiveKey(focusableKeys[0] ?? currentKey);
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        setActiveKey(focusableKeys[focusableKeys.length - 1] ?? currentKey);
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isExpandable && !isExpanded) {
          handleExpand(node.key);
          return;
        }
        if (isExpandable && isExpanded) {
          setActiveKey(getFirstChildKey() ?? currentKey);
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isExpandable && isExpanded) {
          handleExpand(node.key);
          return;
        }
        if (parentKey !== undefined) {
          setActiveKey(parentKey);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (isExpandable && isExpanded) {
          handleExpand(node.key);
          return;
        }
        if (parentKey !== undefined) {
          if (computedExpandedKeys.has(parentKey)) {
            handleExpand(parentKey);
          }
          setActiveKey(parentKey);
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (effectiveSelectable) {
          handleSelect(node.key, e);
          return;
        }
        if (isExpandable) {
          handleExpand(node.key);
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        if (checkable) {
          handleCheck(node.key, !isChecked);
          return;
        }
        if (isExpandable) {
          handleExpand(node.key);
        }
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
      handleCheck,
    ]
  );

  const handleNodeClickInternal = useCallback(
    (node: TreeNode, event: React.MouseEvent) => {
      if (node.disabled) return;
      onNodeClick?.(node, event);
    },
    [onNodeClick]
  );

  const renderTreeNode = useCallback(
    (
      node: TreeNode,
      level: number,
      _parentKey?: string | number
    ): React.ReactNode => {
      const hasChildren = !!(node.children && node.children.length > 0);
      const isExpanded = computedExpandedKeys.has(node.key);
      const isSelected = computedSelectedKeys.has(node.key);
      const isChecked = computedCheckedState.checked.includes(node.key);
      const isHalfChecked = computedCheckedState.halfChecked.includes(node.key);
      const isLoading = loadingNodes.has(node.key);
      const isFiltered = filteredNodeKeys.size > 0;
      const isMatched = filteredNodeKeys.has(node.key);
      const isVisible = !isFiltered || isMatched;

      const isExpandable = hasChildren || !!(loadData && !node.isLeaf);
      const isFocusable =
        !node.disabled && node.key === (activeKey ?? defaultActiveKey);

      if (!isVisible) {
        return null;
      }

      const indent = [];
      for (let i = 0; i < level; i++) {
        indent.push(<span key={i} className={treeNodeIndentClasses} />);
      }

      // Node content
      const nodeContent = (
        <>
          {/* Indentation */}
          {indent}

          {/* Expand icon */}
          <span
            className={isExpandable ? 'cursor-pointer' : ''}
            onClick={(e) => {
              e.stopPropagation();
              if (isExpandable) {
                setActiveKey(node.key);
                handleExpand(node.key);
              }
            }}>
            <ExpandIcon expanded={isExpanded} hasChildren={isExpandable} />
          </span>

          {/* Checkbox */}
          {checkable && (
            <input
              type="checkbox"
              aria-label={`Select ${node.label}`}
              className={treeNodeCheckboxClasses}
              checked={isChecked}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isHalfChecked;
                }
              }}
              disabled={node.disabled}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                handleCheck(node.key, e.target.checked);
              }}
            />
          )}

          {showIcon && node.icon && (
            <span className={treeNodeIconClasses}>
              {node.icon as React.ReactNode}
            </span>
          )}

          {/* Label */}
          <span
            className={classNames(
              treeNodeLabelClasses,
              isFiltered && isMatched
                ? 'font-semibold text-[var(--tiger-primary,#2563eb)]'
                : ''
            )}>
            {node.label}
          </span>

          {/* Loading indicator */}
          {isLoading && <LoadingSpinner />}
        </>
      );

      return (
        <div key={node.key} className={treeNodeWrapperClasses}>
          {/* Node content */}
          <div
            className={getTreeNodeClasses(
              isSelected,
              !!node.disabled,
              blockNode
            )}
            ref={(el) => {
              itemRefs.current.set(node.key, el);
            }}
            role="treeitem"
            aria-level={level + 1}
            aria-disabled={node.disabled || undefined}
            aria-selected={effectiveSelectable ? isSelected : undefined}
            aria-expanded={isExpandable ? isExpanded : undefined}
            aria-checked={
              checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined
            }
            tabIndex={isFocusable ? 0 : -1}
            onFocus={() => {
              if (!node.disabled) setActiveKey(node.key);
            }}
            onKeyDown={(e) => handleKeyDown(e, node, isExpanded, isChecked)}
            onClick={(e) => {
              setActiveKey(node.key);
              handleNodeClickInternal(node, e);
              if (effectiveSelectable && !node.disabled) {
                handleSelect(node.key, e);
              }
            }}>
            {nodeContent}
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div
              className={classNames(
                treeNodeChildrenClasses,
                showLine && treeLineClasses
              )}>
              {node.children!.map((child) =>
                renderTreeNode(child, level + 1, node.key)
              )}
            </div>
          )}
        </div>
      );
    },
    [
      computedExpandedKeys,
      computedSelectedKeys,
      computedCheckedState,
      loadingNodes,
      filteredNodeKeys,
      activeKey,
      defaultActiveKey,
      loadData,
      checkable,
      blockNode,
      effectiveSelectable,
      showIcon,
      showLine,
      handleExpand,
      handleCheck,
      handleSelect,
      handleNodeClickInternal,
      handleKeyDown,
    ]
  );

  if (!treeData || treeData.length === 0) {
    return (
      <div
        className={classNames(treeBaseClasses, 'p-4', className)}
        role="tree"
        aria-label={ariaLabel}>
        <div className={treeEmptyStateClasses}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div
      className={classNames(treeBaseClasses, className)}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={effectiveMultiple || undefined}>
      {treeData.map((node) => renderTreeNode(node, 0))}
    </div>
  );
};

export default Tree;
