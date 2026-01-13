import {
  defineComponent,
  computed,
  ref,
  h,
  PropType,
  watch,
  nextTick,
  type VNodeChild,
} from 'vue';
import {
  classNames,
  coerceClassValue,
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
  normalizeSvgAttrs,
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
  ariaLabel?: string;
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
      viewBox: spinnerSvg.viewBox,
    },
    spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  );
};

export const Tree = defineComponent({
  name: 'TigerTree',
  inheritAttrs: false,
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

    /**
     * Accessible label for the tree container
     */
    ariaLabel: {
      type: String,
      default: 'Tree',
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
  setup(props, { emit, attrs }) {
    const rootEl = ref<HTMLElement | null>(null);

    const effectiveSelectable = computed(() => {
      if (props.selectionMode !== undefined) {
        return props.selectionMode !== 'none';
      }
      return props.selectable;
    });

    const effectiveMultiple = computed(() => {
      if (props.selectionMode !== undefined) {
        return props.selectionMode === 'multiple';
      }
      return props.multiple;
    });

    // Internal state for expanded keys
    const internalExpandedKeys = ref<Set<string | number>>(new Set());

    // Internal state for selected keys
    const internalSelectedKeys = ref<Set<string | number>>(
      new Set(props.selectedKeys ?? props.defaultSelectedKeys)
    );

    // Internal state for checked keys
    const internalCheckedState = ref<TreeCheckedState>(
      (() => {
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

    // Active (focus) key
    const activeKey = ref<string | number>();

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

    const visibleItems = computed(() =>
      getVisibleTreeItems(
        props.treeData,
        computedExpandedKeys.value,
        filteredNodeKeys.value
      )
    );

    const focusableKeys = computed(() =>
      visibleItems.value.filter((i) => !i.node.disabled).map((i) => i.key)
    );

    const defaultActiveKey = computed(() => focusableKeys.value[0]);

    watch(
      () => activeKey.value,
      async (key) => {
        if (key === undefined) return;
        await nextTick();

        const target = rootEl.value?.querySelector(
          `[data-tiger-treeitem-key="${String(key)}"]`
        ) as HTMLElement | null;

        target?.focus();
      }
    );

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

    function handleSelect(
      nodeKey: string | number,
      event: MouseEvent | KeyboardEvent
    ) {
      const node = findNode(props.treeData, nodeKey);
      if (!node || node.disabled || !effectiveSelectable.value) return;

      const newSelectedKeys = new Set(computedSelectedKeys.value);

      if (effectiveMultiple.value) {
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

    function focusKey(key: string | number | undefined) {
      if (key === undefined) return;
      activeKey.value = key;
    }

    function getCurrentKey(fallbackKey: string | number) {
      return activeKey.value ?? defaultActiveKey.value ?? fallbackKey;
    }

    function getNavigationIndex(key: string | number) {
      return focusableKeys.value.findIndex((k) => k === key);
    }

    function getFirstChildKey(key: string | number) {
      const list = visibleItems.value;
      const index = list.findIndex((i) => i.key === key);
      if (index < 0) return undefined;

      const base = list[index];
      for (let i = index + 1; i < list.length; i++) {
        const item = list[i];
        if (item.level <= base.level) break;
        if (item.parentKey === key && !item.node.disabled) return item.key;
      }

      return undefined;
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

      const isExpandable = hasChildren || !!(props.loadData && !node.isLeaf);
      const isFocusable =
        !node.disabled &&
        node.key === (activeKey.value ?? defaultActiveKey.value);

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
            class: isExpandable ? 'cursor-pointer' : '',
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              if (isExpandable) {
                activeKey.value = node.key;
                handleExpand(node.key);
              }
            },
          },
          [ExpandIcon(isExpanded, isExpandable)]
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
        props.showIcon && node.icon
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
              'data-tiger-treeitem-key': String(node.key),
              role: 'treeitem',
              'aria-level': level + 1,
              'aria-disabled': node.disabled ? true : undefined,
              'aria-selected': effectiveSelectable.value
                ? isSelected
                  ? true
                  : false
                : undefined,
              'aria-expanded': isExpandable
                ? isExpanded
                  ? true
                  : false
                : undefined,
              'aria-checked': props.checkable
                ? isHalfChecked
                  ? 'mixed'
                  : isChecked
                : undefined,
              tabIndex: isFocusable ? 0 : -1,
              onFocus: () => {
                if (!node.disabled) activeKey.value = node.key;
              },
              onKeydown: (e: KeyboardEvent) => {
                if (node.disabled) return;

                const currentKey = getCurrentKey(node.key);
                const currentIndex = getNavigationIndex(currentKey);
                const parents = getParentKeys(props.treeData, node.key);
                const parentKey = parents[parents.length - 1];

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  focusKey(focusableKeys.value[currentIndex + 1] ?? currentKey);
                  return;
                }

                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  focusKey(focusableKeys.value[currentIndex - 1] ?? currentKey);
                  return;
                }

                if (e.key === 'Home') {
                  e.preventDefault();
                  focusKey(focusableKeys.value[0] ?? currentKey);
                  return;
                }

                if (e.key === 'End') {
                  e.preventDefault();
                  focusKey(
                    focusableKeys.value[focusableKeys.value.length - 1] ??
                      currentKey
                  );
                  return;
                }

                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  if (isExpandable && !isExpanded) {
                    handleExpand(node.key);
                    return;
                  }
                  if (isExpandable && isExpanded) {
                    focusKey(getFirstChildKey(node.key) ?? currentKey);
                  }
                  return;
                }

                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  if (isExpandable && isExpanded) {
                    handleExpand(node.key);
                    return;
                  }
                  focusKey(parentKey ?? currentKey);
                  return;
                }

                if (e.key === 'Escape') {
                  e.preventDefault();
                  if (isExpandable && isExpanded) {
                    handleExpand(node.key);
                    return;
                  }
                  if (parentKey !== undefined) {
                    if (computedExpandedKeys.value.has(parentKey)) {
                      handleExpand(parentKey);
                    }
                    focusKey(parentKey);
                  }
                  return;
                }

                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (effectiveSelectable.value) {
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
                  if (props.checkable) {
                    handleCheck(node.key, !isChecked);
                    return;
                  }
                  if (isExpandable) {
                    handleExpand(node.key);
                  }
                }
              },
              onClick: (e: MouseEvent) => {
                activeKey.value = node.key;
                handleNodeClick(node, e);
                if (effectiveSelectable.value && !node.disabled) {
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
                class: classNames(
                  treeNodeChildrenClasses,
                  props.showLine && treeLineClasses
                ),
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
      const rootClass = classNames(
        treeBaseClasses,
        coerceClassValue(attrs.class)
      );

      if (!props.treeData || props.treeData.length === 0) {
        return h(
          'div',
          {
            ...attrs,
            class: classNames(rootClass, 'p-4'),
            role: 'tree',
            'aria-label': props.ariaLabel,
          },
          [h('div', { class: treeEmptyStateClasses }, props.emptyText)]
        );
      }

      return h(
        'div',
        {
          ...attrs,
          class: rootClass,
          role: 'tree',
          'aria-label': props.ariaLabel,
          'aria-multiselectable': effectiveMultiple.value ? true : undefined,
          ref: rootEl,
        },
        [props.treeData.map((node) => renderTreeNode(node, 0))]
      );
    };
  },
});

export default Tree;
