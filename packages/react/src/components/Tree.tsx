import React from 'react'
import {
  classNames,
  treeBaseClasses,
  treeEmptyStateClasses,
  resolveLocaleText
} from '@expcat/tigercat-core'
import { VirtualList } from './VirtualList'
import { useTreeState } from './Tree/state'
import { renderTreeNode } from './Tree/render-node'
import { renderTreeRow } from './Tree/render-row'
import type { TreeProps } from './Tree/types'

export type { TreeProps } from './Tree/types'

export const Tree: React.FC<TreeProps> = (props) => {
  const ctx = useTreeState(props)

  if (!ctx.treeData || ctx.treeData.length === 0) {
    return (
      <div
        className={classNames(treeBaseClasses, 'p-4', ctx.className)}
        role="tree"
        aria-label={ctx.ariaLabel}>
        <div className={treeEmptyStateClasses}>
          {resolveLocaleText('No data', ctx.emptyText, ctx.mergedLocale?.common?.emptyText)}
        </div>
      </div>
    )
  }

  return (
    <div
      className={classNames(treeBaseClasses, ctx.className)}
      role="tree"
      aria-label={ctx.ariaLabel}
      aria-multiselectable={ctx.effectiveMultiple || undefined}>
      {ctx.searchable && (
        <input
          type="text"
          className="w-full mb-2 px-2 py-1 text-sm border border-[var(--tiger-border,#e5e7eb)] rounded bg-[var(--tiger-surface,#ffffff)] focus:outline-none focus:ring-1 focus:ring-[var(--tiger-primary,#2563eb)]"
          placeholder={resolveLocaleText('Search...', ctx.mergedLocale?.common?.searchPlaceholder)}
          value={ctx.internalSearchValue}
          onChange={(e) => ctx.setInternalSearchValue(e.target.value)}
        />
      )}
      {ctx.virtual ? (
        <VirtualList
          itemCount={ctx.visibleItems.length}
          itemHeight={ctx.itemHeight}
          height={ctx.height}
          renderItem={({ index }) => {
            const item = ctx.visibleItems[index]
            if (!item) return null
            return renderTreeRow(ctx, item.node, item.level - 1)
          }}
        />
      ) : (
        ctx.treeData.map((node) => renderTreeNode(ctx, node, 0))
      )}
    </div>
  )
}

export default Tree
