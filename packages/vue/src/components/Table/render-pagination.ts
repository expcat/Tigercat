import { h, type VNodeChild } from 'vue'
import {
  formatPaginationPageIndicator,
  formatPaginationTotal,
  getBuiltInPaginationContainerClasses,
  getPaginationLabels,
  resolvePaginationDisplayMode,
  type TigerLocale,
  type TigerLocalePagination,
  type PaginationConfig,
  type PaginationPageSizeOptionItem
} from '@expcat/tigercat-core'
import { Pagination } from '../Pagination'
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

  const { totalPages } = ctx.paginationInfo.value
  const paginationConfig = props.pagination as PaginationConfig
  const total =
    paginationConfig.total !== undefined && paginationConfig.total > 0
      ? paginationConfig.total
      : ctx.processedData.value.length

  const locale = view?.disableI18n ? undefined : view?.locale
  const labels = getPaginationLabels(locale)
  const localeCode = locale?.locale

  // More than 3 pages: full page-number buttons plus quick jumper;
  // otherwise the simple prev/next indicator (config values override).
  const { simple, showQuickJumper } = resolvePaginationDisplayMode(totalPages, paginationConfig)

  const totalText =
    paginationConfig.totalText ??
    ((value: number, range: [number, number]) =>
      formatPaginationTotal(labels.totalText, value, range, localeCode))

  const pageIndicatorText =
    paginationConfig.pageIndicatorText ??
    ((current: number, pages: number) =>
      formatPaginationPageIndicator(labels.pageIndicatorText, current, pages, localeCode))

  // When i18n is disabled the Pagination component must not pick up the
  // ConfigProvider locale, so lock every label to the resolved defaults.
  const overrides: Partial<TigerLocalePagination> = view?.disableI18n ? { ...labels } : {}
  if (paginationConfig.prevText) overrides.prevPageAriaLabel = paginationConfig.prevText
  if (paginationConfig.nextText) overrides.nextPageAriaLabel = paginationConfig.nextText
  const labelsOverride = Object.keys(overrides).length > 0 ? overrides : undefined

  const pageSizeOptions = (paginationConfig.pageSizeOptions ?? [
    10, 20, 50, 100
  ]) as PaginationPageSizeOptionItem[]
  const pageSizeText = paginationConfig.pageSizeText
  const normalizedPageSizeOptions = pageSizeText
    ? pageSizeOptions.map((option) => {
        if (typeof option === 'number') {
          return { value: option, label: pageSizeText(option) }
        }
        return { value: option.value, label: option.label ?? pageSizeText(option.value) }
      })
    : pageSizeOptions

  return h('div', { class: getBuiltInPaginationContainerClasses() }, [
    h(Pagination, {
      size: 'small',
      align: 'right',
      current: ctx.currentPage.value,
      pageSize: ctx.currentPageSize.value,
      total,
      simple,
      showQuickJumper,
      showSizeChanger: paginationConfig.showSizeChanger !== false,
      showTotal: paginationConfig.showTotal !== false,
      totalText,
      pageIndicatorText,
      pageSizeOptions: normalizedPageSizeOptions,
      locale,
      labels: labelsOverride,
      onChange: (page: number) => ctx.handlePageChange(page),
      onPageSizeChange: (_page: number, pageSize: number) => ctx.handlePageSizeChange(pageSize)
    })
  ])
}
