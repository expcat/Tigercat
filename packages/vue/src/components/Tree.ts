import {
  defineComponent,
  computed,
  ref,
  h,
  PropType,
  watch,
  type VNodeChild,
} from 'vue';
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

export interface VueTreeProps {
  treeData?: TreeNode[];
  selectionMode?: TreeSelectionMode;
  checkable?: boolean;
  showIcon?: boolean;
  showLine?: boolean;
  defaultExpandedKeys?: (string | number)[];
  defaultSelectedKeys?: (string | number)[];
  defaultCheckedKeys?: (string | number)[];
  expandedKeys?: (string | number)[];
  selectedKeys?: (string | number)[];
  checkedKeys?: (string | number)[] | TreeCheckedState;
  defaultExpandAll?: boolean;
  checkStrictly?: boolean;
  checkStrategy?: TreeCheckStrategy;
  selectable?: boolean;
  multiple?: boolean;
  loadData?: TreeLoadDataFn;
  filterValue?: string;
  filterFn?: TreeFilterFn;
  autoExpandParent?: boolean;
  blockNode?: boolean;
  emptyText?: string;
}

// Expand icon component
const ExpandIcon = (expanded: boolean, hasChildren: boolean) => {
  if (!hasChildren) {
    return h('span', { class: treeNodeIndentClasses });
  }

  return h(
    'svg',
    {
      class: getTreeNodeExpandIconClasses(expanded),
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'currentColor',
    },
    [h('path', { d: 'M6 4l4 4-4 4V4z' })]
  );
};

// Loading spinner
const LoadingSpinner = () => {
  return h(
    'svg',
    {
      class: treeLoadingClasses,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
    },
    [
      h('circle', {
        class: 'opacity-25',
        cx: '12',
        cy: '12',
        r: '10',
        stroke: 'currentColor',
        'stroke-width': '4',
      }),
      h('path', {
        class: 'opacity-75',
        fill: 'currentColor',
        d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
      }),
    ]
  );
};

export const Tree = defineComponent({
  name: 'TigerTree',
  props: {
    /**
     * Tree data source
     */
    treeData: {
      type: Array as PropType<TreeNode[]>,
      default: () => [],
    },
    /**
     * Selection mode
     */
    selectionMode: {
      type: String as PropType<TreeSelectionMode>,
      default: 'none' as TreeSelectionMode,
    },
    /**
     * Whether to show checkboxes
     */
    checkable: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show expand/collapse icon
     */
    showIcon: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether to show connecting lines
     */
    showLine: {
      type: Boolean,
      default: false,
    },
    /**
     * Default expanded node keys
     */
    defaultExpandedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
    /**
     * Default selected node keys
     */
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
    /**
     * Default checked node keys
     */
    defaultCheckedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
    /**
     * Expanded node keys (controlled)
     */
    expandedKeys: {
      type: Array as PropType<(string | number)[]>,
    },
    /**
     * Selected node keys (controlled)
     */
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
    },
    /**
     * Checked node keys (controlled)
     */
    checkedKeys: {
      type: [Array, Object] as PropType<(string | number)[] | TreeCheckedState>,
    },
    /**
     * Whether to expand all nodes by default
     */
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether parent and children are associated when checked
     */
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    /**
     * Check strategy for return values
     */
    checkStrategy: {
      type: String as PropType<TreeCheckStrategy>,
      default: 'all' as TreeCheckStrategy,
    },
    /**
     * Whether to allow node selection
     */
    selectable: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether multiple nodes can be selected
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to load data asynchronously
     */
    loadData: {
      type: Function as PropType<TreeLoadDataFn>,
    },
    /**
     * Filter value for highlighting matched nodes
     */
    filterValue: {
      type: String,
      default: '',
    },
    /**
     * Custom filter function
     */
    filterFn: {
      type: Function as PropType<TreeFilterFn>,
    },
    /**
     * Whether to auto expand parent nodes when filtering
     */
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    /**
     * Block node style (full width)
     */
    blockNode: {
      type: Boolean,
      default: false,
    },
    /**
     * Empty state text
     */
    emptyText: {
      type: String,
      default: 'No data',
    },
  },
  emits: [
    'expand',
    'select',
    'check',
    'node-click',
    'node-expand',
    'node-collapse',
    'update:expandedKeys',
    'update:selectedKeys',
    'update:checkedKeys',
  ],
  setup(props, { emit }) {
    // Internal state for expanded keys
    const internalExpandedKeys = ref<Set<string | number>>(new Set());

    // Internal state for selected keys
    const internalSelectedKeys = ref<Set<string | number>>(
      new Set(props.selectedKeys || props.defaultSelectedKeys)
    );

    // Internal state for checked keys
    const internalCheckedState = ref<TreeCheckedState>(
      (() => {
        if (props.checkedKeys) {
          if (Array.isArray(props.checkedKeys)) {
            return calculateCheckedState(
              props.treeData,
              props.checkedKeys,
              props.checkStrictly
            );
          }
          return props.checkedKeys;
        }
        return calculateCheckedState(
          props.treeData,
          props.defaultCheckedKeys,
          props.checkStrictly
        );
      })()
    );

    // Initialize expanded keys based on props
    watch(
      () => [props.treeData, props.defaultExpandAll] as const,
      () => {
        if (props.expandedKeys === undefined) {
          const keys =
            props.defaultExpandedKeys.length > 0
              ? props.defaultExpandedKeys
              : props.defaultExpandAll
              ? getAllKeys(props.treeData)
              : [];
          internalExpandedKeys.value = new Set(keys);
        }
      },
      { immediate: true }
    );

    // Loading state for lazy loading nodes
    const loadingNodes = ref<Set<string | number>>(new Set());

    // Filtered node keys
    const filteredNodeKeys = ref<Set<string | number>>(new Set());

    // Computed expanded keys
    const computedExpandedKeys = computed(() => {
      if (props.expandedKeys !== undefined) {
        return new Set(props.expandedKeys);
      }
      return internalExpandedKeys.value;
    });

    // Computed selected keys
    const computedSelectedKeys = computed(() => {
      if (props.selectedKeys !== undefined) {
        return new Set(props.selectedKeys);
      }
      return internalSelectedKeys.value;
    });

    // Computed checked state
    const computedCheckedState = computed(() => {
      if (props.checkedKeys !== undefined) {
        if (Array.isArray(props.checkedKeys)) {
          return calculateCheckedState(
            props.treeData,
            props.checkedKeys,
            props.checkStrictly
          );
        }
        return props.checkedKeys;
      }
      return internalCheckedState.value;
    });

    // Watch filter value changes
    watch(
      () => props.filterValue,
      (newValue) => {
        if (newValue) {
          const matched = filterTreeNodes(
            props.treeData,
            newValue,
            props.filterFn
          );
          filteredNodeKeys.value = matched;

          if (props.autoExpandParent) {
            const autoExpand = getAutoExpandKeys(props.treeData, matched);
            if (props.expandedKeys === undefined) {
              internalExpandedKeys.value = new Set([
                ...internalExpandedKeys.value,
                ...autoExpand,
              ]);
            }
          }
        } else {
          filteredNodeKeys.value = new Set();
        }
      },
      { immediate: true }
    );

    function handleExpand(nodeKey: string | number) {
      const node = findNode(props.treeData, nodeKey);
      if (!node) return;

      const newExpandedKeys = new Set(computedExpandedKeys.value);
      const isExpanded = newExpandedKeys.has(nodeKey);

      if (isExpanded) {
        newExpandedKeys.delete(nodeKey);
        emit('node-collapse', node, nodeKey);
      } else {
        newExpandedKeys.add(nodeKey);
        emit('node-expand', node, nodeKey);

        // Lazy loading
        if (
          props.loadData &&
          !node.children &&
          !node.isLeaf &&
          !loadingNodes.value.has(nodeKey)
        ) {
          loadingNodes.value.add(nodeKey);
          props
            .loadData(node)
            .then((children) => {
              // Update node children
              node.children = children;
              loadingNodes.value.delete(nodeKey);
            })
            .catch(() => {
              loadingNodes.value.delete(nodeKey);
              newExpandedKeys.delete(nodeKey);
            });
        }
      }

      if (props.expandedKeys === undefined) {
        internalExpandedKeys.value = newExpandedKeys;
      }

      emit('update:expandedKeys', Array.from(newExpandedKeys));
      emit('expand', Array.from(newExpandedKeys), {
        expanded: !isExpanded,
        node,
      });
    }

    function handleSelect(nodeKey: string | number, event: MouseEvent) {
      const node = findNode(props.treeData, nodeKey);
      if (!node || node.disabled || !props.selectable) return;

      const newSelectedKeys = new Set(computedSelectedKeys.value);

      if (props.multiple) {
        if (newSelectedKeys.has(nodeKey)) {
          newSelectedKeys.delete(nodeKey);
        } else {
          newSelectedKeys.add(nodeKey);
        }
      } else {
        newSelectedKeys.clear();
        newSelectedKeys.add(nodeKey);
      }

      if (props.selectedKeys === undefined) {
        internalSelectedKeys.value = newSelectedKeys;
      }

      const selectedKeysArray = Array.from(newSelectedKeys);
      emit('update:selectedKeys', selectedKeysArray);
      emit('select', selectedKeysArray, {
        selected: newSelectedKeys.has(nodeKey),
        selectedNodes: selectedKeysArray
          .map((k) => findNode(props.treeData, k))
          .filter(Boolean) as TreeNode[],
        node,
        event,
      });
    }

    function handleCheck(nodeKey: string | number, checked: boolean) {
      const node = findNode(props.treeData, nodeKey);
      if (!node || node.disabled) return;

      const currentCheckedKeys = computedCheckedState.value.checked;
      const newCheckedState = handleNodeCheck(
        props.treeData,
        nodeKey,
        checked,
        currentCheckedKeys,
        props.checkStrictly
      );

      if (props.checkedKeys === undefined) {
        internalCheckedState.value = newCheckedState;
      }

      const returnKeys = getCheckedKeysByStrategy(
        newCheckedState,
        props.treeData,
        props.checkStrategy
      );

      emit('update:checkedKeys', returnKeys);
      emit('check', returnKeys, {
        checked,
        checkedNodes: newCheckedState.checked
          .map((k) => findNode(props.treeData, k))
          .filter(Boolean) as TreeNode[],
        node,
        checkedNodesPositions: newCheckedState,
      });
    }

    function handleNodeClick(node: TreeNode, event: MouseEvent) {
      if (node.disabled) return;
      emit('node-click', node, event);
    }

    function renderTreeNode(
      node: TreeNode,
      level: number,
      _parentKey?: string | number
    ): VNodeChild {
      const hasChildren = !!(node.children && node.children.length > 0);
      const isExpanded = computedExpandedKeys.value.has(node.key);
      const isSelected = computedSelectedKeys.value.has(node.key);
      const isChecked = computedCheckedState.value.checked.includes(node.key);
      const isHalfChecked = computedCheckedState.value.halfChecked.includes(
        node.key
      );
      const isLoading = loadingNodes.value.has(node.key);
      const isFiltered = filteredNodeKeys.value.size > 0;
      const isMatched = filteredNodeKeys.value.has(node.key);
      const isVisible = !isFiltered || isMatched;

      if (!isVisible) {
        return null;
      }

      const indent = [];
      for (let i = 0; i < level; i++) {
        indent.push(h('span', { key: i, class: treeNodeIndentClasses }));
      }

      // Node content
      const nodeContent: VNodeChild[] = [
        // Indentation
        ...indent,

        // Expand icon
        h(
          'span',
          {
            class:
              hasChildren || (props.loadData && !node.isLeaf)
                ? 'cursor-pointer'
                : '',
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              if (hasChildren || (props.loadData && !node.isLeaf)) {
                handleExpand(node.key);
              }
            },
          },
          [
            ExpandIcon(
              isExpanded,
              hasChildren || !!(props.loadData && !node.isLeaf)
            ),
          ]
        ),

        // Checkbox
        props.checkable
          ? h('input', {
              type: 'checkbox',
              class: treeNodeCheckboxClasses,
              checked: isChecked,
              indeterminate: isHalfChecked,
              disabled: node.disabled,
              'aria-label': `Select ${node.label}`,
              onClick: (e: MouseEvent) => e.stopPropagation(),
              onChange: (e: Event) => {
                const target = e.target as HTMLInputElement;
                handleCheck(node.key, target.checked);
              },
            })
          : null,

        // Icon (if provided)
        node.icon
          ? h('span', { class: treeNodeIconClasses }, node.icon as never)
          : null,

        // Label
        h(
          'span',
          {
            class: classNames(
              treeNodeLabelClasses,
              isFiltered && isMatched
                ? 'font-semibold text-[var(--tiger-primary,#2563eb)]'
                : ''
            ),
          },
          node.label
        ),

        // Loading indicator
        isLoading ? LoadingSpinner() : null,
      ].filter(Boolean);

      // Tree node wrapper
      const treeNode = h(
        'div',
        {
          key: node.key,
          class: treeNodeWrapperClasses,
        },
        [
          // Node content
          h(
            'div',
            {
              class: getTreeNodeClasses(
                isSelected,
                !!node.disabled,
                props.blockNode
              ),
              onClick: (e: MouseEvent) => {
                handleNodeClick(node, e);
                if (props.selectable && !node.disabled) {
                  handleSelect(node.key, e);
                }
              },
            },
            nodeContent
          ),

          // Children
          hasChildren &&
            isExpanded &&
            h(
              'div',
              {
                class: treeNodeChildrenClasses,
              },
              node.children!.map((child) =>
                renderTreeNode(child, level + 1, node.key)
              )
            ),
        ]
      );

      return treeNode;
    }

    return () => {
      if (!props.treeData || props.treeData.length === 0) {
        return h('div', { class: classNames(treeBaseClasses, 'p-4') }, [
          h('div', { class: treeEmptyStateClasses }, props.emptyText),
        ]);
      }

      return h('div', { class: treeBaseClasses }, [
        props.treeData.map((node) => renderTreeNode(node, 0)),
      ]);
    };
  },
});

export default Tree;
