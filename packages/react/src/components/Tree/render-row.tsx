import React from 'react'
import {
  classNames,
  getHighlightSegments,
  getTreeIndentSlotClasses,
  getTreeIndentSlots,
  getTreeNodeClasses,
  highlightMarkClasses,
  sameTreeKey,
  treeDropAfterClasses,
  treeDropBeforeClasses,
  treeDropInsideClasses,
  treeItemKeyAttr,
  treeKeyId,
  treeNodeIconClasses,
  treeNodeLabelClasses,
  treeNodeLabelMatchedClasses,
  type TreeNode
} from '@expcat/tigercat-core'
import { Checkbox } from '../Checkbox'
import { ExpandIcon, LoadingSpinner } from './icons'
import type { TreeContext } from './types'

function renderNodeIcon(icon: unknown): React.ReactNode {
  if (icon == null || typeof icon === 'boolean') return null
  if (typeof icon === 'string' || typeof icon === 'number') return icon
  return icon as React.ReactNode
}

function renderLabel(label: string, query: string, matched: boolean): React.ReactNode {
  if (!query || !matched) return label
  const segments = getHighlightSegments(label, query, { global: true, caseSensitive: false })
  if (segments.length === 0) return label
  return segments.map((segment, index) =>
    segment.highlighted ? (
      <mark key={index} className={highlightMarkClasses}>
        {segment.text}
      </mark>
    ) : (
      <React.Fragment key={index}>{segment.text}</React.Fragment>
    )
  )
}

export function renderTreeRow(
  ctx: TreeContext,
  rowIndex: number,
  fillHeight: boolean
): React.ReactNode {
  const row = ctx.view.rows[rowIndex]
  if (!row) return null
  const { item } = row
  const node = item.node
  const isFocusable =
    !row.disabled && sameTreeKey(node.key, ctx.activeKey ?? ctx.view.defaultActiveKey)
  const indent = getTreeIndentSlots(item, ctx.showLine)
  const dropping = ctx.draggable && ctx.dropKey !== undefined && sameTreeKey(ctx.dropKey, node.key)

  return (
    <div
      key={treeKeyId(node.key)}
      className={classNames(
        getTreeNodeClasses(row.selected, row.disabled, ctx.blockNode || fillHeight, {
          active: isFocusable,
          interactive: ctx.selectable || row.expandable || ctx.checkable
        }),
        fillHeight && 'h-full min-h-0 overflow-hidden',
        dropping && ctx.dropPosition === 'before' && treeDropBeforeClasses,
        dropping && ctx.dropPosition === 'after' && treeDropAfterClasses,
        dropping && ctx.dropPosition === 'inside' && treeDropInsideClasses
      )}
      ref={(el) => {
        const id = treeKeyId(node.key)
        if (el) ctx.itemRefs.current.set(id, el)
        else ctx.itemRefs.current.delete(id)
      }}
      role="treeitem"
      data-tiger-treeitem-key={treeItemKeyAttr(node.key)}
      aria-level={item.level}
      aria-setsize={row.setsize}
      aria-posinset={row.posinset}
      aria-disabled={row.disabled || undefined}
      aria-selected={ctx.selectable ? row.selected : undefined}
      aria-expanded={row.expandable ? row.expanded : undefined}
      aria-checked={ctx.checkable ? (row.halfChecked ? 'mixed' : row.checked) : undefined}
      tabIndex={isFocusable ? 0 : -1}
      draggable={ctx.draggable && !row.disabled ? true : undefined}
      onDragStart={
        ctx.draggable && !row.disabled
          ? (event) => {
              event.stopPropagation()
              ctx.startTreeDrag(node.key, event)
            }
          : undefined
      }
      onDragOver={
        ctx.draggable
          ? (event) => {
              event.stopPropagation()
              ctx.overTreeDrag(node.key, event)
            }
          : undefined
      }
      onDrop={
        ctx.draggable
          ? (event) => {
              event.stopPropagation()
              ctx.dropTreeDrag(event)
            }
          : undefined
      }
      onDragEnd={ctx.draggable ? () => ctx.endTreeDrag() : undefined}
      onFocus={() => {
        if (!row.disabled) ctx.setActiveKey(node.key)
      }}
      onKeyDown={(event) => ctx.handleKeyDown(event, node.key)}
      onClick={(event) => ctx.handleNodeClick(node, event)}>
      {indent.map((slot) => (
        <span key={slot.key} className={getTreeIndentSlotClasses(slot)} aria-hidden="true" />
      ))}
      {row.expandable ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="inline-flex items-center justify-center w-6 h-6 shrink-0"
          onClick={(event) => {
            event.stopPropagation()
            if (!row.disabled) {
              ctx.setActiveKey(node.key)
              ctx.handleExpand(node.key)
            }
          }}>
          <ExpandIcon expanded={row.expanded} expandable />
        </button>
      ) : (
        <ExpandIcon expanded={false} expandable={false} />
      )}
      {ctx.checkable ? (
        <Checkbox
          tabIndex={-1}
          size="sm"
          checked={row.checked}
          indeterminate={row.halfChecked}
          disabled={row.disabled}
          aria-label={ctx.selectNodeLabel(node.label)}
          className="me-2 shrink-0"
          onClick={(event) => event.stopPropagation()}
          onChange={(checked, event) => {
            event.stopPropagation()
            ctx.handleCheck(node.key, checked)
          }}
        />
      ) : null}
      {ctx.showIcon && node.icon != null ? (
        <span className={treeNodeIconClasses}>{renderNodeIcon(node.icon)}</span>
      ) : null}
      <span
        className={classNames(
          treeNodeLabelClasses,
          row.matched && ctx.searchQuery ? treeNodeLabelMatchedClasses : undefined
        )}>
        {renderLabel(node.label, ctx.searchQuery, row.matched)}
      </span>
      {row.loading ? <LoadingSpinner /> : null}
    </div>
  )
}

export function renderTreeRows(ctx: TreeContext, fillHeight: boolean): React.ReactNode {
  return ctx.view.rows.map((_, index) => renderTreeRow(ctx, index, fillHeight))
}
