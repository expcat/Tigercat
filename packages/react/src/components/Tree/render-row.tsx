import React from 'react'
import {
  classNames,
  getTreeNodeClasses,
  treeNodeIndentClasses,
  treeNodeCheckboxClasses,
  treeNodeIconClasses,
  treeNodeLabelClasses,
  resolveLocaleText,
  type TreeNode
} from '@expcat/tigercat-core'
import { ExpandIcon, LoadingSpinner } from './icons'
import type { TreeContext } from './types'

export function renderTreeRow(ctx: TreeContext, node: TreeNode, level: number): React.ReactNode {
  const hasChildren = !!(node.children && node.children.length > 0)
  const isExpanded = ctx.computedExpandedKeys.has(node.key)
  const isSelected = ctx.computedSelectedKeys.has(node.key)
  const isChecked = ctx.checkedSets.checkedSet.has(node.key)
  const isHalfChecked = ctx.checkedSets.halfCheckedSet.has(node.key)
  const isLoading = ctx.loadingNodes.has(node.key)
  const isFiltered = ctx.filteredNodeKeys.size > 0
  const isMatched = ctx.filteredNodeKeys.has(node.key)
  const isVisible = !isFiltered || isMatched

  const isExpandable = hasChildren || !!(ctx.loadData && !node.isLeaf)
  const isFocusable = !node.disabled && node.key === (ctx.activeKey ?? ctx.defaultActiveKey)

  if (!isVisible) {
    return null
  }

  const indent = []
  for (let i = 0; i < level; i++) {
    indent.push(<span key={i} className={treeNodeIndentClasses} />)
  }

  return (
    <div
      className={getTreeNodeClasses(isSelected, !!node.disabled, ctx.blockNode)}
      ref={(el) => {
        ctx.itemRefs.current.set(node.key, el)
      }}
      role="treeitem"
      aria-level={level + 1}
      aria-disabled={node.disabled || undefined}
      aria-selected={ctx.effectiveSelectable ? isSelected : undefined}
      aria-expanded={isExpandable ? isExpanded : undefined}
      aria-checked={ctx.checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined}
      tabIndex={isFocusable ? 0 : -1}
      draggable={ctx.isDraggable && !node.disabled ? true : undefined}
      onDragStart={
        ctx.isDraggable && !node.disabled
          ? (e) => {
              e.stopPropagation()
              ctx.dragNodeKeyRef.current = node.key
            }
          : undefined
      }
      onDragOver={
        ctx.isDraggable
          ? (e) => {
              e.preventDefault()
              e.stopPropagation()
            }
          : undefined
      }
      onDrop={
        ctx.isDraggable
          ? (e) => {
              e.preventDefault()
              e.stopPropagation()
              if (ctx.dragNodeKeyRef.current !== null && ctx.dragNodeKeyRef.current !== node.key) {
                ctx.onDrop?.({ dragKey: ctx.dragNodeKeyRef.current, dropKey: node.key })
              }
              ctx.dragNodeKeyRef.current = null
            }
          : undefined
      }
      onDragEnd={
        ctx.isDraggable
          ? () => {
              ctx.dragNodeKeyRef.current = null
            }
          : undefined
      }
      onFocus={() => {
        if (!node.disabled) ctx.setActiveKey(node.key)
      }}
      onKeyDown={(e) => ctx.handleKeyDown(e, node, isExpanded, isChecked)}
      onClick={(e) => {
        ctx.setActiveKey(node.key)
        if (!node.disabled) ctx.onNodeClick?.(node, e)
        if (ctx.effectiveSelectable && !node.disabled) {
          ctx.handleSelect(node.key, e)
        }
      }}>
      {indent}
      <span
        className={isExpandable ? 'cursor-pointer' : ''}
        onClick={(e) => {
          e.stopPropagation()
          if (isExpandable) {
            ctx.setActiveKey(node.key)
            ctx.handleExpand(node.key)
          }
        }}>
        <ExpandIcon expanded={isExpanded} hasChildren={isExpandable} />
      </span>
      {ctx.checkable && (
        <input
          type="checkbox"
          aria-label={resolveLocaleText(
            `Select ${node.label}`,
            ctx.mergedLocale?.locale?.toLowerCase().startsWith('zh')
              ? `选择${node.label}`
              : undefined
          )}
          className={treeNodeCheckboxClasses}
          checked={isChecked}
          ref={(input) => {
            if (input) {
              input.indeterminate = isHalfChecked
            }
          }}
          disabled={node.disabled}
          onClick={(e) => {
            e.stopPropagation()
          }}
          onChange={(e) => {
            ctx.handleCheck(node.key, e.target.checked)
          }}
        />
      )}
      {ctx.showIcon && node.icon ? (
        <span className={treeNodeIconClasses}>{node.icon as React.ReactNode}</span>
      ) : null}
      <span
        className={classNames(
          treeNodeLabelClasses,
          isFiltered && isMatched ? 'font-semibold text-[var(--tiger-primary,#2563eb)]' : ''
        )}>
        {node.label}
      </span>
      {isLoading && <LoadingSpinner />}
    </div>
  )
}
