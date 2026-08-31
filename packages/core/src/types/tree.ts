/**
 * Tree component types and interfaces
 */

/**
 * Unique key for a tree node. `1` and `'1'` identify the same node.
 */
export type TreeNodeKey = string | number

/**
 * Tree node data structure
 */
export interface TreeNode {
  /**
   * Unique key for the tree node
   */
  key: TreeNodeKey
  /**
   * Node label/title
   */
  label: string
  /**
   * Child nodes
   */
  children?: TreeNode[]
  /**
   * Whether the node is disabled
   */
  disabled?: boolean
  /**
   * Whether the node is a leaf. `true` never expands, even with children.
   */
  isLeaf?: boolean
  /**
   * Framework node rendered when `showIcon` is on. Strings render as text;
   * other values are left to the Vue/React layer.
   */
  icon?: unknown
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Tree selection mode
 */
export type TreeSelectionMode = 'none' | 'single' | 'multiple'

/**
 * Tree check strategy - determines which nodes to return when checked
 */
export type TreeCheckStrategy = 'all' | 'parent' | 'child'

/**
 * Lookup map of expanded keys. `expandedKeys` on the component is always an
 * array; convert with `treeExpandedStateFromKeys` / `treeExpandedKeysFromState`.
 */
export interface TreeExpandedState {
  [key: string]: boolean
}

/**
 * Tree node selected/checked state
 */
export interface TreeCheckedState {
  checked: TreeNodeKey[]
  halfChecked: TreeNodeKey[]
}

/**
 * Lazy load function type
 */
export type TreeLoadDataFn = (node: TreeNode) => Promise<TreeNode[]>

/**
 * Tree filter function type
 */
export type TreeFilterFn = (value: string, node: TreeNode) => boolean

/**
 * Filter matching: `subtree` keeps children of a matched node, `match-only`
 * keeps only matched nodes and their ancestors.
 */
export type TreeFilterMode = 'subtree' | 'match-only'

/**
 * Drop placement relative to the target node.
 */
export type TreeDropPosition = 'before' | 'after' | 'inside'

export interface TreeExpandInfo {
  expanded: boolean
  node: TreeNode
}

export interface TreeSelectInfo {
  selected: boolean
  selectedNodes: TreeNode[]
  node: TreeNode
}

export interface TreeCheckInfo {
  checked: boolean
  checkedNodes: TreeNode[]
  node: TreeNode
  halfChecked: TreeNodeKey[]
}

export interface TreeDropInfo {
  dragKey: TreeNodeKey
  dropKey: TreeNodeKey
  dropPosition: TreeDropPosition
  treeData: TreeNode[]
}

/**
 * Shared tree props. Framework layers add `on*` vs `update:*` / `v-model`.
 */
export interface TreeProps {
  /**
   * Tree data source
   */
  treeData?: TreeNode[]
  /**
   * Selection mode. When set, overrides `selectable` / `multiple`.
   * Omit to use `selectable` (default true) and `multiple` (default false).
   */
  selectionMode?: TreeSelectionMode
  /**
   * Whether to show checkboxes
   * @default false
   */
  checkable?: boolean
  /**
   * Whether to render `node.icon`. Chevron is always shown for expandable nodes.
   * @default true
   */
  showIcon?: boolean
  /**
   * Whether to show connecting lines. Same drawing in virtual and non-virtual.
   * @default false
   */
  showLine?: boolean
  /**
   * Default expanded node keys (uncontrolled)
   */
  defaultExpandedKeys?: TreeNodeKey[]
  /**
   * Default selected node keys (uncontrolled)
   */
  defaultSelectedKeys?: TreeNodeKey[]
  /**
   * Default checked node keys (uncontrolled)
   */
  defaultCheckedKeys?: TreeNodeKey[]
  /**
   * Expanded node keys. `undefined` is uncontrolled; an array (including `[]`)
   * is controlled. Takes precedence over `defaultExpandAll` / `defaultExpandedKeys`.
   */
  expandedKeys?: TreeNodeKey[]
  /**
   * Selected node keys. `undefined` is uncontrolled; `[]` is controlled empty.
   */
  selectedKeys?: TreeNodeKey[]
  /**
   * Checked node keys. Arrays in, arrays out. Objects are accepted as an input
   * snapshot (`checked` + `halfChecked`) and still emit an array.
   */
  checkedKeys?: TreeNodeKey[] | TreeCheckedState
  /**
   * Expand every current node. Combined with `defaultExpandedKeys` (union) when
   * uncontrolled. Applied again when `treeData` later fills in, until the user
   * toggles a node.
   * @default false
   */
  defaultExpandAll?: boolean
  /**
   * Whether parent and children are independent when checked
   * @default false
   */
  checkStrictly?: boolean
  /**
   * Check strategy for returned keys
   * @default 'all'
   */
  checkStrategy?: TreeCheckStrategy
  /**
   * Whether clicking a node selects it. Ignored when `selectionMode` is set.
   * @default true
   */
  selectable?: boolean
  /**
   * Whether multiple nodes can be selected. Ignored when `selectionMode` is set.
   * @default false
   */
  multiple?: boolean
  /**
   * Allow clicking a selected single-select node to clear it.
   * @default false
   */
  allowDeselect?: boolean
  /**
   * Whether to load data asynchronously. Must not mutate the incoming node.
   */
  loadData?: TreeLoadDataFn
  /**
   * Keys whose children have already been loaded (controlled overlay).
   */
  loadedKeys?: TreeNodeKey[]
  /**
   * Filter query that **hides** unmatched nodes. Same channel as `searchValue`.
   */
  filterValue?: string
  /**
   * Controlled search / filter query. Same channel as `filterValue`.
   */
  searchValue?: string
  /**
   * Uncontrolled search / filter query.
   */
  defaultSearchValue?: string
  /**
   * Whether to show the built-in search input. Does not open a second query
   * source; bind `searchValue` / `onSearch` to control the query.
   * @default false
   */
  searchable?: boolean
  /**
   * Custom filter function
   */
  filterFn?: TreeFilterFn
  /**
   * `subtree` keeps children of a matched node; `match-only` keeps only
   * matches and their ancestors.
   * @default 'subtree'
   */
  filterMode?: TreeFilterMode
  /**
   * Whether to auto expand parent nodes when filtering. Controlled trees emit
   * the extra keys; the parent must write them back.
   * @default true
   */
  autoExpandParent?: boolean
  /**
   * Enable virtualized rendering through `VirtualList`.
   * @default false
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
   */
  itemHeight?: number
  /**
   * Whether nodes are draggable. Uncontrolled trees reorder internally;
   * controlled trees emit `onDrop` / `onTreeDataChange` with the next tree.
   * @default false
   */
  draggable?: boolean
  /**
   * Block node style (full width selected background)
   * @default false
   */
  blockNode?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Accessible name. Falls back to `locale.tree.ariaLabel`. Omit when using
   * `aria-labelledby`.
   */
  ariaLabel?: string
  /**
   * Expand / collapse
   */
  onExpand?: (expandedKeys: TreeNodeKey[], info: TreeExpandInfo) => void
  onExpandedKeysChange?: (expandedKeys: TreeNodeKey[]) => void
  /**
   * Selection
   */
  onSelect?: (selectedKeys: TreeNodeKey[], info: TreeSelectInfo) => void
  onSelectedKeysChange?: (selectedKeys: TreeNodeKey[]) => void
  /**
   * Check. First argument is strategy-filtered keys, matching `checkedNodes`.
   */
  onCheck?: (checkedKeys: TreeNodeKey[], info: TreeCheckInfo) => void
  onCheckedKeysChange?: (checkedKeys: TreeNodeKey[]) => void
  /**
   * Search / filter query
   */
  onSearch?: (value: string) => void
  /**
   * Lazy load commit. `children` are already merged immutably; do not mutate `node`.
   */
  onLoad?: (node: TreeNode, children: TreeNode[]) => void
  onLoadedKeysChange?: (loadedKeys: TreeNodeKey[]) => void
  /**
   * Drop. `treeData` is the next immutable tree (untouched node identity kept).
   */
  onDrop?: (info: TreeDropInfo) => void
  onTreeDataChange?: (treeData: TreeNode[]) => void
  onNodeClick?: (node: TreeNode) => void
  onNodeExpand?: (node: TreeNode, key: TreeNodeKey) => void
  onNodeCollapse?: (node: TreeNode, key: TreeNodeKey) => void
}
