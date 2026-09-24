import React from 'react'
import {
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  classNames,
  getCheckboxVisualClasses,
  getHighlightSegments,
  getTreeIndentSlotClasses,
  getTreeIndentSlots,
  getTreeNodeClasses,
  highlightMarkClasses,
  nextCheckedFromTreeRow,
  navLabels,
  sameTreeKey,
  treeDropAfterClasses,
  treeDropBeforeClasses,
  treeDropInsideClasses,
  treeItemKeyAttr,
  treeKeyId,
  treeNodeIconClasses,
  treeNodeLabelClasses,
  treeNodeLabelMatchedClasses
} from '@expcat/tigercat-core'
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
      aria-expanded={
        node.isLeaf === true ? undefined : row.expandable || row.expanded ? row.expanded : undefined
      }
      aria-busy={row.loading || undefined}
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
        <span
          data-tiger-tree-check=""
          data-checked={row.halfChecked ? 'mixed' : row.checked ? 'true' : 'false'}
          aria-hidden="true"
          className={classNames(
            getCheckboxVisualClasses({
              size: 'sm',
              checked: row.checked,
              indeterminate: row.halfChecked,
              disabled: row.disabled
            }),
            'me-2 shrink-0'
          )}
          onClick={(event) => {
            event.stopPropagation()
            if (row.disabled) return
            ctx.handleCheck(node.key, nextCheckedFromTreeRow(row.checked, row.halfChecked))
          }}>
          {row.checked || row.halfChecked ? (
            <svg
              className={checkboxIconSizeClasses.sm}
              viewBox={checkboxIconViewBox}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false">
              <path d={row.halfChecked ? checkboxIndeterminatePathD : checkboxCheckPathD} />
            </svg>
          ) : null}
        </span>
      ) : null}
      {ctx.showIcon && node.icon != null ? (
        <span className={treeNodeIconClasses}>{renderNodeIcon(node.icon)}</span>
      ) : ctx.showIcon && node.directory ? (
        <span data-tiger-tree-directory="" className={treeNodeIconClasses} aria-hidden="true">
          ▸<span className="sr-only">{navLabels.directory}</span>
        </span>
      ) : null}
      <span
        className={classNames(
          treeNodeLabelClasses,
          row.matched && ctx.searchQuery ? treeNodeLabelMatchedClasses : undefined
        )}>
        {renderLabel(node.label, ctx.searchQuery, row.matched)}
      </span>
      {row.loading ? (
        <span className="inline-flex items-center">
          <LoadingSpinner />
          <span className="sr-only">{ctx.loadingText}</span>
        </span>
      ) : null}
    </div>
  )
}

export function renderTreeRows(ctx: TreeContext, fillHeight: boolean): React.ReactNode {
  return ctx.view.rows.map((_, index) => renderTreeRow(ctx, index, fillHeight))
}
