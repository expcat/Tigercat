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

import type {
  TigerLocale,
  TigerLocaleInput,
  TigerLocaleLoader,
  TigerLocaleLazyModule,
  TigerLocalePagination,
  TigerLocaleFormWizard,
  TigerLocaleTaskBoard,
  TigerLocaleDirection
} from '../types/locale'

const TIGER_LOCALE_KEYS = [
  'locale',
  'direction',
  'common',
  'modal',
  'drawer',
  'upload',
  'pagination',
  'datePicker',
  'formWizard',
  'taskBoard'
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPromiseLike(value: unknown): value is PromiseLike<TigerLocaleLazyModule> {
  return isRecord(value) && typeof value.then === 'function'
}

function hasTigerLocaleShape(value: unknown): value is Partial<TigerLocale> {
  if (!isRecord(value)) return false
  return TIGER_LOCALE_KEYS.some((key) => key in value)
}

function resolveTigerLocaleModule(module: TigerLocaleLazyModule): Partial<TigerLocale> | undefined {
  if (!isRecord(module)) return undefined

  const moduleRecord = module as Record<string, unknown>
  const defaultExport = moduleRecord.default
  if (hasTigerLocaleShape(defaultExport)) return defaultExport

  for (const value of Object.values(moduleRecord)) {
    if (hasTigerLocaleShape(value)) return value
  }

  return module as Partial<TigerLocale>
}

export function isLazyTigerLocale(
  locale?: TigerLocaleInput
): locale is PromiseLike<TigerLocaleLazyModule> | TigerLocaleLoader {
  return typeof locale === 'function' || isPromiseLike(locale)
}

export function getImmediateTigerLocale(
  locale?: TigerLocaleInput
): Partial<TigerLocale> | undefined {
  if (!locale || isLazyTigerLocale(locale)) return undefined
  return locale
}

export async function resolveTigerLocale(
  locale?: TigerLocaleInput
): Promise<Partial<TigerLocale> | undefined> {
  if (!locale) return undefined

  const loaded =
    typeof locale === 'function' ? await locale() : isPromiseLike(locale) ? await locale : locale
  return resolveTigerLocaleModule(loaded)
}

export function mergeTigerLocale(
  base?: Partial<TigerLocale>,
  override?: Partial<TigerLocale>
): Partial<TigerLocale> | undefined {
  if (!base && !override) return undefined

  return {
    locale: override?.locale ?? base?.locale,
    direction: override?.direction ?? base?.direction,
    common: { ...base?.common, ...override?.common },
    modal: { ...base?.modal, ...override?.modal },
    drawer: { ...base?.drawer, ...override?.drawer },
    upload: { ...base?.upload, ...override?.upload },
    pagination: { ...base?.pagination, ...override?.pagination },
    datePicker: { ...base?.datePicker, ...override?.datePicker },
    formWizard: { ...base?.formWizard, ...override?.formWizard },
    taskBoard: { ...base?.taskBoard, ...override?.taskBoard }
  }
}

const RTL_LANGUAGE_CODES = new Set(['ar', 'fa', 'he', 'iw', 'ps', 'ur'])

export function isRtlLocale(locale?: string | Partial<TigerLocale>): boolean {
  if (!locale) return false
  if (typeof locale !== 'string') {
    if (locale.direction) return locale.direction === 'rtl'
    return isRtlLocale(locale.locale)
  }

  const language = locale.split('-')[0]?.toLowerCase()
  return RTL_LANGUAGE_CODES.has(language)
}

export function getLocaleDirection(locale?: string | Partial<TigerLocale>): TigerLocaleDirection {
  return isRtlLocale(locale) ? 'rtl' : 'ltr'
}

export function formatIntlNumber(value: number, locale?: string): string {
  if (!locale) return String(value)
  try {
    return new Intl.NumberFormat(locale).format(value)
  } catch {
    return String(value)
  }
}

export function getIntlPluralCategory(value: number, locale?: string): Intl.LDMLPluralRule {
  try {
    return new Intl.PluralRules(locale).select(value)
  } catch {
    return value === 1 ? 'one' : 'other'
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
  pageAriaLabel: 'Page {page}',
  pageIndicatorText: 'Page {current} of {total}'
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
  pageAriaLabel: '第 {page} 页',
  pageIndicatorText: '第 {current} 页，共 {total} 页'
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
  const isZh = locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_FORM_WIZARD_LABELS : DEFAULT_FORM_WIZARD_LABELS
  return {
    prevText: locale?.formWizard?.prevText ?? defaultLabels.prevText,
    nextText: locale?.formWizard?.nextText ?? defaultLabels.nextText,
    finishText: locale?.formWizard?.finishText ?? defaultLabels.finishText
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
  const isZh =
    !!locale?.locale?.startsWith('zh') ||
    locale?.formWizard?.prevText === '上一步' ||
    locale?.upload?.clickToUploadText === '点击上传'
  const defaultLabels = isZh ? ZH_CN_PAGINATION_LABELS : DEFAULT_PAGINATION_LABELS
  return {
    totalText: locale?.pagination?.totalText ?? defaultLabels.totalText,
    itemsPerPageText:
      locale?.pagination?.itemsPerPageText ?? defaultLabels.itemsPerPageText,
    jumpToText: locale?.pagination?.jumpToText ?? defaultLabels.jumpToText,
    pageText: locale?.pagination?.pageText ?? defaultLabels.pageText,
    prevPageAriaLabel:
      locale?.pagination?.prevPageAriaLabel ?? defaultLabels.prevPageAriaLabel,
    nextPageAriaLabel:
      locale?.pagination?.nextPageAriaLabel ?? defaultLabels.nextPageAriaLabel,
    pageAriaLabel: locale?.pagination?.pageAriaLabel ?? defaultLabels.pageAriaLabel,
    pageIndicatorText:
      locale?.pagination?.pageIndicatorText ?? defaultLabels.pageIndicatorText
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
  range: [number, number],
  locale?: string
): string {
  const category = getIntlPluralCategory(total, locale)

  return template
    .replace('{total}', formatIntlNumber(total, locale))
    .replace('{start}', formatIntlNumber(range[0], locale))
    .replace('{end}', formatIntlNumber(range[1], locale))
    .replace('{plural}', category)
}

/**
 * Format pagination page aria-label
 *
 * @param template - Template string with {page} placeholder
 * @param page - Page number
 * @returns Formatted string
 */
export function formatPageAriaLabel(template: string, page: number, locale?: string): string {
  return template.replace('{page}', formatIntlNumber(page, locale))
}

export function formatPaginationPageIndicator(
  template: string,
  current: number,
  total: number,
  locale?: string
): string {
  return template
    .replace('{current}', formatIntlNumber(current, locale))
    .replace('{total}', formatIntlNumber(total, locale))
}

// ============================================================================
// TaskBoard Labels
// ============================================================================

export const DEFAULT_TASK_BOARD_LABELS: Required<TigerLocaleTaskBoard> = {
  emptyColumnText: 'No tasks',
  addCardText: 'Add task',
  wipLimitText: 'WIP limit: {limit}',
  dragHintText: 'Drag to move',
  boardAriaLabel: 'Task Board'
}

export const ZH_CN_TASK_BOARD_LABELS: Required<TigerLocaleTaskBoard> = {
  emptyColumnText: '暂无任务',
  addCardText: '添加任务',
  wipLimitText: 'WIP 限制: {limit}',
  dragHintText: '拖拽以移动',
  boardAriaLabel: '任务看板'
}

export function getTaskBoardLabels(locale?: Partial<TigerLocale>): Required<TigerLocaleTaskBoard> {
  const isZh = locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_TASK_BOARD_LABELS : DEFAULT_TASK_BOARD_LABELS
  return {
    emptyColumnText:
      locale?.taskBoard?.emptyColumnText ?? defaultLabels.emptyColumnText,
    addCardText: locale?.taskBoard?.addCardText ?? defaultLabels.addCardText,
    wipLimitText: locale?.taskBoard?.wipLimitText ?? defaultLabels.wipLimitText,
    dragHintText: locale?.taskBoard?.dragHintText ?? defaultLabels.dragHintText,
    boardAriaLabel: locale?.taskBoard?.boardAriaLabel ?? defaultLabels.boardAriaLabel
  }
}
