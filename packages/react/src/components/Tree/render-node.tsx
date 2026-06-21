import React from 'react'
import {
  classNames,
  treeNodeWrapperClasses,
  treeNodeChildrenClasses,
  treeLineClasses,
  type TreeNode
} from '@expcat/tigercat-core'
import { renderTreeRow } from './render-row'
import type { TreeContext } from './types'

export function renderTreeNode(ctx: TreeContext, node: TreeNode, level: number): React.ReactNode {
  const hasChildren = !!(node.children && node.children.length > 0)
  const isExpanded = ctx.computedExpandedKeys.has(node.key)
  const isFiltered = ctx.filteredNodeKeys.size > 0
  const isMatched = ctx.filteredNodeKeys.has(node.key)
  const isVisible = !isFiltered || isMatched

  if (!isVisible) {
    return null
  }

  return (
    <div key={node.key} className={treeNodeWrapperClasses}>
      {renderTreeRow(ctx, node, level)}
      {hasChildren && isExpanded && (
        <div className={classNames(treeNodeChildrenClasses, ctx.showLine && treeLineClasses)}>
          {(node.children ?? []).map((child) => renderTreeNode(ctx, child, level + 1))}
        </div>
      )}
    </div>
  )
}
