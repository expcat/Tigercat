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
  TigerLocaleTaskBoard
} from '../types/locale'

const TIGER_LOCALE_KEYS = [
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
  return {
    emptyColumnText:
      locale?.taskBoard?.emptyColumnText ?? DEFAULT_TASK_BOARD_LABELS.emptyColumnText,
    addCardText: locale?.taskBoard?.addCardText ?? DEFAULT_TASK_BOARD_LABELS.addCardText,
    wipLimitText: locale?.taskBoard?.wipLimitText ?? DEFAULT_TASK_BOARD_LABELS.wipLimitText,
    dragHintText: locale?.taskBoard?.dragHintText ?? DEFAULT_TASK_BOARD_LABELS.dragHintText,
    boardAriaLabel: locale?.taskBoard?.boardAriaLabel ?? DEFAULT_TASK_BOARD_LABELS.boardAriaLabel
  }
}
