import {
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  getCheckboxVisualClasses,
  getTreeSelectExpandIconClasses,
  getTreeSelectNodeClasses,
  getTreeSelectNodeIndentStyle,
  getTreeSelectTreeItemAria,
  getTreeSelectTreeItemId,
  sameTreeKey,
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
  const checked = ctx.checkedState.checked.some((key) => sameTreeKey(key, item.key))
  const halfChecked = ctx.checkedState.halfChecked.some((key) => sameTreeKey(key, item.key))
  const selected = ctx.multiple ? checked : ctx.selectedKeys.some((key) => sameTreeKey(key, item.key))
  const isActive = ctx.activeKey !== undefined && sameTreeKey(ctx.activeKey, item.key)
  const expandable = ctx.isExpandable(item.node)
  const expanded = ctx.isExpanded(item.key)
  const loading = ctx.isLoadingKey(item.key)
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
        expandable,
        isLeaf: item.node.isLeaf,
        checkable: ctx.multiple,
        checked,
        halfChecked
      })}
      aria-busy={loading || undefined}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => ctx.handleNodeSelect(item)}>
      {expandable ? (
        <button
          type="button"
          className={treeSelectExpandButtonClasses}
          aria-label={expanded ? ctx.collapseAriaLabel : ctx.expandAriaLabel}
          tabIndex={-1}
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
        <span
          data-tiger-tree-check=""
          aria-hidden="true"
          className={getCheckboxVisualClasses({
            size: 'sm',
            checked,
            indeterminate: halfChecked,
            disabled: Boolean(item.node.disabled)
          })}>
          {checked || halfChecked ? (
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
              <path d={halfChecked ? checkboxIndeterminatePathD : checkboxCheckPathD} />
            </svg>
          ) : null}
        </span>
      ) : null}
      <span className="flex-1 truncate">{item.node.label}</span>
      {loading ? <span className="sr-only">{ctx.loadingText}</span> : null}
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
          ref={ctx.virtualListRef}
          role="none"
          data-tiger-treeselect-virtual=""
          itemCount={ctx.visibleItems.length}
          itemHeight={ctx.itemHeight}
          height={ctx.height}
          getItemKey={(index) => String(ctx.visibleItems[index]?.key ?? index)}
          onScroll={ctx.onListScroll}
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
