import { h, type VNodeChild } from 'vue'
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
import type { TableContext, TableInternalProps } from './types'

export function renderPagination(ctx: TableContext, props: TableInternalProps): VNodeChild {
  if (props.pagination === false || !ctx.paginationInfo.value) {
    return null
  }

  const { totalPages, startIndex, endIndex, hasNext, hasPrev } = ctx.paginationInfo.value
  const total = ctx.processedData.value.length
  const paginationConfig = props.pagination as PaginationConfig

  return h('div', { class: getSimplePaginationContainerClasses() }, [
    paginationConfig.showTotal !== false &&
      h(
        'div',
        { class: getSimplePaginationTotalClasses() },
        paginationConfig.totalText
          ? paginationConfig.totalText(total, [startIndex, endIndex])
          : `Showing ${startIndex} to ${endIndex} of ${total} results`
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
            h('option', { value: size }, `${size} / page`)
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
          'Previous'
        ),

        h(
          'span',
          { class: getSimplePaginationPageIndicatorClasses() },
          `Page ${ctx.currentPage.value} of ${totalPages}`
        ),

        h(
          'button',
          {
            class: getSimplePaginationButtonClasses(!hasNext),
            disabled: !hasNext,
            onClick: () => ctx.handlePageChange(ctx.currentPage.value + 1)
          },
          'Next'
        )
      ])
    ])
  ])
}
