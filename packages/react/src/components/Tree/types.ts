import type React from 'react'
import type {
  TreeNode,
  TreeSelectionMode,
  TreeCheckStrategy,
  TreeCheckedState,
  TreeLoadDataFn,
  TreeFilterFn,
  TigerLocale,
  VisibleTreeItem
} from '@expcat/tigercat-core'

export interface TreeProps {
  /**
   * Tree data source
   */
  treeData?: TreeNode[]
  /**
   * Selection mode
   * When provided, it will override selectable/multiple.
   */
  selectionMode?: TreeSelectionMode
  /**
   * Whether to show checkboxes
   * @default false
   */
  checkable?: boolean
  /**
   * Whether to show expand/collapse icon
   * @default true
   */
  showIcon?: boolean
  /**
   * Whether to show connecting lines
   * @default false
   */
  showLine?: boolean
  /**
   * Default expanded node keys
   */
  defaultExpandedKeys?: (string | number)[]
  /**
   * Default selected node keys
   */
  defaultSelectedKeys?: (string | number)[]
  /**
   * Default checked node keys
   */
  defaultCheckedKeys?: (string | number)[]
  /**
   * Expanded node keys (controlled)
   */
  expandedKeys?: (string | number)[]
  /**
   * Selected node keys (controlled)
   */
  selectedKeys?: (string | number)[]
  /**
   * Checked node keys (controlled)
   */
  checkedKeys?: (string | number)[] | TreeCheckedState
  /**
   * Whether to expand all nodes by default
   * @default false
   */
  defaultExpandAll?: boolean
  /**
   * Whether parent and children are associated when checked
   * @default false
   */
  checkStrictly?: boolean
  /**
   * Check strategy for return values
   * @default 'all'
   */
  checkStrategy?: TreeCheckStrategy
  /**
   * Whether to allow node selection
   * @default true
   */
  selectable?: boolean
  /**
   * Whether multiple nodes can be selected
   * @default false
   */
  multiple?: boolean
  /**
   * Whether to load data asynchronously
   */
  loadData?: TreeLoadDataFn
  /**
   * Filter value for highlighting matched nodes
   */
  filterValue?: string
  /**
   * Custom filter function
   */
  filterFn?: TreeFilterFn
  /**
   * Whether to auto expand parent nodes when filtering
   * @default true
   */
  autoExpandParent?: boolean
  /**
   * Block node style (full width)
   * @default false
   */
  blockNode?: boolean
  /**
   * Empty state text
   * @default 'No data'
   */
  emptyText?: string

  /**
   * Accessible label for the tree container
   * @default 'Tree'
   */
  ariaLabel?: string
  /**
   * Expand event handler
   */
  onExpand?: (
    expandedKeys: (string | number)[],
    info: { expanded: boolean; node: TreeNode }
  ) => void
  /**
   * Select event handler
   */
  onSelect?: (
    selectedKeys: (string | number)[],
    info: {
      selected: boolean
      selectedNodes: TreeNode[]
      node: TreeNode
      event: React.SyntheticEvent
    }
  ) => void
  /**
   * Check event handler
   */
  onCheck?: (
    checkedKeys: (string | number)[],
    info: {
      checked: boolean
      checkedNodes: TreeNode[]
      node: TreeNode
      checkedNodesPositions: TreeCheckedState
    }
  ) => void
  /**
   * Node click event handler
   */
  onNodeClick?: (node: TreeNode, event: React.MouseEvent) => void
  /**
   * Node expand event handler
   */
  onNodeExpand?: (node: TreeNode, key: string | number) => void
  /**
   * Node collapse event handler
   */
  onNodeCollapse?: (node: TreeNode, key: string | number) => void
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show a built-in search input
   * @default false
   * @since 0.6.0
   */
  searchable?: boolean
  /**
   * Whether tree nodes are draggable
   * @default false
   */
  draggable?: boolean
  /**
   * Drop event handler
   */
  onDrop?: (info: { dragKey: string | number; dropKey: string | number }) => void
  /**
   * Enable virtualized rendering. The visible tree is flattened and rendered
   * through `VirtualList` with fixed item height. Recommended for large
   * trees (> ~200 visible items).
   * @default false
   * @since 1.x
   */
  virtual?: boolean
  /**
   * Pixel height of the virtualized scroll viewport.
   * @default 400
   */
  height?: number
  /**
   * Pixel height of each virtualized tree row.
   * @default 32
   * @since 1.x
   */
  itemHeight?: number
  locale?: Partial<TigerLocale>
}

/**
 * Internal context produced by {@link useTreeState} and consumed by the
 * `Tree.tsx` wrapper plus the `render-row` / `render-node` helpers. Mirrors the
 * `Table/` paradigm (state hook returns an immutable context object).
 */
export interface TreeContext {
  // resolved view props
  treeData: TreeNode[]
  className?: string
  ariaLabel: string
  emptyText?: string
  mergedLocale: Partial<TigerLocale> | undefined
  showIcon: boolean
  showLine: boolean
  blockNode: boolean
  checkable: boolean
  effectiveSelectable: boolean
  effectiveMultiple: boolean
  isDraggable: boolean
  searchable: boolean
  virtual: boolean
  height: number
  itemHeight: number

  // state / computed
  computedExpandedKeys: Set<string | number>
  computedSelectedKeys: Set<string | number>
  checkedSets: { checkedSet: Set<string | number>; halfCheckedSet: Set<string | number> }
  loadingNodes: Set<string | number>
  filteredNodeKeys: Set<string | number>
  visibleItems: VisibleTreeItem[]
  activeKey: string | number | undefined
  defaultActiveKey: string | number | undefined
  internalSearchValue: string
  setInternalSearchValue: (value: string) => void

  // refs
  itemRefs: React.MutableRefObject<Map<string | number, HTMLDivElement | null>>
  dragNodeKeyRef: React.MutableRefObject<string | number | null>

  // handlers
  setActiveKey: React.Dispatch<React.SetStateAction<string | number | undefined>>
  loadData?: TreeLoadDataFn
  onNodeClick?: (node: TreeNode, event: React.MouseEvent) => void
  onDrop?: (info: { dragKey: string | number; dropKey: string | number }) => void
  handleExpand: (nodeKey: string | number) => void
  handleSelect: (nodeKey: string | number, event: React.SyntheticEvent) => void
  handleCheck: (nodeKey: string | number, checked: boolean) => void
  handleKeyDown: (
    e: React.KeyboardEvent,
    node: TreeNode,
    isExpanded: boolean,
    isChecked: boolean
  ) => void
}
