import { h, type VNodeChild } from 'vue'
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
import type { TableContext, TableInternalProps } from './types'

export interface RenderPaginationOptions {
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
  props: TableInternalProps,
  options: RenderPaginationOptions = {}
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

  const locale = options.disableI18n ? undefined : options.locale
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
    ? paginationConfig.pageIndicatorText(ctx.currentPage.value, totalPages)
    : labels
      ? `${formatPageAriaLabel(labels.pageAriaLabel, ctx.currentPage.value, localeCode)} / ${formatIntlNumber(totalPages, localeCode)} ${labels.pageText}`
      : formatDefaultPageIndicatorText(ctx.currentPage.value, totalPages)

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
            onChange: (e: Event) =>
              ctx.handlePageSizeChange(Number((e.target as HTMLSelectElement).value))
          },
          (paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map((size) =>
            h(
              'option',
              { value: size },
              paginationConfig.pageSizeText
                ? paginationConfig.pageSizeText(size)
                : labels
                  ? `${formatIntlNumber(size, localeCode)} ${labels.itemsPerPageText}`
                  : `${size} / page`
            )
          )
        ),

      h('div', { class: getSimplePaginationButtonsWrapperClasses() }, [
        h(
          'button',
          {
            class: getSimplePaginationButtonClasses(!hasPrev),
            disabled: !hasPrev,
            onClick: () => ctx.handlePageChange(ctx.currentPage.value - 1)
          },
          finalPrevText
        ),

        h('span', { class: getSimplePaginationPageIndicatorClasses() }, finalPageIndicatorText),

        h(
          'button',
          {
            class: getSimplePaginationButtonClasses(!hasNext),
            disabled: !hasNext,
            onClick: () => ctx.handlePageChange(ctx.currentPage.value + 1)
          },
          finalNextText
        )
      ])
    ])
  ])
}
