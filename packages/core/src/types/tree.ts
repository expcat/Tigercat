/**
 * Tree component types and interfaces
 */

/**
 * Tree node data structure
 */
export interface TreeNode {
  /**
   * Unique key for the tree node
   */
  key: string | number;
  /**
   * Node label/title
   */
  label: string;
  /**
   * Child nodes
   */
  children?: TreeNode[];
  /**
   * Whether the node is disabled
   */
  disabled?: boolean;
  /**
   * Whether the node is a leaf node (no children)
   */
  isLeaf?: boolean;
  /**
   * Custom icon for the node
   */
  icon?: unknown;
  /**
   * Custom data
   */
  [key: string]: unknown;
}

/**
 * Tree selection mode
 */
export type TreeSelectionMode = "none" | "single" | "multiple";

/**
 * Tree check strategy - determines which nodes to return when checked
 */
export type TreeCheckStrategy = "all" | "parent" | "child";

/**
 * Tree node expanded state
 */
export interface TreeExpandedState {
  [key: string | number]: boolean;
}

/**
 * Tree node selected/checked state
 */
export interface TreeCheckedState {
  checked: (string | number)[];
  halfChecked: (string | number)[];
}

/**
 * Lazy load function type
 */
export type TreeLoadDataFn = (node: TreeNode) => Promise<TreeNode[]>;

/**
 * Tree filter function type
 */
export type TreeFilterFn = (value: string, node: TreeNode) => boolean;

/**
 * Base tree props interface
 */
export interface TreeProps {
  /**
   * Tree data source
   */
  treeData?: TreeNode[];
  /**
   * Selection mode
   * @default 'none'
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
   * Virtual scroll configuration
   */
  virtual?: boolean;
  /**
   * Height for virtual scroll
   */
  height?: number | string;
  /**
   * Whether nodes are draggable
   * @default false
   */
  draggable?: boolean;
  /**
   * Block node style (full width)
   * @default false
   */
  blockNode?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label for the tree container
   * @default 'Tree'
   */
  ariaLabel?: string;
}
