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
  const labels = locale ? getPaginationLabels(locale) : undefined
  const localeCode = locale?.locale

  const isZh =
    !!localeCode?.startsWith('zh') ||
    locale?.formWizard?.prevText === '上一步' ||
    locale?.upload?.clickToUploadText === '点击上传'

  const defaultTotalText = (t: number, range: [number, number]) =>
    isZh
      ? `共 ${t} 条`
      : `Showing ${range[0]} to ${range[1]} of ${t} results`

  const defaultPrevText = isZh ? '上一页' : 'Previous'
  const defaultNextText = isZh ? '下一页' : 'Next'

  const defaultPageIndicatorText = (current: number, total: number) =>
    isZh ? `第 ${current} 页 / 共 ${total} 页` : `Page ${current} of ${total}`

  const defaultPageSizeText = (size: number) =>
    isZh ? `${size} 条/页` : `${size} / page`

  const finalTotalText = paginationConfig.totalText
    ? paginationConfig.totalText(total, [startIndex, endIndex])
    : labels
      ? formatPaginationTotal(labels.totalText, total, [startIndex, endIndex], localeCode)
      : defaultTotalText(total, [startIndex, endIndex])

  const finalPrevText = paginationConfig.prevText || labels?.prevPageAriaLabel || defaultPrevText
  const finalNextText = paginationConfig.nextText || labels?.nextPageAriaLabel || defaultNextText

  const finalPageIndicatorText = paginationConfig.pageIndicatorText
    ? paginationConfig.pageIndicatorText(ctx.currentPage.value, totalPages)
    : labels
      ? `${formatPageAriaLabel(labels.pageAriaLabel, ctx.currentPage.value, localeCode)} / ${formatIntlNumber(totalPages, localeCode)} ${labels.pageText}`
      : defaultPageIndicatorText(ctx.currentPage.value, totalPages)

  return h('div', { class: getSimplePaginationContainerClasses() }, [
    paginationConfig.showTotal !== false &&
      h(
        'div',
        { class: getSimplePaginationTotalClasses() },
        finalTotalText
      ),

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
            h('option', { value: size }, paginationConfig.pageSizeText
              ? paginationConfig.pageSizeText(size)
              : labels
                ? `${formatIntlNumber(size, localeCode)} ${labels.itemsPerPageText}`
                : defaultPageSizeText(size))
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

        h(
          'span',
          { class: getSimplePaginationPageIndicatorClasses() },
          finalPageIndicatorText
        ),

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
