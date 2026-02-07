export function resolveLocaleText(
  fallback: string,
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate
    }
  }

  return fallback
}

import type { TigerLocale, TigerLocalePagination, TigerLocaleFormWizard } from '../types/locale'

export function mergeTigerLocale(
  base?: Partial<TigerLocale>,
  override?: Partial<TigerLocale>
): Partial<TigerLocale> | undefined {
  if (!base && !override) return undefined

  return {
    common: { ...base?.common, ...override?.common },
    modal: { ...base?.modal, ...override?.modal },
    drawer: { ...base?.drawer, ...override?.drawer },
    upload: { ...base?.upload, ...override?.upload },
    pagination: { ...base?.pagination, ...override?.pagination },
    formWizard: { ...base?.formWizard, ...override?.formWizard }
  }
}

// ============================================================================
// Pagination Labels
// ============================================================================

/**
 * Default English pagination labels
 */
export const DEFAULT_PAGINATION_LABELS: Required<TigerLocalePagination> = {
  totalText: 'Total {total} items',
  itemsPerPageText: '/ page',
  jumpToText: 'Go to',
  pageText: 'page',
  prevPageAriaLabel: 'Previous page',
  nextPageAriaLabel: 'Next page',
  pageAriaLabel: 'Page {page}'
}

/**
 * Chinese (Simplified) pagination labels
 */
export const ZH_CN_PAGINATION_LABELS: Required<TigerLocalePagination> = {
  totalText: '共 {total} 条',
  itemsPerPageText: '条/页',
  jumpToText: '跳至',
  pageText: '页',
  prevPageAriaLabel: '上一页',
  nextPageAriaLabel: '下一页',
  pageAriaLabel: '第 {page} 页'
}

// ============================================================================
// FormWizard Labels
// ============================================================================

export const DEFAULT_FORM_WIZARD_LABELS: Required<TigerLocaleFormWizard> = {
  prevText: 'Previous',
  nextText: 'Next',
  finishText: 'Finish'
}

export const ZH_CN_FORM_WIZARD_LABELS: Required<TigerLocaleFormWizard> = {
  prevText: '上一步',
  nextText: '下一步',
  finishText: '完成'
}

export function getFormWizardLabels(
  locale?: Partial<TigerLocale>
): Required<TigerLocaleFormWizard> {
  return {
    prevText: locale?.formWizard?.prevText ?? DEFAULT_FORM_WIZARD_LABELS.prevText,
    nextText: locale?.formWizard?.nextText ?? DEFAULT_FORM_WIZARD_LABELS.nextText,
    finishText: locale?.formWizard?.finishText ?? DEFAULT_FORM_WIZARD_LABELS.finishText
  }
}

/**
 * Get resolved pagination labels with fallback to defaults
 *
 * @param locale - Optional locale configuration
 * @returns Resolved pagination labels
 */
export function getPaginationLabels(
  locale?: Partial<TigerLocale>
): Required<TigerLocalePagination> {
  return {
    totalText: locale?.pagination?.totalText ?? DEFAULT_PAGINATION_LABELS.totalText,
    itemsPerPageText:
      locale?.pagination?.itemsPerPageText ?? DEFAULT_PAGINATION_LABELS.itemsPerPageText,
    jumpToText: locale?.pagination?.jumpToText ?? DEFAULT_PAGINATION_LABELS.jumpToText,
    pageText: locale?.pagination?.pageText ?? DEFAULT_PAGINATION_LABELS.pageText,
    prevPageAriaLabel:
      locale?.pagination?.prevPageAriaLabel ?? DEFAULT_PAGINATION_LABELS.prevPageAriaLabel,
    nextPageAriaLabel:
      locale?.pagination?.nextPageAriaLabel ?? DEFAULT_PAGINATION_LABELS.nextPageAriaLabel,
    pageAriaLabel: locale?.pagination?.pageAriaLabel ?? DEFAULT_PAGINATION_LABELS.pageAriaLabel
  }
}

/**
 * Format pagination total text with variables
 *
 * @param template - Template string with {total}, {start}, {end} placeholders
 * @param total - Total item count
 * @param range - Current page range [start, end]
 * @returns Formatted string
 */
export function formatPaginationTotal(
  template: string,
  total: number,
  range: [number, number]
): string {
  return template
    .replace('{total}', String(total))
    .replace('{start}', String(range[0]))
    .replace('{end}', String(range[1]))
}

/**
 * Format pagination page aria-label
 *
 * @param template - Template string with {page} placeholder
 * @param page - Page number
 * @returns Formatted string
 */
export function formatPageAriaLabel(template: string, page: number): string {
  return template.replace('{page}', String(page))
}
