import React from 'react'
import {
  formatIntlNumber,
  formatPageAriaLabel,
  formatPaginationTotal,
  getPaginationLabels,
  getSimplePaginationContainerClasses,
  getSimplePaginationTotalClasses,
  getSimplePaginationControlsClasses,
  getSimplePaginationSelectClasses,
  getSimplePaginationButtonClasses,
  getSimplePaginationPageIndicatorClasses,
  getSimplePaginationButtonsWrapperClasses,
  type TigerLocale,
  type PaginationConfig
} from '@expcat/tigercat-core'
import type { TableContext } from './types'

export interface RenderPaginationViewProps {
  pagination: PaginationConfig | false
  locale?: Partial<TigerLocale>
  disableI18n?: boolean
}

const DEFAULT_PREV_TEXT = 'Previous'
const DEFAULT_NEXT_TEXT = 'Next'

function formatDefaultTotalText(total: number, range: [number, number]): string {
  return `Showing ${range[0]} to ${range[1]} of ${total} results`
}

function formatDefaultPageIndicatorText(current: number, total: number): string {
  return `Page ${current} of ${total}`
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
  const paginationConfig = pagination as PaginationConfig
  const total =
    paginationConfig.total !== undefined && paginationConfig.total > 0
      ? paginationConfig.total
      : ctx.processedData.length

  const locale = view.disableI18n ? undefined : view.locale
  const labels = locale ? getPaginationLabels(locale) : undefined
  const localeCode = locale?.locale

  const finalTotalText = paginationConfig.totalText
    ? paginationConfig.totalText(total, [startIndex, endIndex])
    : labels
      ? formatPaginationTotal(labels.totalText, total, [startIndex, endIndex], localeCode)
      : formatDefaultTotalText(total, [startIndex, endIndex])

  const finalPrevText = paginationConfig.prevText || labels?.prevPageAriaLabel || DEFAULT_PREV_TEXT
  const finalNextText = paginationConfig.nextText || labels?.nextPageAriaLabel || DEFAULT_NEXT_TEXT

  const finalPageIndicatorText = paginationConfig.pageIndicatorText
    ? paginationConfig.pageIndicatorText(ctx.currentPage, totalPages)
    : labels
      ? `${formatPageAriaLabel(labels.pageAriaLabel, ctx.currentPage, localeCode)} / ${formatIntlNumber(totalPages, localeCode)} ${labels.pageText}`
      : formatDefaultPageIndicatorText(ctx.currentPage, totalPages)

  return (
    <div className={getSimplePaginationContainerClasses()}>
      {paginationConfig.showTotal !== false && (
        <div className={getSimplePaginationTotalClasses()}>{finalTotalText}</div>
      )}

      <div className={getSimplePaginationControlsClasses()}>
        {paginationConfig.showSizeChanger !== false && (
          <select
            className={getSimplePaginationSelectClasses()}
            value={ctx.currentPageSize}
            onChange={(e) => ctx.handlePageSizeChange(Number(e.target.value))}>
            {(paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
              <option key={size} value={size}>
                {paginationConfig.pageSizeText
                  ? paginationConfig.pageSizeText(size)
                  : labels
                    ? `${formatIntlNumber(size, localeCode)} ${labels.itemsPerPageText}`
                    : `${size} / page`}
              </option>
            ))}
          </select>
        )}

        <div className={getSimplePaginationButtonsWrapperClasses()}>
          <button
            className={getSimplePaginationButtonClasses(!hasPrev)}
            disabled={!hasPrev}
            onClick={() => ctx.handlePageChange(ctx.currentPage - 1)}>
            {finalPrevText}
          </button>

          <span className={getSimplePaginationPageIndicatorClasses()}>
            {finalPageIndicatorText}
          </span>

          <button
            className={getSimplePaginationButtonClasses(!hasNext)}
            disabled={!hasNext}
            onClick={() => ctx.handlePageChange(ctx.currentPage + 1)}>
            {finalNextText}
          </button>
        </div>
      </div>
    </div>
  )
}
