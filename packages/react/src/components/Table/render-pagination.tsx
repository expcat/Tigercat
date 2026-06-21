import React from 'react'
import {
  formatIntlNumber,
  formatPaginationTotal,
  formatPaginationPageIndicator,
  getPaginationLabels,
  getSimplePaginationContainerClasses,
  getSimplePaginationTotalClasses,
  getSimplePaginationControlsClasses,
  getSimplePaginationSelectClasses,
  getSimplePaginationButtonClasses,
  getSimplePaginationPageIndicatorClasses,
  getSimplePaginationButtonsWrapperClasses,
  type TigerLocale,
  type PaginationConfig,
  type PaginationPageSizeOptionItem
} from '@expcat/tigercat-core'
import type { TableContext } from './types'

export interface RenderPaginationViewProps {
  pagination: PaginationConfig | false
  locale?: Partial<TigerLocale>
  disableI18n?: boolean
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
  const labels = getPaginationLabels(locale)
  const localeCode = locale?.locale

  const finalTotalText = paginationConfig.totalText
    ? paginationConfig.totalText(total, [startIndex, endIndex])
    : formatPaginationTotal(labels.totalText, total, [startIndex, endIndex], localeCode)

  const finalPrevText = paginationConfig.prevText || labels.prevPageAriaLabel
  const finalNextText = paginationConfig.nextText || labels.nextPageAriaLabel

  const finalPageIndicatorText = paginationConfig.pageIndicatorText
    ? paginationConfig.pageIndicatorText(ctx.currentPage, totalPages)
    : formatPaginationPageIndicator(
        labels.pageIndicatorText,
        ctx.currentPage,
        totalPages,
        localeCode
      )

  const finalPrevAriaLabel = view.disableI18n ? finalPrevText : labels.prevPageAriaLabel
  const finalNextAriaLabel = view.disableI18n ? finalNextText : labels.nextPageAriaLabel
  const normalizedPageSizeOptions = (paginationConfig.pageSizeOptions || [
    10, 20, 50, 100
  ]) as PaginationPageSizeOptionItem[]

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
            aria-label={labels.itemsPerPageText}
            onChange={(e) => ctx.handlePageSizeChange(Number(e.target.value))}>
            {normalizedPageSizeOptions.map((option) => {
              const value = typeof option === 'number' ? option : option.value
              const label =
                typeof option === 'number'
                  ? `${formatIntlNumber(value, localeCode)} ${labels.itemsPerPageText}`
                  : (option.label ??
                    `${formatIntlNumber(value, localeCode)} ${labels.itemsPerPageText}`)

              return (
                <option key={value} value={value}>
                  {paginationConfig.pageSizeText ? paginationConfig.pageSizeText(value) : label}
                </option>
              )
            })}
          </select>
        )}

        <div className={getSimplePaginationButtonsWrapperClasses()}>
          <button
            className={getSimplePaginationButtonClasses(!hasPrev)}
            disabled={!hasPrev}
            aria-label={finalPrevAriaLabel}
            onClick={() => ctx.handlePageChange(ctx.currentPage - 1)}>
            {finalPrevText}
          </button>

          <span
            className={getSimplePaginationPageIndicatorClasses()}
            aria-label={finalPageIndicatorText}>
            {finalPageIndicatorText}
          </span>

          <button
            className={getSimplePaginationButtonClasses(!hasNext)}
            disabled={!hasNext}
            aria-label={finalNextAriaLabel}
            onClick={() => ctx.handlePageChange(ctx.currentPage + 1)}>
            {finalNextText}
          </button>
        </div>
      </div>
    </div>
  )
}
