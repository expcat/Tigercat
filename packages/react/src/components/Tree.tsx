import React, { forwardRef } from 'react'
import {
  classNames,
  treeBaseClasses,
  treeEmptyStateClasses,
  treeSearchInputClasses
} from '@expcat/tigercat-core'
import { VirtualList } from './VirtualList'
import { useTreeState } from './Tree/state'
import { renderTreeRow, renderTreeRows } from './Tree/render-row'
import type { TreeProps } from './Tree/types'

export type { TreeProps } from './Tree/types'

export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(props, ref) {
  const ctx = useTreeState(props)
  const {
    treeData: _treeData,
    selectionMode: _selectionMode,
    checkable: _checkable,
    showIcon: _showIcon,
    showLine: _showLine,
    defaultExpandedKeys: _defaultExpandedKeys,
    defaultSelectedKeys: _defaultSelectedKeys,
    defaultCheckedKeys: _defaultCheckedKeys,
    expandedKeys: _expandedKeys,
    selectedKeys: _selectedKeys,
    checkedKeys: _checkedKeys,
    defaultExpandAll: _defaultExpandAll,
    checkStrictly: _checkStrictly,
    checkStrategy: _checkStrategy,
    selectable: _selectable,
    multiple: _multiple,
    allowDeselect: _allowDeselect,
    loadData: _loadData,
    loadedKeys: _loadedKeys,
    filterValue: _filterValue,
    searchValue: _searchValue,
    defaultSearchValue: _defaultSearchValue,
    searchable: _searchable,
    filterFn: _filterFn,
    filterMode: _filterMode,
    autoExpandParent: _autoExpandParent,
    blockNode: _blockNode,
    emptyText: _emptyText,
    ariaLabel: _ariaLabel,
    onExpandedKeysChange: _onExpandedKeysChange,
    onSelectedKeysChange: _onSelectedKeysChange,
    onCheckedKeysChange: _onCheckedKeysChange,
    onSearch: _onSearch,
    onExpand: _onExpand,
    onSelect: _onSelect,
    onCheck: _onCheck,
    onLoad: _onLoad,
    onLoadedKeysChange: _onLoadedKeysChange,
    onDrop: _onDrop,
    onTreeDataChange: _onTreeDataChange,
    onNodeClick: _onNodeClick,
    onNodeExpand: _onNodeExpand,
    onNodeCollapse: _onNodeCollapse,
    draggable: _draggable,
    virtual: _virtual,
    height: _height,
    itemHeight: _itemHeight,
    locale: _locale,
    className: _className,
    'aria-labelledby': _labelledBy,
    'aria-label': _htmlAriaLabel,
    ...rest
  } = props

  const search = ctx.searchable ? (
    <input
      type="search"
      className={treeSearchInputClasses}
      placeholder={ctx.searchPlaceholder}
      value={ctx.searchQuery}
      onChange={(event) => ctx.setSearchQuery(event.target.value)}
    />
  ) : null

  const empty = !ctx.treeData.length
  const tree = empty ? (
    <div className={treeEmptyStateClasses}>{ctx.emptyText}</div>
  ) : (
    <div
      role="tree"
      aria-label={ctx.ariaLabel}
      aria-labelledby={ctx.labelledBy}
      aria-multiselectable={ctx.multiple || undefined}
      onKeyDown={(event) => {
        const attr = (event.target as HTMLElement)
          .closest('[data-tiger-treeitem-key]')
          ?.getAttribute('data-tiger-treeitem-key')
        if (attr == null) return
        ctx.handleKeyDown(event, attr)
      }}>
      {ctx.virtual ? (
        <VirtualList
          ref={ctx.virtualRef}
          role="none"
          data-tiger-tree-virtual=""
          itemCount={ctx.view.rows.length}
          itemHeight={ctx.itemHeight}
          height={ctx.height}
          renderItem={({ index }) => renderTreeRow(ctx, index, true)}
        />
      ) : (
        renderTreeRows(ctx, false)
      )}
    </div>
  )

  return (
    <div {...rest} ref={ref} className={classNames(treeBaseClasses, empty && 'p-4', ctx.className)}>
      {search}
      {tree}
    </div>
  )
})

export default Tree
