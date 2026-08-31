import React from 'react'
import {
  getTreeSelectExpandIconClasses,
  getTreeSelectNodeClasses,
  getTreeSelectNodeIndentStyle,
  getTreeSelectTreeItemAria,
  getTreeSelectTreeItemId,
  treeSelectDoneActionClasses,
  treeSelectDoneButtonClasses,
  treeSelectEmptyClasses,
  treeSelectExpandButtonClasses,
  treeSelectTreeClasses,
  type VisibleTreeItem
} from '@expcat/tigercat-core'
import { VirtualList } from '../VirtualList'
import { TreeSelectNodeChevronIcon } from './icons'
import type { useTreeSelectController } from './state'

type Ctx = ReturnType<typeof useTreeSelectController>

function renderNode(ctx: Ctx, item: VisibleTreeItem) {
  const selected = ctx.selectedKeys.includes(item.key)
  const isActive = ctx.activeKey === item.key
  const expandable = ctx.isExpandable(item.node)
  const expanded = ctx.expandedSet.has(item.key)
  return (
    <div
      key={String(item.key)}
      id={getTreeSelectTreeItemId(ctx.treeId, item.key)}
      className={getTreeSelectNodeClasses({
        isSelected: selected,
        isDisabled: Boolean(item.node.disabled),
        isActive,
        size: ctx.size
      })}
      style={{ ...getTreeSelectNodeIndentStyle(item.level), height: ctx.itemHeight }}
      {...getTreeSelectTreeItemAria({
        selected,
        disabled: Boolean(item.node.disabled),
        level: item.level,
        expanded,
        expandable
      })}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => ctx.handleNodeSelect(item)}>
      {expandable ? (
        <button
          type="button"
          className={treeSelectExpandButtonClasses}
          aria-label={expanded ? ctx.collapseAriaLabel : ctx.expandAriaLabel}
          aria-expanded={expanded}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => ctx.handleExpandClick(item, event)}>
          <span className={getTreeSelectExpandIconClasses(expanded, ctx.dir)}>
            <TreeSelectNodeChevronIcon />
          </span>
        </button>
      ) : (
        <span className="inline-flex w-6 h-6 shrink-0" aria-hidden="true" />
      )}
      {ctx.multiple ? (
        <input
          type="checkbox"
          className="me-2"
          tabIndex={-1}
          checked={selected}
          disabled={Boolean(item.node.disabled)}
          readOnly
          aria-hidden="true"
        />
      ) : null}
      <span className="flex-1 truncate">{item.node.label}</span>
    </div>
  )
}

export function renderTreeSelectPanel(ctx: Ctx) {
  const body =
    ctx.visibleItems.length === 0 ? (
      <div className={treeSelectEmptyClasses}>{ctx.emptyCopy}</div>
    ) : ctx.virtual ? (
      <div className={treeSelectTreeClasses} style={{ height: ctx.height }} {...ctx.treeAria}>
        <VirtualList
          itemCount={ctx.visibleItems.length}
          itemHeight={ctx.itemHeight}
          height={ctx.height}
          renderItem={({ index }) => {
            const item = ctx.visibleItems[index]
            return item ? renderNode(ctx, item) : null
          }}
        />
      </div>
    ) : (
      <div
        className={treeSelectTreeClasses}
        style={{ maxHeight: `${ctx.height}px` }}
        {...ctx.treeAria}>
        {ctx.visibleItems.map((item) => renderNode(ctx, item))}
      </div>
    )

  return (
    <>
      {body}
      <div className={treeSelectDoneActionClasses}>
        <button
          type="button"
          className={treeSelectDoneButtonClasses}
          data-tiger-treeselect-done=""
          onMouseDown={(event) => event.preventDefault()}
          onClick={ctx.closeDropdown}>
          {ctx.doneText}
        </button>
      </div>
    </>
  )
}
