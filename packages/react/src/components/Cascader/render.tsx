import React from 'react'
import {
  cascaderBackButtonClasses,
  cascaderColumnsClasses,
  cascaderDoneActionClasses,
  cascaderDoneButtonClasses,
  cascaderEmptyStateClasses,
  cascaderListboxClasses,
  cascaderSearchInputClasses,
  cascaderSearchWrapClasses,
  getCascaderColumnClasses,
  getCascaderColumnStyle,
  getCascaderOptionClasses,
  getCascaderVirtualRange,
  type CascaderFlattenedOption,
  type CascaderOption
} from '@expcat/tigercat-core'
import { CascaderColumnChevronIcon } from './icons'
import type { useCascaderController } from './state'

type Ctx = ReturnType<typeof useCascaderController>

function VirtualWindow<T>({
  items,
  itemHeight,
  listHeight,
  scrollTop,
  onScrollTop,
  renderItem
}: {
  items: T[]
  itemHeight: number
  listHeight: number
  scrollTop: number
  onScrollTop: (top: number) => void
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  const range = getCascaderVirtualRange(scrollTop, listHeight, items.length, itemHeight)
  const slice = items.slice(range.startIndex, range.endIndex + 1)
  return (
    <div
      style={{ height: listHeight, overflow: 'auto' }}
      onScroll={(event) => onScrollTop((event.target as HTMLElement).scrollTop)}>
      <div style={{ height: range.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${range.offsetTop}px)` }}>
          {slice.map((item, offset) => renderItem(item, range.startIndex + offset))}
        </div>
      </div>
    </div>
  )
}

function renderOptionRow(ctx: Ctx, option: CascaderOption, colIndex: number, optionIndex: number) {
  const isSelected = ctx.isSelectedValue(colIndex, option)
  const isActive = (ctx.columnActiveIndices[colIndex] ?? -1) === optionIndex
  const expandable = ctx.isExpandable(option)
  return (
    <div
      key={ctx.getOptionKey(option, optionIndex)}
      id={
        colIndex === ctx.focusedColumnIndex
          ? ctx.getColumnOptionId(colIndex, optionIndex)
          : undefined
      }
      data-option-index={optionIndex}
      data-active={isActive || undefined}
      className={getCascaderOptionClasses({
        isSelected,
        isDisabled: Boolean(option.disabled),
        isActive,
        size: ctx.size
      })}
      style={{ height: ctx.itemHeight }}
      {...ctx.optionAria({ selected: isSelected, disabled: Boolean(option.disabled) })}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => ctx.handleOptionHover(option, colIndex)}
      onClick={() => ctx.handleOptionClick(option, colIndex)}>
      <span className="flex-1 truncate">{option.label}</span>
      {expandable ? <CascaderColumnChevronIcon dir={ctx.dir} /> : null}
    </div>
  )
}

function renderSearchRow(ctx: Ctx, item: CascaderFlattenedOption, index: number) {
  const selected = ctx.isSelectedPath(item.valuePath)
  const isActive = ctx.searchActiveIndex === index
  const label =
    typeof ctx.searchableConfig === 'object' && ctx.searchableConfig.render
      ? ctx.searchableConfig.render(ctx.searchQuery, item.path)
      : item.label
  return (
    <div
      key={`${index}-${item.valuePath.join(',')}`}
      id={ctx.getOptionId(index)}
      data-option-index={index}
      data-active={isActive || undefined}
      className={getCascaderOptionClasses({
        isSelected: selected,
        isDisabled: item.disabled,
        isActive,
        size: ctx.size
      })}
      style={{ height: ctx.itemHeight }}
      {...ctx.optionAria({ selected, disabled: item.disabled })}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => {
        if (!item.disabled) ctx.setSearchActiveIndex(index)
      }}
      onClick={() => ctx.handleSearchResultClick(item)}>
      <span className="flex-1 truncate">{label}</span>
    </div>
  )
}

export function renderCascaderPanel(ctx: Ctx) {
  const hasSearchChrome = ctx.searchable && ctx.isOpen
  const searchChrome = hasSearchChrome ? null : ctx.searchable ? (
    <div className={cascaderSearchWrapClasses}>
      <input
        ref={ctx.searchInputRef}
        type="text"
        className={cascaderSearchInputClasses}
        value={ctx.searchQuery}
        placeholder={ctx.searchPlaceholder}
        aria-label={ctx.searchPlaceholder}
        onChange={(event) => ctx.updateSearchValue(event.target.value)}
        onKeyDown={ctx.handleTriggerKeyDown}
        onBlur={ctx.handleFocusOut}
      />
    </div>
  ) : null

  let body: React.ReactNode
  if (ctx.isSearchMode) {
    if (ctx.searchResults.length === 0) {
      body = <div className={cascaderEmptyStateClasses}>{ctx.emptyCopy}</div>
    } else if (ctx.virtual) {
      body = (
        <div
          className={cascaderListboxClasses}
          style={{ maxHeight: `${ctx.listHeight}px` }}
          {...ctx.listboxAria}>
          <VirtualWindow
            items={ctx.searchResults}
            itemHeight={ctx.itemHeight}
            listHeight={ctx.listHeight}
            scrollTop={ctx.searchScrollTop}
            onScrollTop={ctx.setSearchScrollTop}
            renderItem={(item, index) => renderSearchRow(ctx, item, index)}
          />
        </div>
      )
    } else {
      body = (
        <div
          className={cascaderListboxClasses}
          style={{ maxHeight: `${ctx.listHeight}px` }}
          {...ctx.listboxAria}>
          {ctx.searchResults.map((item, index) => renderSearchRow(ctx, item, index))}
        </div>
      )
    }
  } else if (ctx.columns.length === 0) {
    body = <div className={cascaderEmptyStateClasses}>{ctx.emptyCopy}</div>
  } else {
    body = (
      <>
        {ctx.focusedColumnIndex > 0 ? (
          <button
            type="button"
            className={cascaderBackButtonClasses}
            data-tiger-cascader-back=""
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => ctx.setFocusedColumnIndex(Math.max(0, ctx.focusedColumnIndex - 1))}>
            {ctx.backText}
          </button>
        ) : null}
        <div className={cascaderColumnsClasses}>
          {ctx.columns.map((column, colIndex) => {
            const focused = colIndex === ctx.focusedColumnIndex
            const listboxProps = focused ? ctx.listboxAria : {}
            const rows = ctx.virtual ? (
              <VirtualWindow
                items={column.options}
                itemHeight={ctx.itemHeight}
                listHeight={ctx.listHeight}
                scrollTop={ctx.columnScrollTops[colIndex] ?? 0}
                onScrollTop={() => undefined}
                renderItem={(option, optionIndex) =>
                  renderOptionRow(ctx, option, colIndex, optionIndex)
                }
              />
            ) : (
              column.options.map((option, optionIndex) =>
                renderOptionRow(ctx, option, colIndex, optionIndex)
              )
            )
            return (
              <div
                key={colIndex}
                className={getCascaderColumnClasses(focused)}
                style={getCascaderColumnStyle(ctx.listHeight)}
                data-focused={focused || undefined}
                aria-label={ctx.formatLevel(colIndex + 1)}
                {...listboxProps}>
                {column.options.length === 0 ? (
                  <div className={cascaderEmptyStateClasses}>{ctx.emptyCopy}</div>
                ) : (
                  rows
                )}
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      {searchChrome}
      {body}
      <div className={cascaderDoneActionClasses}>
        <button
          type="button"
          className={cascaderDoneButtonClasses}
          data-tiger-cascader-done=""
          onMouseDown={(event) => event.preventDefault()}
          onClick={ctx.closeDropdown}>
          {ctx.doneText}
        </button>
      </div>
    </>
  )
}
