import type React from 'react'
import type {
  TigerLocale,
  TreeCheckInfo,
  TreeCheckStrategy,
  TreeCheckedState,
  TreeDropInfo,
  TreeExpandInfo,
  TreeFilterFn,
  TreeFilterMode,
  TreeLoadDataFn,
  TreeNode,
  TreeNodeKey,
  TreeSelectInfo,
  TreeSelectionMode,
  TreeView
} from '@expcat/tigercat-core'

export type { TreeNode, TreeNodeKey, TreeCheckedState, TreeDropInfo }

export interface TreeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'onChange' | 'onDrop' | 'onLoad' | 'onScroll'
> {
  treeData?: TreeNode[]
  selectionMode?: TreeSelectionMode
  checkable?: boolean
  /** Whether to render `node.icon`. Chevron is always shown for expandable nodes. */
  showIcon?: boolean
  showLine?: boolean
  defaultExpandedKeys?: TreeNodeKey[]
  defaultSelectedKeys?: TreeNodeKey[]
  defaultCheckedKeys?: TreeNodeKey[]
  expandedKeys?: TreeNodeKey[]
  selectedKeys?: TreeNodeKey[]
  checkedKeys?: TreeNodeKey[] | TreeCheckedState
  defaultExpandAll?: boolean
  checkStrictly?: boolean
  checkStrategy?: TreeCheckStrategy
  selectable?: boolean
  multiple?: boolean
  allowDeselect?: boolean
  loadData?: TreeLoadDataFn
  loadedKeys?: TreeNodeKey[]
  filterValue?: string
  searchValue?: string
  defaultSearchValue?: string
  searchable?: boolean
  filterFn?: TreeFilterFn
  filterMode?: TreeFilterMode
  autoExpandParent?: boolean
  blockNode?: boolean
  emptyText?: string
  ariaLabel?: string
  onExpandedKeysChange?: (expandedKeys: TreeNodeKey[]) => void
  onSelectedKeysChange?: (selectedKeys: TreeNodeKey[]) => void
  onCheckedKeysChange?: (checkedKeys: TreeNodeKey[]) => void
  onSearch?: (value: string) => void
  onExpand?: (expandedKeys: TreeNodeKey[], info: TreeExpandInfo) => void
  onSelect?: (selectedKeys: TreeNodeKey[], info: TreeSelectInfo) => void
  onCheck?: (checkedKeys: TreeNodeKey[], info: TreeCheckInfo) => void
  onLoad?: (node: TreeNode, children: TreeNode[]) => void
  onLoadedKeysChange?: (loadedKeys: TreeNodeKey[]) => void
  onDrop?: (info: TreeDropInfo) => void
  onTreeDataChange?: (treeData: TreeNode[]) => void
  onNodeClick?: (node: TreeNode, event: React.MouseEvent) => void
  onNodeExpand?: (node: TreeNode, key: TreeNodeKey) => void
  onNodeCollapse?: (node: TreeNode, key: TreeNodeKey) => void
  className?: string
  draggable?: boolean
  virtual?: boolean
  height?: number
  itemHeight?: number
  locale?: Partial<TigerLocale>
}

export interface TreeContext {
  treeData: TreeNode[]
  className?: string
  ariaLabel?: string
  labelledBy?: string
  emptyText?: string
  showIcon: boolean
  showLine: boolean
  blockNode: boolean
  checkable: boolean
  selectable: boolean
  multiple: boolean
  draggable: boolean
  searchable: boolean
  virtual: boolean
  height: number
  itemHeight: number
  searchQuery: string
  setSearchQuery: (value: string) => void
  searchPlaceholder: string
  selectNodeLabel: (label: string) => string
  view: TreeView
  loadingIds: Set<string>
  activeKey?: TreeNodeKey
  dropKey?: TreeNodeKey
  dropPosition?: 'before' | 'after' | 'inside'
  itemRefs: React.MutableRefObject<Map<string, HTMLElement>>
  dir: 'ltr' | 'rtl'
  setActiveKey: (key: TreeNodeKey | undefined) => void
  handleExpand: (nodeKey: TreeNodeKey) => void
  handleSelect: (nodeKey: TreeNodeKey) => void
  handleCheck: (nodeKey: TreeNodeKey, checked: boolean) => void
  handleKeyDown: (event: React.KeyboardEvent, nodeKey: TreeNodeKey) => void
  handleNodeClick: (node: TreeNode, event: React.MouseEvent) => void
  startTreeDrag: (nodeKey: TreeNodeKey, event: React.DragEvent) => void
  overTreeDrag: (nodeKey: TreeNodeKey, event: React.DragEvent) => void
  dropTreeDrag: (event: React.DragEvent) => void
  endTreeDrag: () => void
}
