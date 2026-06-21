import { h, type VNodeChild } from 'vue'
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
import type { TableContext, TableInternalProps } from './types'

export interface RenderPaginationOptions {
  locale?: Partial<TigerLocale>
  disableI18n?: boolean
}

export function renderPagination(
  ctx: TableContext,
  props: TableInternalProps,
  view?: RenderPaginationOptions
): VNodeChild {
  if (props.pagination === false || !ctx.paginationInfo.value) {
    return null
  }

  const { totalPages, startIndex, endIndex, hasNext, hasPrev } = ctx.paginationInfo.value
  const paginationConfig = props.pagination as PaginationConfig
  const total =
    paginationConfig.total !== undefined && paginationConfig.total > 0
      ? paginationConfig.total
      : ctx.processedData.value.length

  const locale = view?.disableI18n ? undefined : view?.locale
  const labels = getPaginationLabels(locale)
  const localeCode = locale?.locale

  const finalTotalText = paginationConfig.totalText
    ? paginationConfig.totalText(total, [startIndex, endIndex])
    : formatPaginationTotal(labels.totalText, total, [startIndex, endIndex], localeCode)

  const finalPrevText = paginationConfig.prevText || labels.prevPageAriaLabel
  const finalNextText = paginationConfig.nextText || labels.nextPageAriaLabel

  const finalPageIndicatorText = paginationConfig.pageIndicatorText
    ? paginationConfig.pageIndicatorText(ctx.currentPage.value, totalPages)
    : formatPaginationPageIndicator(
        labels.pageIndicatorText,
        ctx.currentPage.value,
        totalPages,
        localeCode
      )

  const finalPrevAriaLabel = view?.disableI18n ? finalPrevText : labels.prevPageAriaLabel
  const finalNextAriaLabel = view?.disableI18n ? finalNextText : labels.nextPageAriaLabel
  const normalizedPageSizeOptions = (paginationConfig.pageSizeOptions || [
    10, 20, 50, 100
  ]) as PaginationPageSizeOptionItem[]

  return h('div', { class: getSimplePaginationContainerClasses() }, [
    paginationConfig.showTotal !== false &&
      h('div', { class: getSimplePaginationTotalClasses() }, finalTotalText),

    h('div', { class: getSimplePaginationControlsClasses() }, [
      paginationConfig.showSizeChanger !== false &&
        h(
          'select',
          {
            class: getSimplePaginationSelectClasses(),
            value: ctx.currentPageSize.value,
            'aria-label': labels.itemsPerPageText,
            onChange: (e: Event) =>
              ctx.handlePageSizeChange(Number((e.target as HTMLSelectElement).value))
          },
          normalizedPageSizeOptions.map((option) => {
            const value = typeof option === 'number' ? option : option.value
            const label =
              typeof option === 'number'
                ? `${formatIntlNumber(value, localeCode)} ${labels.itemsPerPageText}`
                : (option.label ??
                  `${formatIntlNumber(value, localeCode)} ${labels.itemsPerPageText}`)

            return h(
              'option',
              { value, key: value },
              paginationConfig.pageSizeText ? paginationConfig.pageSizeText(value) : label
            )
          })
        ),

      h('div', { class: getSimplePaginationButtonsWrapperClasses() }, [
        h(
          'button',
          {
            class: getSimplePaginationButtonClasses(!hasPrev),
            disabled: !hasPrev,
            'aria-label': finalPrevAriaLabel,
            onClick: () => ctx.handlePageChange(ctx.currentPage.value - 1)
          },
          finalPrevText
        ),

        h(
          'span',
          {
            class: getSimplePaginationPageIndicatorClasses(),
            'aria-label': finalPageIndicatorText
          },
          finalPageIndicatorText
        ),

        h(
          'button',
          {
            class: getSimplePaginationButtonClasses(!hasNext),
            disabled: !hasNext,
            'aria-label': finalNextAriaLabel,
            onClick: () => ctx.handlePageChange(ctx.currentPage.value + 1)
          },
          finalNextText
        )
      ])
    ])
  ])
}
