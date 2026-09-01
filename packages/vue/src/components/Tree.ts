import {
  defineComponent,
  computed,
  ref,
  h,
  watch,
  nextTick,
  type PropType,
  type VNode,
  type VNodeChild
} from 'vue'
import {
  EMPTY_TREE_DATA,
  applyLoadedChildren,
  applyTreeDrop,
  applyTreeFilter,
  filterTreeNodes,
  applyTreeKeyboard,
  classNames,
  coerceClassValue,
  createTreeKeyIdSet,
  formatTreeSelectNodeLabel,
  getCheckedKeysByStrategy,
  getHighlightSegments,
  getSpinnerSVG,
  getTreeIndentSlotClasses,
  getTreeIndentSlots,
  getTreeLabels,
  getTreeNodeClasses,
  getTreeNodeExpandIconClasses,
  highlightMarkClasses,
  lookupTreeNode,
  mergeLoadedChildren,
  mergeTigerLocale,
  nextTreeCheckedState,
  nextTreeExpandedKeys,
  nextTreeSelectedKeys,
  normalizeSvgAttrs,
  reconcileUncontrolledExpandedKeys,
  resolveCheckedInput,
  resolveInitialExpandedKeys,
  resolveLocaleText,
  resolveTreeDropPosition,
  resolveTreeKeyboardAction,
  resolveTreeSelection,
  resolveTreeView,
  sameTreeKey,
  shouldLoadTreeNode,
  treeBaseClasses,
  treeDropAfterClasses,
  treeDropBeforeClasses,
  treeDropInsideClasses,
  treeEmptyStateClasses,
  treeItemKeyAttr,
  treeKeyId,
  treeLoadingClasses,
  treeNodeIconClasses,
  treeNodeIndentClasses,
  treeNodeLabelClasses,
  treeNodeLabelMatchedClasses,
  treeSearchInputClasses,
  uniqueTreeKeys,
  warnControlledExpandedFilter,
  devWarn,
  type TigerLocale,
  type TreeCheckStrategy,
  type TreeCheckedState,
  type TreeDropPosition,
  type TreeFilterFn,
  type TreeFilterMode,
  type TreeLoadDataFn,
  type TreeNode,
  type TreeNodeKey,
  type TreeSelectionMode,
  type TreeView,
  type VirtualListHandle
} from '@expcat/tigercat-core'
import { useDrag } from '../composables/useDrag'
import { VirtualList } from './VirtualList'
import { Checkbox } from './Checkbox'
import { useTigerConfig } from './ConfigProvider'

const spinnerSvg = getSpinnerSVG('spinner')

export interface VueTreeProps {
  treeData?: TreeNode[]
  selectionMode?: TreeSelectionMode
  checkable?: boolean
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
  locale?: Partial<TigerLocale>
  className?: string
  draggable?: boolean
  virtual?: boolean
  height?: number
  itemHeight?: number
}

export type TreeProps = VueTreeProps

function sameKeyList(a: readonly TreeNodeKey[], b: readonly TreeNodeKey[]): boolean {
  if (a.length !== b.length) return false
  const ids = createTreeKeyIdSet(a)
  return b.every((key) => ids.has(treeKeyId(key)))
}

function renderNodeIcon(icon: unknown): VNodeChild {
  if (icon == null || typeof icon === 'boolean') return undefined
  if (typeof icon === 'string' || typeof icon === 'number') return icon
  return icon as VNodeChild
}

export const Tree = defineComponent({
  name: 'TigerTree',
  inheritAttrs: false,
  props: {
    treeData: { type: Array as PropType<TreeNode[]>, default: undefined },
    selectionMode: { type: String as PropType<TreeSelectionMode> },
    checkable: { type: Boolean, default: false },
    showIcon: { type: Boolean, default: true },
    showLine: { type: Boolean, default: false },
    defaultExpandedKeys: { type: Array as PropType<TreeNodeKey[]> },
    defaultSelectedKeys: { type: Array as PropType<TreeNodeKey[]> },
    defaultCheckedKeys: { type: Array as PropType<TreeNodeKey[]> },
    expandedKeys: { type: Array as PropType<TreeNodeKey[]> },
    selectedKeys: { type: Array as PropType<TreeNodeKey[]> },
    checkedKeys: { type: [Array, Object] as PropType<TreeNodeKey[] | TreeCheckedState> },
    defaultExpandAll: { type: Boolean, default: false },
    checkStrictly: { type: Boolean, default: false },
    checkStrategy: { type: String as PropType<TreeCheckStrategy>, default: 'all' },
    selectable: { type: Boolean, default: undefined },
    multiple: { type: Boolean, default: false },
    allowDeselect: { type: Boolean, default: false },
    loadData: { type: Function as PropType<TreeLoadDataFn> },
    loadedKeys: { type: Array as PropType<TreeNodeKey[]> },
    filterValue: { type: String, default: undefined },
    searchValue: { type: String, default: undefined },
    defaultSearchValue: { type: String, default: undefined },
    searchable: { type: Boolean, default: false },
    filterFn: { type: Function as PropType<TreeFilterFn> },
    filterMode: { type: String as PropType<TreeFilterMode> },
    autoExpandParent: { type: Boolean, default: true },
    blockNode: { type: Boolean, default: false },
    emptyText: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>> },
    className: { type: String, default: undefined },
    draggable: { type: Boolean, default: false },
    virtual: { type: Boolean, default: false },
    height: { type: Number, default: 400 },
    itemHeight: { type: Number, default: 32 }
  },
  emits: [
    'expand',
    'select',
    'check',
    'search',
    'load',
    'drop',
    'node-click',
    'node-expand',
    'node-collapse',
    'update:expandedKeys',
    'update:selectedKeys',
    'update:checkedKeys',
    'update:searchValue',
    'update:treeData',
    'update:loadedKeys'
  ],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getTreeLabels(mergedLocale.value))
    const dir = computed(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const selection = computed(() =>
      resolveTreeSelection({
        selectionMode: props.selectionMode,
        selectable: props.selectable,
        multiple: props.multiple
      })
    )
    const hasLoadData = computed(() => typeof props.loadData === 'function')
    const treeDataProp = computed(() => props.treeData ?? EMPTY_TREE_DATA)

    const loadedMap = ref(new Map<string, TreeNode[]>())
    const dropTree = ref<TreeNode[] | undefined>(undefined)
    const dropTreeFrom = ref<TreeNode[] | undefined>(undefined)
    const userHasToggled = ref(false)
    const internalExpanded = ref<TreeNodeKey[]>(
      resolveInitialExpandedKeys({
        treeData: treeDataProp.value,
        expandedKeys: props.expandedKeys,
        defaultExpandedKeys: props.defaultExpandedKeys,
        defaultExpandAll: props.defaultExpandAll
      }).keys
    )
    const internalSelected = ref<TreeNodeKey[]>(
      props.selectedKeys ?? props.defaultSelectedKeys ?? []
    )
    const internalChecked = ref(
      resolveCheckedInput(
        treeDataProp.value,
        props.checkedKeys,
        props.defaultCheckedKeys,
        props.checkStrictly
      )
    )
    const loadingIds = ref(new Set<string>())
    const activeKey = ref<TreeNodeKey | undefined>(undefined)
    const internalSearch = ref(props.defaultSearchValue ?? '')
    const autoExpandKeys = ref<TreeNodeKey[]>([])
    const dropIndicator = ref<{ key: TreeNodeKey; position: TreeDropPosition } | null>(null)
    const dropPos = ref<TreeDropPosition>('inside')
    const itemRefs = new Map<string, HTMLElement>()
    const virtualRef = ref<VirtualListHandle | null>(null)

    watch(
      () => props.treeData,
      (next) => {
        if (dropTreeFrom.value !== undefined && dropTreeFrom.value !== next) {
          dropTree.value = undefined
          dropTreeFrom.value = undefined
        }
      }
    )

    const derivedTree = computed(() =>
      mergeLoadedChildren(dropTree.value ?? treeDataProp.value, loadedMap.value)
    )

    watch(derivedTree, (tree) => {
      if (props.expandedKeys !== undefined) return
      const next = reconcileUncontrolledExpandedKeys({
        current: internalExpanded.value,
        treeData: tree,
        defaultExpandAll: props.defaultExpandAll,
        userHasToggled: userHasToggled.value
      })
      if (!sameKeyList(internalExpanded.value, next)) internalExpanded.value = next
    })

    const computedExpanded = computed(() => props.expandedKeys ?? internalExpanded.value)
    const computedSelected = computed(() => props.selectedKeys ?? internalSelected.value)
    const computedChecked = computed(() =>
      props.checkedKeys !== undefined
        ? resolveCheckedInput(derivedTree.value, props.checkedKeys, undefined, props.checkStrictly)
        : internalChecked.value
    )
    const searchQuery = computed(() =>
      props.searchValue !== undefined
        ? props.searchValue
        : props.filterValue !== undefined
          ? props.filterValue
          : internalSearch.value
    )

    const matchedKeys = computed(() =>
      searchQuery.value
        ? filterTreeNodes(derivedTree.value, searchQuery.value, props.filterFn, props.filterMode)
        : new Set<TreeNodeKey>()
    )

    watch(
      [searchQuery, derivedTree, () => props.filterFn, () => props.filterMode],
      () => {
        const result = applyTreeFilter({
          treeData: derivedTree.value,
          query: searchQuery.value,
          filterFn: props.filterFn,
          filterMode: props.filterMode,
          autoExpandParent: props.autoExpandParent,
          currentExpanded: computedExpanded.value,
          previousAutoExpand: autoExpandKeys.value
        })
        autoExpandKeys.value = result.autoExpandKeys
        if (!props.autoExpandParent) return
        if (sameKeyList(computedExpanded.value, result.nextExpandedKeys)) return
        if (props.expandedKeys === undefined) internalExpanded.value = result.nextExpandedKeys
        emit('update:expandedKeys', result.nextExpandedKeys)
        if (props.expandedKeys !== undefined) warnControlledExpandedFilter(true)
      },
      { immediate: true }
    )

    const view = computed<TreeView>(() =>
      resolveTreeView({
        treeData: derivedTree.value,
        expandedKeys: computedExpanded.value,
        selectedKeys: computedSelected.value,
        checkedState: computedChecked.value,
        matchedKeys: searchQuery.value ? matchedKeys.value : undefined,
        loadingKeys: [...loadingIds.value],
        activeKey: activeKey.value,
        checkable: props.checkable,
        selectable: selection.value.selectable,
        hasLoadData: hasLoadData.value
      })
    )

    const loadedIds = computed(() => {
      const ids = new Set(loadedMap.value.keys())
      for (const key of props.loadedKeys ?? []) ids.add(treeKeyId(key))
      return ids
    })

    function commitExpanded(next: TreeNodeKey[], node: TreeNode, expanded: boolean): void {
      userHasToggled.value = true
      if (props.expandedKeys === undefined) internalExpanded.value = next
      emit('update:expandedKeys', next)
      emit('expand', next, { expanded, node })
      if (expanded) emit('node-expand', node, node.key)
      else emit('node-collapse', node, node.key)
    }

    function handleExpand(nodeKey: TreeNodeKey): void {
      const node = lookupTreeNode(view.value.index, nodeKey)
      if (!node || node.disabled) return
      const expanded = computedExpanded.value.some((key) => sameTreeKey(key, nodeKey))
      const next = nextTreeExpandedKeys(computedExpanded.value, node.key, !expanded)
      commitExpanded(next, node, !expanded)
      if (
        !expanded &&
        shouldLoadTreeNode({
          node,
          hasLoadData: hasLoadData.value,
          loadedIds: loadedIds.value,
          loadingIds: loadingIds.value
        })
      ) {
        const id = treeKeyId(node.key)
        loadingIds.value = new Set(loadingIds.value).add(id)
        props
          .loadData?.(node)
          .then((children) => {
            const nextMap = new Map(loadedMap.value)
            nextMap.set(id, children)
            loadedMap.value = nextMap
            const nextSet = new Set(loadingIds.value)
            nextSet.delete(id)
            loadingIds.value = nextSet
            const nextTree = applyLoadedChildren(derivedTree.value, node.key, children)
            emit('load', node, children)
            emit('update:loadedKeys', uniqueTreeKeys([...(props.loadedKeys ?? []), node.key]))
            emit('update:treeData', nextTree)
          })
          .catch(() => {
            const nextSet = new Set(loadingIds.value)
            nextSet.delete(id)
            loadingIds.value = nextSet
            devWarn('Tree.loadData', 'Tree loadData rejected; the node is not mutated.')
          })
      }
    }

    function handleSelect(nodeKey: TreeNodeKey): void {
      const node = lookupTreeNode(view.value.index, nodeKey)
      if (!node || node.disabled || !selection.value.selectable) return
      const next = nextTreeSelectedKeys({
        current: computedSelected.value,
        key: node.key,
        multiple: selection.value.multiple,
        allowDeselect: props.allowDeselect
      })
      if (props.selectedKeys === undefined) internalSelected.value = next
      emit('update:selectedKeys', next)
      emit('select', next, {
        selected: next.some((key) => sameTreeKey(key, node.key)),
        selectedNodes: next
          .map((key) => lookupTreeNode(view.value.index, key))
          .filter((item): item is TreeNode => Boolean(item)),
        node
      })
    }

    function handleCheck(nodeKey: TreeNodeKey, checked: boolean): void {
      const node = lookupTreeNode(view.value.index, nodeKey)
      if (!node || node.disabled) return
      const nextState = nextTreeCheckedState(
        derivedTree.value,
        node.key,
        checked,
        computedChecked.value.checked,
        props.checkStrictly
      )
      if (props.checkedKeys === undefined) internalChecked.value = nextState
      const returnKeys = getCheckedKeysByStrategy(nextState, derivedTree.value, props.checkStrategy)
      emit('update:checkedKeys', returnKeys)
      emit('check', returnKeys, {
        checked,
        checkedNodes: returnKeys
          .map((key) => lookupTreeNode(view.value.index, key))
          .filter((item): item is TreeNode => Boolean(item)),
        node,
        halfChecked: nextState.halfChecked
      })
    }

    function handleKeyDown(event: KeyboardEvent, nodeKey: TreeNodeKey): void {
      const action = resolveTreeKeyboardAction({
        key: event.key,
        nodeKey,
        view: view.value,
        expandedKeys: computedExpanded.value,
        activeKey: activeKey.value,
        checkable: props.checkable,
        selectable: selection.value.selectable,
        hasLoadData: hasLoadData.value,
        dir: dir.value
      })
      const patch = applyTreeKeyboard(action)
      if (!patch.preventDefault) return
      event.preventDefault()
      event.stopPropagation()
      if (patch.activeKey !== undefined) {
        activeKey.value = patch.activeKey
        const index = view.value.visibleItems.findIndex((item) =>
          sameTreeKey(item.key, patch.activeKey)
        )
        if (props.virtual) virtualRef.value?.scrollToIndex(index)
        const id = treeKeyId(patch.activeKey)
        void nextTick(() => itemRefs.get(id)?.focus())
      }
      if (patch.expandKey !== undefined) handleExpand(patch.expandKey)
      if (patch.selectKey !== undefined) handleSelect(patch.selectKey)
      if (patch.checkKey !== undefined && patch.checkChecked !== undefined) {
        handleCheck(patch.checkKey, patch.checkChecked)
      }
    }

    const drag = useDrag({
      containerId: 'tree',
      onDrop: (event) => {
        const dropKey = event.overItem?.id
        if (dropKey == null || sameTreeKey(dropKey, event.item.id)) return
        const nextTree = applyTreeDrop({
          treeData: derivedTree.value,
          dragKey: event.item.id,
          dropKey,
          position: dropPos.value
        })
        if (!nextTree) return
        dropTree.value = nextTree
        dropTreeFrom.value = treeDataProp.value
        emit('update:treeData', nextTree)
        emit('drop', {
          dragKey: event.item.id,
          dropKey,
          dropPosition: dropPos.value,
          treeData: nextTree
        })
        dropIndicator.value = null
      }
    })

    watch(activeKey, async (key) => {
      if (key === undefined) return
      const index = view.value.visibleItems.findIndex((item) => sameTreeKey(item.key, key))
      if (index < 0) return
      if (props.virtual) virtualRef.value?.scrollToIndex(index)
      await nextTick()
      itemRefs.get(treeKeyId(key))?.focus()
    })

    function setSearchQuery(value: string): void {
      if (props.searchValue === undefined && props.filterValue === undefined) {
        internalSearch.value = value
      }
      emit('update:searchValue', value)
      emit('search', value)
    }

    function renderLabel(
      label: string,
      query: string,
      matched: boolean
    ): string | (string | VNode)[] {
      if (!query || !matched) return label
      const segments = getHighlightSegments(label, query, { global: true, caseSensitive: false })
      if (segments.length === 0) return label
      return segments.map((segment, index) =>
        segment.highlighted
          ? h('mark', { key: index, class: highlightMarkClasses }, segment.text)
          : segment.text
      )
    }

    function renderRow(rowIndex: number, fillHeight: boolean): VNodeChild {
      const row = view.value.rows[rowIndex]
      if (!row) return null
      const node = row.item.node
      const isFocusable =
        !row.disabled && sameTreeKey(node.key, activeKey.value ?? view.value.defaultActiveKey)
      const indent = getTreeIndentSlots(row.item, props.showLine)
      const dropping =
        props.draggable &&
        dropIndicator.value !== null &&
        sameTreeKey(dropIndicator.value.key, node.key)
      const dropPosition = dropIndicator.value?.position

      return h(
        'div',
        {
          class: classNames(
            getTreeNodeClasses(row.selected, row.disabled, props.blockNode || fillHeight, {
              active: isFocusable,
              interactive: selection.value.selectable || row.expandable || props.checkable
            }),
            fillHeight && 'h-full min-h-0 overflow-hidden',
            dropping && dropPosition === 'before' && treeDropBeforeClasses,
            dropping && dropPosition === 'after' && treeDropAfterClasses,
            dropping && dropPosition === 'inside' && treeDropInsideClasses
          ),
          ref: (el: unknown) => {
            const id = treeKeyId(node.key)
            const nodeEl = el as HTMLElement | null
            if (nodeEl) itemRefs.set(id, nodeEl)
            else itemRefs.delete(id)
          },
          role: 'treeitem',
          'data-tiger-treeitem-key': treeItemKeyAttr(node.key),
          'aria-level': row.item.level,
          'aria-setsize': row.setsize,
          'aria-posinset': row.posinset,
          'aria-disabled': row.disabled || undefined,
          'aria-selected': selection.value.selectable ? row.selected : undefined,
          'aria-expanded': row.expandable ? row.expanded : undefined,
          'aria-checked': props.checkable ? (row.halfChecked ? 'mixed' : row.checked) : undefined,
          tabindex: isFocusable ? 0 : -1,
          draggable: props.draggable && !row.disabled ? true : undefined,
          onDragstart:
            props.draggable && !row.disabled
              ? (event: DragEvent) => {
                  event.stopPropagation()
                  const target = event.target as Element | null
                  if (target?.closest('button, input, label')) {
                    event.preventDefault()
                    return
                  }
                  const index = view.value.visibleItems.findIndex((item) =>
                    sameTreeKey(item.key, node.key)
                  )
                  drag.startDrag(
                    { id: node.key, index: Math.max(0, index), containerId: 'tree' },
                    event
                  )
                }
              : undefined,
          onDragover: props.draggable
            ? (event: DragEvent) => {
                event.stopPropagation()
                event.preventDefault()
                const index = view.value.visibleItems.findIndex((item) =>
                  sameTreeKey(item.key, node.key)
                )
                drag.dragOver(
                  { id: node.key, index: Math.max(0, index), containerId: 'tree' },
                  event
                )
                const el = event.currentTarget as HTMLElement
                const rect = el.getBoundingClientRect()
                const position = resolveTreeDropPosition(
                  event.clientY,
                  rect.top,
                  rect.height,
                  node.isLeaf !== true
                )
                dropPos.value = position
                dropIndicator.value = { key: node.key, position }
                if (props.virtual) {
                  const scroller = virtualRef.value?.getScrollElement()
                  if (scroller) {
                    const box = scroller.getBoundingClientRect()
                    if (event.clientY < box.top + 24) scroller.scrollTop -= 16
                    else if (event.clientY > box.bottom - 24) scroller.scrollTop += 16
                  }
                }
              }
            : undefined,
          onDrop: props.draggable
            ? (event: DragEvent) => {
                event.stopPropagation()
                drag.drop(event)
                dropIndicator.value = null
              }
            : undefined,
          onDragend: props.draggable
            ? () => {
                drag.endDrag()
                dropIndicator.value = null
              }
            : undefined,
          onFocus: () => {
            if (!row.disabled) activeKey.value = node.key
          },
          onClick: (event: MouseEvent) => {
            if (row.disabled) return
            activeKey.value = node.key
            emit('node-click', node, event)
            if (selection.value.selectable) handleSelect(node.key)
          }
        },
        [
          indent.map((slot) =>
            h('span', { key: slot.key, class: getTreeIndentSlotClasses(slot), 'aria-hidden': true })
          ),
          row.expandable
            ? h(
                'button',
                {
                  type: 'button',
                  tabindex: -1,
                  'aria-hidden': 'true',
                  class: 'inline-flex items-center justify-center w-6 h-6 shrink-0',
                  onClick: (event: MouseEvent) => {
                    event.stopPropagation()
                    if (!row.disabled) {
                      activeKey.value = node.key
                      handleExpand(node.key)
                    }
                  }
                },
                [
                  h(
                    'svg',
                    {
                      class: getTreeNodeExpandIconClasses(row.expanded),
                      width: '16',
                      height: '16',
                      viewBox: '0 0 16 16',
                      fill: 'currentColor',
                      'aria-hidden': 'true',
                      focusable: 'false'
                    },
                    [h('path', { d: 'M6 4l4 4-4 4V4z' })]
                  )
                ]
              )
            : h('span', { class: treeNodeIndentClasses, 'aria-hidden': true }),
          props.checkable
            ? h(Checkbox, {
                size: 'sm',
                modelValue: row.checked,
                indeterminate: row.halfChecked,
                disabled: row.disabled,
                tabindex: -1,
                className: 'me-2 shrink-0',
                'aria-label': formatTreeSelectNodeLabel(labels.value.selectNode, node.label),
                onClick: (event: MouseEvent) => event.stopPropagation(),
                onChange: (checked: boolean) => handleCheck(node.key, checked)
              })
            : null,
          props.showIcon && node.icon != null
            ? h('span', { class: treeNodeIconClasses }, renderNodeIcon(node.icon) ?? undefined)
            : null,
          h(
            'span',
            {
              class: classNames(
                treeNodeLabelClasses,
                row.matched && searchQuery.value ? treeNodeLabelMatchedClasses : undefined
              )
            },
            renderLabel(node.label, searchQuery.value, row.matched)
          ),
          row.loading
            ? h(
                'svg',
                {
                  class: treeLoadingClasses,
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: spinnerSvg.viewBox,
                  'aria-hidden': 'true',
                  focusable: 'false'
                },
                spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
              )
            : null
        ]
      )
    }

    return () => {
      const labelledBy =
        typeof attrs['aria-labelledby'] === 'string' ? attrs['aria-labelledby'] : undefined
      const name = labelledBy
        ? undefined
        : resolveLocaleText(labels.value.ariaLabel, props.ariaLabel, labels.value.ariaLabel)
      const emptyText = resolveLocaleText(
        mergedLocale.value?.empty?.noData ?? mergedLocale.value?.common?.emptyText ?? 'No data',
        props.emptyText,
        mergedLocale.value?.empty?.noData,
        mergedLocale.value?.common?.emptyText
      )
      const empty = derivedTree.value.length === 0
      const search = props.searchable
        ? h('input', {
            type: 'search',
            class: treeSearchInputClasses,
            placeholder: resolveLocaleText('Search', mergedLocale.value?.common?.searchPlaceholder),
            value: searchQuery.value,
            onInput: (event: Event) => setSearchQuery((event.target as HTMLInputElement).value)
          })
        : null
      const treeBody = empty
        ? h('div', { class: treeEmptyStateClasses }, emptyText)
        : h(
            'div',
            {
              role: 'tree',
              'aria-label': name,
              'aria-labelledby': labelledBy,
              'aria-multiselectable': selection.value.multiple || undefined,
              onKeydown: (event: KeyboardEvent) => {
                const attr = (event.target as HTMLElement)
                  .closest('[data-tiger-treeitem-key]')
                  ?.getAttribute('data-tiger-treeitem-key')
                if (attr == null) return
                handleKeyDown(event, attr)
              }
            },
            props.virtual
              ? [
                  h(
                    VirtualList,
                    {
                      ref: virtualRef,
                      role: 'none',
                      'data-tiger-tree-virtual': '',
                      itemCount: view.value.rows.length,
                      itemHeight: props.itemHeight,
                      height: props.height
                    },
                    {
                      default: ({ index }: { index: number }) => renderRow(index, true)
                    }
                  )
                ]
              : view.value.rows.map((_, index) => renderRow(index, false))
          )

      const {
        class: attrClass,
        style: attrStyle,
        'aria-label': _ariaLabel,
        'aria-labelledby': _labelledBy,
        ...restAttrs
      } = attrs as Record<string, unknown>

      return h(
        'div',
        {
          ...restAttrs,
          class: classNames(
            treeBaseClasses,
            empty && 'p-4',
            props.className,
            coerceClassValue(attrClass)
          ),
          style: attrStyle
        },
        [search, treeBody]
      )
    }
  }
})

export default Tree
