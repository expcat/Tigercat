import React from 'react'
import {
  getSimplePaginationContainerClasses,
  getSimplePaginationTotalClasses,
  getSimplePaginationControlsClasses,
  getSimplePaginationSelectClasses,
  getSimplePaginationButtonClasses,
  getSimplePaginationPageIndicatorClasses,
  getSimplePaginationButtonsWrapperClasses,
  type PaginationConfig
} from '@expcat/tigercat-core'
import type { TableContext } from './types'

export interface RenderPaginationViewProps {
  pagination: PaginationConfig | false
}

export function renderPagination(
  ctx: TableContext,
  view: RenderPaginationViewProps
): React.ReactNode {
  const { pagination } = view
  if (pagination === false || !ctx.paginationInfo) {
    return null
  }

  const { totalPages, startIndex, endIndex, hasNext, hasPrev } = ctx.paginationInfo
  const total = ctx.processedData.length
  const paginationConfig = pagination as PaginationConfig

  return (
    <div className={getSimplePaginationContainerClasses()}>
      {paginationConfig.showTotal !== false && (
        <div className={getSimplePaginationTotalClasses()}>
          {paginationConfig.totalText
            ? paginationConfig.totalText(total, [startIndex, endIndex])
            : `Showing ${startIndex} to ${endIndex} of ${total} results`}
        </div>
      )}

      <div className={getSimplePaginationControlsClasses()}>
        {paginationConfig.showSizeChanger !== false && (
          <select
            className={getSimplePaginationSelectClasses()}
            value={ctx.currentPageSize}
            onChange={(e) => ctx.handlePageSizeChange(Number(e.target.value))}>
            {(paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}

        <div className={getSimplePaginationButtonsWrapperClasses()}>
          <button
            className={getSimplePaginationButtonClasses(!hasPrev)}
            disabled={!hasPrev}
            onClick={() => ctx.handlePageChange(ctx.currentPage - 1)}>
            Previous
          </button>

          <span className={getSimplePaginationPageIndicatorClasses()}>
            Page {ctx.currentPage} of {totalPages}
          </span>

          <button
            className={getSimplePaginationButtonClasses(!hasNext)}
            disabled={!hasNext}
            onClick={() => ctx.handlePageChange(ctx.currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
