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
  TigerLocaleTable,
  TigerLocaleFormWizard,
  TigerLocaleTour,
  TigerLocaleCalendar,
  TigerLocaleFileManager,
  TigerLocaleImageViewer,
  TigerLocaleImageEditor,
  TigerLocaleStatus,
  TigerLocaleTaskBoard,
  TigerLocaleSelect,
  TigerLocaleTabs,
  TigerLocaleRate,
  TigerLocaleCarousel,
  TigerLocaleTransfer,
  TigerLocaleChart,
  TigerLocaleMarkdownEditor,
  TigerLocaleRichTextEditor,
  TigerLocaleCronEditor,
  TigerLocaleFormValidation,
  TigerLocaleDirection
} from '../types/locale'
import type { TimePickerLabels } from '../types/timepicker'
import type { UploadLabels } from '../types/upload'

const TIGER_LOCALE_KEYS = [
  'locale',
  'direction',
  'common',
  'empty',
  'modal',
  'drawer',
  'qrcode',
  'timeline',
  'upload',
  'pagination',
  'table',
  'datePicker',
  'timePicker',
  'formWizard',
  'tour',
  'calendar',
  'fileManager',
  'imageViewer',
  'imageEditor',
  'status',
  'taskBoard',
  'select',
  'tabs',
  'rate',
  'carousel',
  'transfer',
  'chart',
  'markdownEditor',
  'richTextEditor',
  'cronEditor',
  'formValidation'
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
    empty: { ...base?.empty, ...override?.empty },
    modal: { ...base?.modal, ...override?.modal },
    drawer: { ...base?.drawer, ...override?.drawer },
    qrcode: { ...base?.qrcode, ...override?.qrcode },
    timeline: { ...base?.timeline, ...override?.timeline },
    upload: { ...base?.upload, ...override?.upload },
    pagination: { ...base?.pagination, ...override?.pagination },
    table: { ...base?.table, ...override?.table },
    datePicker: { ...base?.datePicker, ...override?.datePicker },
    timePicker: { ...base?.timePicker, ...override?.timePicker },
    formWizard: { ...base?.formWizard, ...override?.formWizard },
    tour: { ...base?.tour, ...override?.tour },
    calendar: { ...base?.calendar, ...override?.calendar },
    fileManager: { ...base?.fileManager, ...override?.fileManager },
    imageViewer: { ...base?.imageViewer, ...override?.imageViewer },
    imageEditor: { ...base?.imageEditor, ...override?.imageEditor },
    status: { ...base?.status, ...override?.status },
    taskBoard: { ...base?.taskBoard, ...override?.taskBoard },
    select: { ...base?.select, ...override?.select },
    tabs: { ...base?.tabs, ...override?.tabs },
    rate: { ...base?.rate, ...override?.rate },
    carousel: { ...base?.carousel, ...override?.carousel },
    transfer: { ...base?.transfer, ...override?.transfer },
    chart: { ...base?.chart, ...override?.chart },
    markdownEditor: { ...base?.markdownEditor, ...override?.markdownEditor },
    richTextEditor: { ...base?.richTextEditor, ...override?.richTextEditor },
    cronEditor: { ...base?.cronEditor, ...override?.cronEditor },
    formValidation: { ...base?.formValidation, ...override?.formValidation }
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

export const DEFAULT_TOUR_LABELS: Required<TigerLocaleTour> = {
  prevText: 'Previous',
  nextText: 'Next',
  finishText: 'Finish',
  closeAriaLabel: 'Close tour'
}

export const ZH_CN_TOUR_LABELS: Required<TigerLocaleTour> = {
  prevText: '上一步',
  nextText: '下一步',
  finishText: '完成',
  closeAriaLabel: '关闭导览'
}

export function getTourLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTour>
): Required<TigerLocaleTour> {
  const isZh = locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_TOUR_LABELS : DEFAULT_TOUR_LABELS
  return {
    prevText:
      overrides?.prevText ??
      locale?.tour?.prevText ??
      locale?.formWizard?.prevText ??
      defaultLabels.prevText,
    nextText:
      overrides?.nextText ??
      locale?.tour?.nextText ??
      locale?.formWizard?.nextText ??
      defaultLabels.nextText,
    finishText:
      overrides?.finishText ??
      locale?.tour?.finishText ??
      locale?.formWizard?.finishText ??
      defaultLabels.finishText,
    closeAriaLabel:
      overrides?.closeAriaLabel ??
      locale?.tour?.closeAriaLabel ??
      locale?.common?.closeText ??
      defaultLabels.closeAriaLabel
  }
}

export const DEFAULT_CALENDAR_LABELS: Required<TigerLocaleCalendar> = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  yearSelectAriaLabel: 'Year',
  monthSelectAriaLabel: 'Month',
  daySelectAriaLabel: 'Day'
}

export const ZH_CN_CALENDAR_LABELS: Required<TigerLocaleCalendar> = {
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  yearSelectAriaLabel: '年份',
  monthSelectAriaLabel: '月份',
  daySelectAriaLabel: '日期'
}

export function getCalendarLabels(locale?: Partial<TigerLocale>): Required<TigerLocaleCalendar> {
  const isZh = locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_CALENDAR_LABELS : DEFAULT_CALENDAR_LABELS
  return {
    previousMonth: locale?.calendar?.previousMonth ?? defaultLabels.previousMonth,
    nextMonth: locale?.calendar?.nextMonth ?? defaultLabels.nextMonth,
    previousYear: locale?.calendar?.previousYear ?? defaultLabels.previousYear,
    nextYear: locale?.calendar?.nextYear ?? defaultLabels.nextYear,
    yearSelectAriaLabel: locale?.calendar?.yearSelectAriaLabel ?? defaultLabels.yearSelectAriaLabel,
    monthSelectAriaLabel:
      locale?.calendar?.monthSelectAriaLabel ?? defaultLabels.monthSelectAriaLabel,
    daySelectAriaLabel: locale?.calendar?.daySelectAriaLabel ?? defaultLabels.daySelectAriaLabel
  }
}

export function getFormWizardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFormWizard>
): Required<TigerLocaleFormWizard> {
  const isZh = locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_FORM_WIZARD_LABELS : DEFAULT_FORM_WIZARD_LABELS
  return {
    prevText: overrides?.prevText ?? locale?.formWizard?.prevText ?? defaultLabels.prevText,
    nextText: overrides?.nextText ?? locale?.formWizard?.nextText ?? defaultLabels.nextText,
    finishText: overrides?.finishText ?? locale?.formWizard?.finishText ?? defaultLabels.finishText
  }
}

/**
 * Get resolved pagination labels with fallback to defaults
 *
 * @param locale - Optional locale configuration
 * @returns Resolved pagination labels
 */
export function getPaginationLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocalePagination>
): Required<TigerLocalePagination> {
  const isZh =
    !!locale?.locale?.startsWith('zh') ||
    locale?.formWizard?.prevText === '上一步' ||
    locale?.upload?.clickToUploadText === '点击上传'
  const defaultLabels = isZh ? ZH_CN_PAGINATION_LABELS : DEFAULT_PAGINATION_LABELS
  return {
    totalText: overrides?.totalText ?? locale?.pagination?.totalText ?? defaultLabels.totalText,
    itemsPerPageText:
      overrides?.itemsPerPageText ??
      locale?.pagination?.itemsPerPageText ??
      defaultLabels.itemsPerPageText,
    jumpToText: overrides?.jumpToText ?? locale?.pagination?.jumpToText ?? defaultLabels.jumpToText,
    pageText: overrides?.pageText ?? locale?.pagination?.pageText ?? defaultLabels.pageText,
    prevPageAriaLabel:
      overrides?.prevPageAriaLabel ??
      locale?.pagination?.prevPageAriaLabel ??
      defaultLabels.prevPageAriaLabel,
    nextPageAriaLabel:
      overrides?.nextPageAriaLabel ??
      locale?.pagination?.nextPageAriaLabel ??
      defaultLabels.nextPageAriaLabel,
    pageAriaLabel:
      overrides?.pageAriaLabel ?? locale?.pagination?.pageAriaLabel ?? defaultLabels.pageAriaLabel,
    pageIndicatorText:
      overrides?.pageIndicatorText ??
      locale?.pagination?.pageIndicatorText ??
      defaultLabels.pageIndicatorText
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
// Table Labels
// ============================================================================

export const DEFAULT_TABLE_LABELS: Required<TigerLocaleTable> = {
  emptyText: 'No data',
  loadingText: 'Loading',
  expandText: 'Expand',
  collapseText: 'Collapse',
  selectAllText: 'Select all',
  selectRowAriaLabel: 'Select row {row}',
  sortByText: 'Sort by {column}',
  clearSortText: 'Clear sort',
  toolbarAriaLabel: 'Data table toolbar',
  searchPlaceholder: 'Search',
  searchButtonText: 'Search',
  selectedText: 'Selected',
  selectedItemsText: 'items',
  columnSettingsText: 'Column settings',
  columnSettingsAriaLabel: 'Column settings',
  lockColumnAriaLabel: 'Lock column {column}',
  unlockColumnAriaLabel: 'Unlock column {column}',
  allText: 'All',
  filterPlaceholder: 'Filter...',
  exportCsvText: 'Export CSV',
  exportExcelText: 'Export Excel',
  exportCsvAriaLabel: 'Export to CSV',
  exportExcelAriaLabel: 'Export to Excel',
  expandRowAriaLabel: 'Expand row',
  collapseRowAriaLabel: 'Collapse row'
}

export const ZH_CN_TABLE_LABELS: Required<TigerLocaleTable> = {
  emptyText: '暂无数据',
  loadingText: '加载中',
  expandText: '展开',
  collapseText: '收起',
  selectAllText: '全选',
  selectRowAriaLabel: '选择第 {row} 行',
  sortByText: '按 {column} 排序',
  clearSortText: '不排序',
  toolbarAriaLabel: '数据表格工具栏',
  searchPlaceholder: '搜索',
  searchButtonText: '搜索',
  selectedText: '已选择',
  selectedItemsText: '项',
  columnSettingsText: '列设置',
  columnSettingsAriaLabel: '列设置',
  lockColumnAriaLabel: '锁定{column}列',
  unlockColumnAriaLabel: '取消锁定{column}列',
  allText: '全部',
  filterPlaceholder: '筛选...',
  exportCsvText: '导出 CSV',
  exportExcelText: '导出 Excel',
  exportCsvAriaLabel: '导出为 CSV',
  exportExcelAriaLabel: '导出为 Excel',
  expandRowAriaLabel: '展开行',
  collapseRowAriaLabel: '收起行'
}

export function getTableLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTable>
): Required<TigerLocaleTable> {
  const isZh =
    !!locale?.locale?.startsWith('zh') ||
    locale?.common?.emptyText === '暂无数据' ||
    locale?.table?.searchButtonText === '搜索'
  const defaultLabels = isZh ? ZH_CN_TABLE_LABELS : DEFAULT_TABLE_LABELS

  return {
    emptyText: overrides?.emptyText ?? locale?.table?.emptyText ?? defaultLabels.emptyText,
    loadingText: overrides?.loadingText ?? locale?.table?.loadingText ?? defaultLabels.loadingText,
    expandText: overrides?.expandText ?? locale?.table?.expandText ?? defaultLabels.expandText,
    collapseText:
      overrides?.collapseText ?? locale?.table?.collapseText ?? defaultLabels.collapseText,
    selectAllText:
      overrides?.selectAllText ?? locale?.table?.selectAllText ?? defaultLabels.selectAllText,
    selectRowAriaLabel:
      overrides?.selectRowAriaLabel ??
      locale?.table?.selectRowAriaLabel ??
      defaultLabels.selectRowAriaLabel,
    sortByText: overrides?.sortByText ?? locale?.table?.sortByText ?? defaultLabels.sortByText,
    clearSortText:
      overrides?.clearSortText ?? locale?.table?.clearSortText ?? defaultLabels.clearSortText,
    toolbarAriaLabel:
      overrides?.toolbarAriaLabel ??
      locale?.table?.toolbarAriaLabel ??
      defaultLabels.toolbarAriaLabel,
    searchPlaceholder:
      overrides?.searchPlaceholder ??
      locale?.table?.searchPlaceholder ??
      defaultLabels.searchPlaceholder,
    searchButtonText:
      overrides?.searchButtonText ??
      locale?.table?.searchButtonText ??
      defaultLabels.searchButtonText,
    selectedText:
      overrides?.selectedText ?? locale?.table?.selectedText ?? defaultLabels.selectedText,
    selectedItemsText:
      overrides?.selectedItemsText ??
      locale?.table?.selectedItemsText ??
      defaultLabels.selectedItemsText,
    columnSettingsText:
      overrides?.columnSettingsText ??
      locale?.table?.columnSettingsText ??
      defaultLabels.columnSettingsText,
    columnSettingsAriaLabel:
      overrides?.columnSettingsAriaLabel ??
      locale?.table?.columnSettingsAriaLabel ??
      defaultLabels.columnSettingsAriaLabel,
    lockColumnAriaLabel:
      overrides?.lockColumnAriaLabel ??
      locale?.table?.lockColumnAriaLabel ??
      defaultLabels.lockColumnAriaLabel,
    unlockColumnAriaLabel:
      overrides?.unlockColumnAriaLabel ??
      locale?.table?.unlockColumnAriaLabel ??
      defaultLabels.unlockColumnAriaLabel,
    allText: overrides?.allText ?? locale?.table?.allText ?? defaultLabels.allText,
    filterPlaceholder:
      overrides?.filterPlaceholder ??
      locale?.table?.filterPlaceholder ??
      defaultLabels.filterPlaceholder,
    exportCsvText:
      overrides?.exportCsvText ?? locale?.table?.exportCsvText ?? defaultLabels.exportCsvText,
    exportExcelText:
      overrides?.exportExcelText ?? locale?.table?.exportExcelText ?? defaultLabels.exportExcelText,
    exportCsvAriaLabel:
      overrides?.exportCsvAriaLabel ??
      locale?.table?.exportCsvAriaLabel ??
      defaultLabels.exportCsvAriaLabel,
    exportExcelAriaLabel:
      overrides?.exportExcelAriaLabel ??
      locale?.table?.exportExcelAriaLabel ??
      defaultLabels.exportExcelAriaLabel,
    expandRowAriaLabel:
      overrides?.expandRowAriaLabel ??
      locale?.table?.expandRowAriaLabel ??
      defaultLabels.expandRowAriaLabel,
    collapseRowAriaLabel:
      overrides?.collapseRowAriaLabel ??
      locale?.table?.collapseRowAriaLabel ??
      defaultLabels.collapseRowAriaLabel
  }
}

export function formatTableSelectRowAriaLabel(
  template: string,
  row: number,
  locale?: string
): string {
  return template.replace('{row}', formatIntlNumber(row, locale))
}

export function formatTableSortByText(template: string, column: string): string {
  return template.replace('{column}', column)
}

// ============================================================================
// TaskBoard Labels
// ============================================================================

export const DEFAULT_TASK_BOARD_LABELS: Required<TigerLocaleTaskBoard> = {
  emptyColumnText: 'No tasks',
  addCardText: 'Add task',
  addColumnText: 'Add column',
  wipLimitText: 'WIP limit: {limit}',
  dragHintText: 'Drag to move',
  boardAriaLabel: 'Task Board'
}

export const ZH_CN_TASK_BOARD_LABELS: Required<TigerLocaleTaskBoard> = {
  emptyColumnText: '暂无任务',
  addCardText: '添加任务',
  addColumnText: '添加列',
  wipLimitText: 'WIP 限制: {limit}',
  dragHintText: '拖拽以移动',
  boardAriaLabel: '任务看板'
}

export function getTaskBoardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTaskBoard>
): Required<TigerLocaleTaskBoard> {
  const isZh = locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_TASK_BOARD_LABELS : DEFAULT_TASK_BOARD_LABELS
  return {
    emptyColumnText:
      overrides?.emptyColumnText ??
      locale?.taskBoard?.emptyColumnText ??
      defaultLabels.emptyColumnText,
    addCardText:
      overrides?.addCardText ?? locale?.taskBoard?.addCardText ?? defaultLabels.addCardText,
    addColumnText:
      overrides?.addColumnText ?? locale?.taskBoard?.addColumnText ?? defaultLabels.addColumnText,
    wipLimitText:
      overrides?.wipLimitText ?? locale?.taskBoard?.wipLimitText ?? defaultLabels.wipLimitText,
    dragHintText:
      overrides?.dragHintText ?? locale?.taskBoard?.dragHintText ?? defaultLabels.dragHintText,
    boardAriaLabel:
      overrides?.boardAriaLabel ?? locale?.taskBoard?.boardAriaLabel ?? defaultLabels.boardAriaLabel
  }
}

export const DEFAULT_SELECT_LABELS: Required<TigerLocaleSelect> = {
  doneText: 'Done'
}

export const ZH_CN_SELECT_LABELS: Required<TigerLocaleSelect> = {
  doneText: '完成'
}

export function getSelectLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSelect>
): Required<TigerLocaleSelect> {
  const isZh = !!locale?.locale?.startsWith('zh') || locale?.formWizard?.finishText === '完成'
  const defaultLabels = isZh ? ZH_CN_SELECT_LABELS : DEFAULT_SELECT_LABELS
  return {
    doneText:
      overrides?.doneText ??
      locale?.select?.doneText ??
      locale?.common?.okText ??
      defaultLabels.doneText
  }
}

export const DEFAULT_TABS_LABELS: Required<TigerLocaleTabs> = {
  addTabAriaLabel: 'Add tab',
  closeTabAriaLabel: 'Close {label}'
}

export const ZH_CN_TABS_LABELS: Required<TigerLocaleTabs> = {
  addTabAriaLabel: '新增标签页',
  closeTabAriaLabel: '关闭{label}'
}

export function getTabsLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTabs>
): Required<TigerLocaleTabs> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_TABS_LABELS
    : DEFAULT_TABS_LABELS
  return {
    addTabAriaLabel:
      overrides?.addTabAriaLabel ?? locale?.tabs?.addTabAriaLabel ?? defaultLabels.addTabAriaLabel,
    closeTabAriaLabel:
      overrides?.closeTabAriaLabel ??
      locale?.tabs?.closeTabAriaLabel ??
      defaultLabels.closeTabAriaLabel
  }
}

export const DEFAULT_RATE_LABELS: Required<TigerLocaleRate> = {
  ariaLabel: 'Rating',
  valueText: '{value} star{plural}'
}

export const ZH_CN_RATE_LABELS: Required<TigerLocaleRate> = {
  ariaLabel: '评分',
  valueText: '{value} 星'
}

export function getRateLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleRate>
): Required<TigerLocaleRate> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_RATE_LABELS
    : DEFAULT_RATE_LABELS
  return {
    ariaLabel: overrides?.ariaLabel ?? locale?.rate?.ariaLabel ?? defaultLabels.ariaLabel,
    valueText: overrides?.valueText ?? locale?.rate?.valueText ?? defaultLabels.valueText
  }
}

export const DEFAULT_CAROUSEL_LABELS: Required<TigerLocaleCarousel> = {
  ariaLabel: 'Image carousel',
  navigationAriaLabel: 'Carousel navigation',
  previousSlideAriaLabel: 'Previous slide',
  nextSlideAriaLabel: 'Next slide',
  goToSlideAriaLabel: 'Go to slide {index}',
  slideAriaLabel: 'Slide {index} of {total}'
}

export const ZH_CN_CAROUSEL_LABELS: Required<TigerLocaleCarousel> = {
  ariaLabel: '图片轮播',
  navigationAriaLabel: '轮播导航',
  previousSlideAriaLabel: '上一张',
  nextSlideAriaLabel: '下一张',
  goToSlideAriaLabel: '跳转到第 {index} 张',
  slideAriaLabel: '第 {index} 张，共 {total} 张'
}

export function getCarouselLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCarousel>
): Required<TigerLocaleCarousel> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_CAROUSEL_LABELS
    : DEFAULT_CAROUSEL_LABELS
  return {
    ariaLabel: overrides?.ariaLabel ?? locale?.carousel?.ariaLabel ?? defaultLabels.ariaLabel,
    navigationAriaLabel:
      overrides?.navigationAriaLabel ??
      locale?.carousel?.navigationAriaLabel ??
      defaultLabels.navigationAriaLabel,
    previousSlideAriaLabel:
      overrides?.previousSlideAriaLabel ??
      locale?.carousel?.previousSlideAriaLabel ??
      defaultLabels.previousSlideAriaLabel,
    nextSlideAriaLabel:
      overrides?.nextSlideAriaLabel ??
      locale?.carousel?.nextSlideAriaLabel ??
      defaultLabels.nextSlideAriaLabel,
    goToSlideAriaLabel:
      overrides?.goToSlideAriaLabel ??
      locale?.carousel?.goToSlideAriaLabel ??
      defaultLabels.goToSlideAriaLabel,
    slideAriaLabel:
      overrides?.slideAriaLabel ?? locale?.carousel?.slideAriaLabel ?? defaultLabels.slideAriaLabel
  }
}

export const DEFAULT_TRANSFER_LABELS: Required<TigerLocaleTransfer> = {
  sourceTitle: 'Source',
  targetTitle: 'Target',
  searchAriaLabel: 'Search {title}',
  itemsAriaLabel: '{title} items',
  moveToTargetAriaLabel: 'Move selected to target',
  moveToSourceAriaLabel: 'Move selected to source'
}

export const ZH_CN_TRANSFER_LABELS: Required<TigerLocaleTransfer> = {
  sourceTitle: '源列表',
  targetTitle: '目标列表',
  searchAriaLabel: '搜索{title}',
  itemsAriaLabel: '{title}项目',
  moveToTargetAriaLabel: '移动选中项到目标列表',
  moveToSourceAriaLabel: '移动选中项到源列表'
}

export function getTransferLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTransfer>
): Required<TigerLocaleTransfer> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_TRANSFER_LABELS
    : DEFAULT_TRANSFER_LABELS
  return {
    sourceTitle:
      overrides?.sourceTitle ?? locale?.transfer?.sourceTitle ?? defaultLabels.sourceTitle,
    targetTitle:
      overrides?.targetTitle ?? locale?.transfer?.targetTitle ?? defaultLabels.targetTitle,
    searchAriaLabel:
      overrides?.searchAriaLabel ??
      locale?.transfer?.searchAriaLabel ??
      defaultLabels.searchAriaLabel,
    itemsAriaLabel:
      overrides?.itemsAriaLabel ?? locale?.transfer?.itemsAriaLabel ?? defaultLabels.itemsAriaLabel,
    moveToTargetAriaLabel:
      overrides?.moveToTargetAriaLabel ??
      locale?.transfer?.moveToTargetAriaLabel ??
      defaultLabels.moveToTargetAriaLabel,
    moveToSourceAriaLabel:
      overrides?.moveToSourceAriaLabel ??
      locale?.transfer?.moveToSourceAriaLabel ??
      defaultLabels.moveToSourceAriaLabel
  }
}

export const DEFAULT_CHART_LABELS: Required<TigerLocaleChart> = {
  legendAriaLabel: 'Chart legend',
  pointAriaLabel: 'Point {index}: ({x}, {y})'
}

export const ZH_CN_CHART_LABELS: Required<TigerLocaleChart> = {
  legendAriaLabel: '图表图例',
  pointAriaLabel: '第 {index} 个点：({x}, {y})'
}

export function getChartLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleChart>
): Required<TigerLocaleChart> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_CHART_LABELS
    : DEFAULT_CHART_LABELS
  return {
    legendAriaLabel:
      overrides?.legendAriaLabel ?? locale?.chart?.legendAriaLabel ?? defaultLabels.legendAriaLabel,
    pointAriaLabel:
      overrides?.pointAriaLabel ?? locale?.chart?.pointAriaLabel ?? defaultLabels.pointAriaLabel
  }
}

export const DEFAULT_MARKDOWN_EDITOR_LABELS: Required<TigerLocaleMarkdownEditor> = {
  formattingToolbarAriaLabel: 'Markdown formatting',
  modeToolbarAriaLabel: 'Markdown view mode',
  editorAriaLabel: 'Markdown editor',
  previewAriaLabel: 'Markdown preview',
  editModeLabel: 'Edit',
  splitModeLabel: 'Split',
  previewModeLabel: 'Preview'
}

export const ZH_CN_MARKDOWN_EDITOR_LABELS: Required<TigerLocaleMarkdownEditor> = {
  formattingToolbarAriaLabel: 'Markdown 格式工具栏',
  modeToolbarAriaLabel: 'Markdown 视图模式',
  editorAriaLabel: 'Markdown 编辑器',
  previewAriaLabel: 'Markdown 预览',
  editModeLabel: '编辑',
  splitModeLabel: '分栏',
  previewModeLabel: '预览'
}

export function getMarkdownEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleMarkdownEditor>
): Required<TigerLocaleMarkdownEditor> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_MARKDOWN_EDITOR_LABELS
    : DEFAULT_MARKDOWN_EDITOR_LABELS
  return {
    formattingToolbarAriaLabel:
      overrides?.formattingToolbarAriaLabel ??
      locale?.markdownEditor?.formattingToolbarAriaLabel ??
      defaultLabels.formattingToolbarAriaLabel,
    modeToolbarAriaLabel:
      overrides?.modeToolbarAriaLabel ??
      locale?.markdownEditor?.modeToolbarAriaLabel ??
      defaultLabels.modeToolbarAriaLabel,
    editorAriaLabel:
      overrides?.editorAriaLabel ??
      locale?.markdownEditor?.editorAriaLabel ??
      defaultLabels.editorAriaLabel,
    previewAriaLabel:
      overrides?.previewAriaLabel ??
      locale?.markdownEditor?.previewAriaLabel ??
      defaultLabels.previewAriaLabel,
    editModeLabel:
      overrides?.editModeLabel ??
      locale?.markdownEditor?.editModeLabel ??
      defaultLabels.editModeLabel,
    splitModeLabel:
      overrides?.splitModeLabel ??
      locale?.markdownEditor?.splitModeLabel ??
      defaultLabels.splitModeLabel,
    previewModeLabel:
      overrides?.previewModeLabel ??
      locale?.markdownEditor?.previewModeLabel ??
      defaultLabels.previewModeLabel
  }
}

export const DEFAULT_RICH_TEXT_EDITOR_LABELS: Required<TigerLocaleRichTextEditor> = {
  formattingToolbarAriaLabel: 'Text formatting',
  editorAriaLabel: 'Rich text editor'
}

export const ZH_CN_RICH_TEXT_EDITOR_LABELS: Required<TigerLocaleRichTextEditor> = {
  formattingToolbarAriaLabel: '富文本格式工具栏',
  editorAriaLabel: '富文本编辑器'
}

export function getRichTextEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleRichTextEditor>
): Required<TigerLocaleRichTextEditor> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_RICH_TEXT_EDITOR_LABELS
    : DEFAULT_RICH_TEXT_EDITOR_LABELS
  return {
    formattingToolbarAriaLabel:
      overrides?.formattingToolbarAriaLabel ??
      locale?.richTextEditor?.formattingToolbarAriaLabel ??
      defaultLabels.formattingToolbarAriaLabel,
    editorAriaLabel:
      overrides?.editorAriaLabel ??
      locale?.richTextEditor?.editorAriaLabel ??
      defaultLabels.editorAriaLabel
  }
}

export const DEFAULT_CRON_EDITOR_LABELS: Required<TigerLocaleCronEditor> = {
  ariaLabel: 'Cron editor',
  expressionAriaLabel: 'Cron expression',
  presetAriaLabel: 'Cron preset',
  presetPlaceholder: 'Preset',
  everyMinutePreset: 'Every minute',
  hourlyPreset: 'Hourly',
  dailyPreset: 'Daily',
  weeklyPreset: 'Weekly',
  monthlyPreset: 'Monthly',
  minuteLabel: 'Minute',
  hourLabel: 'Hour',
  dayOfMonthLabel: 'Day',
  monthLabel: 'Month',
  dayOfWeekLabel: 'Weekday',
  modeAnyLabel: 'Any',
  modeEveryLabel: 'Every',
  modeSpecificLabel: 'Specific',
  modeRangeLabel: 'Range',
  modeCustomLabel: 'Custom',
  modeAriaLabel: '{field} mode',
  stepAriaLabel: '{field} step',
  valueAriaLabel: '{field} value',
  rangeStartAriaLabel: '{field} range start',
  rangeEndAriaLabel: '{field} range end',
  customValueAriaLabel: '{field} custom value',
  expressionFieldsError: 'Cron expression must contain 5 fields',
  fieldRequiredError: '{field} is required',
  invalidStepError: '{field} has an invalid step expression',
  stepRangeError: '{field} step must be between 1 and {max}',
  fieldRangeError: '{field} must be between {min} and {max}',
  rangeOrderError: '{field} range start must be less than or equal to end',
  invalidFieldError: '{field} must be *, a number, a range, a step, or a comma list'
}

export const ZH_CN_CRON_EDITOR_LABELS: Required<TigerLocaleCronEditor> = {
  ariaLabel: 'Cron 表达式编辑器',
  expressionAriaLabel: 'Cron 表达式',
  presetAriaLabel: 'Cron 预设',
  presetPlaceholder: '选择预设',
  everyMinutePreset: '每分钟',
  hourlyPreset: '每小时',
  dailyPreset: '每天',
  weeklyPreset: '每周',
  monthlyPreset: '每月',
  minuteLabel: '分钟',
  hourLabel: '小时',
  dayOfMonthLabel: '日期',
  monthLabel: '月份',
  dayOfWeekLabel: '星期',
  modeAnyLabel: '任意',
  modeEveryLabel: '每隔',
  modeSpecificLabel: '指定',
  modeRangeLabel: '范围',
  modeCustomLabel: '自定义',
  modeAriaLabel: '{field}模式',
  stepAriaLabel: '{field}步长',
  valueAriaLabel: '{field}值',
  rangeStartAriaLabel: '{field}范围开始',
  rangeEndAriaLabel: '{field}范围结束',
  customValueAriaLabel: '{field}自定义值',
  expressionFieldsError: 'Cron 表达式必须包含 5 个字段',
  fieldRequiredError: '{field}为必填项',
  invalidStepError: '{field}步长表达式无效',
  stepRangeError: '{field}步长必须在 1 到 {max} 之间',
  fieldRangeError: '{field}必须在 {min} 到 {max} 之间',
  rangeOrderError: '{field}范围开始值必须小于或等于结束值',
  invalidFieldError: '{field}必须是 *、数字、范围、步长或逗号列表'
}

export function getCronEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCronEditor>
): Required<TigerLocaleCronEditor> {
  const defaultLabels = locale?.locale?.toLowerCase().startsWith('zh')
    ? ZH_CN_CRON_EDITOR_LABELS
    : DEFAULT_CRON_EDITOR_LABELS
  return {
    ariaLabel: overrides?.ariaLabel ?? locale?.cronEditor?.ariaLabel ?? defaultLabels.ariaLabel,
    expressionAriaLabel:
      overrides?.expressionAriaLabel ??
      locale?.cronEditor?.expressionAriaLabel ??
      defaultLabels.expressionAriaLabel,
    presetAriaLabel:
      overrides?.presetAriaLabel ??
      locale?.cronEditor?.presetAriaLabel ??
      defaultLabels.presetAriaLabel,
    presetPlaceholder:
      overrides?.presetPlaceholder ??
      locale?.cronEditor?.presetPlaceholder ??
      defaultLabels.presetPlaceholder,
    everyMinutePreset:
      overrides?.everyMinutePreset ??
      locale?.cronEditor?.everyMinutePreset ??
      defaultLabels.everyMinutePreset,
    hourlyPreset:
      overrides?.hourlyPreset ?? locale?.cronEditor?.hourlyPreset ?? defaultLabels.hourlyPreset,
    dailyPreset:
      overrides?.dailyPreset ?? locale?.cronEditor?.dailyPreset ?? defaultLabels.dailyPreset,
    weeklyPreset:
      overrides?.weeklyPreset ?? locale?.cronEditor?.weeklyPreset ?? defaultLabels.weeklyPreset,
    monthlyPreset:
      overrides?.monthlyPreset ?? locale?.cronEditor?.monthlyPreset ?? defaultLabels.monthlyPreset,
    minuteLabel:
      overrides?.minuteLabel ?? locale?.cronEditor?.minuteLabel ?? defaultLabels.minuteLabel,
    hourLabel: overrides?.hourLabel ?? locale?.cronEditor?.hourLabel ?? defaultLabels.hourLabel,
    dayOfMonthLabel:
      overrides?.dayOfMonthLabel ??
      locale?.cronEditor?.dayOfMonthLabel ??
      defaultLabels.dayOfMonthLabel,
    monthLabel: overrides?.monthLabel ?? locale?.cronEditor?.monthLabel ?? defaultLabels.monthLabel,
    dayOfWeekLabel:
      overrides?.dayOfWeekLabel ??
      locale?.cronEditor?.dayOfWeekLabel ??
      defaultLabels.dayOfWeekLabel,
    modeAnyLabel:
      overrides?.modeAnyLabel ?? locale?.cronEditor?.modeAnyLabel ?? defaultLabels.modeAnyLabel,
    modeEveryLabel:
      overrides?.modeEveryLabel ??
      locale?.cronEditor?.modeEveryLabel ??
      defaultLabels.modeEveryLabel,
    modeSpecificLabel:
      overrides?.modeSpecificLabel ??
      locale?.cronEditor?.modeSpecificLabel ??
      defaultLabels.modeSpecificLabel,
    modeRangeLabel:
      overrides?.modeRangeLabel ??
      locale?.cronEditor?.modeRangeLabel ??
      defaultLabels.modeRangeLabel,
    modeCustomLabel:
      overrides?.modeCustomLabel ??
      locale?.cronEditor?.modeCustomLabel ??
      defaultLabels.modeCustomLabel,
    modeAriaLabel:
      overrides?.modeAriaLabel ?? locale?.cronEditor?.modeAriaLabel ?? defaultLabels.modeAriaLabel,
    stepAriaLabel:
      overrides?.stepAriaLabel ?? locale?.cronEditor?.stepAriaLabel ?? defaultLabels.stepAriaLabel,
    valueAriaLabel:
      overrides?.valueAriaLabel ??
      locale?.cronEditor?.valueAriaLabel ??
      defaultLabels.valueAriaLabel,
    rangeStartAriaLabel:
      overrides?.rangeStartAriaLabel ??
      locale?.cronEditor?.rangeStartAriaLabel ??
      defaultLabels.rangeStartAriaLabel,
    rangeEndAriaLabel:
      overrides?.rangeEndAriaLabel ??
      locale?.cronEditor?.rangeEndAriaLabel ??
      defaultLabels.rangeEndAriaLabel,
    customValueAriaLabel:
      overrides?.customValueAriaLabel ??
      locale?.cronEditor?.customValueAriaLabel ??
      defaultLabels.customValueAriaLabel,
    expressionFieldsError:
      overrides?.expressionFieldsError ??
      locale?.cronEditor?.expressionFieldsError ??
      defaultLabels.expressionFieldsError,
    fieldRequiredError:
      overrides?.fieldRequiredError ??
      locale?.cronEditor?.fieldRequiredError ??
      defaultLabels.fieldRequiredError,
    invalidStepError:
      overrides?.invalidStepError ??
      locale?.cronEditor?.invalidStepError ??
      defaultLabels.invalidStepError,
    stepRangeError:
      overrides?.stepRangeError ??
      locale?.cronEditor?.stepRangeError ??
      defaultLabels.stepRangeError,
    fieldRangeError:
      overrides?.fieldRangeError ??
      locale?.cronEditor?.fieldRangeError ??
      defaultLabels.fieldRangeError,
    rangeOrderError:
      overrides?.rangeOrderError ??
      locale?.cronEditor?.rangeOrderError ??
      defaultLabels.rangeOrderError,
    invalidFieldError:
      overrides?.invalidFieldError ??
      locale?.cronEditor?.invalidFieldError ??
      defaultLabels.invalidFieldError
  }
}

export const DEFAULT_FILE_MANAGER_LABELS: Required<TigerLocaleFileManager> = {
  rootText: 'Root'
}

export const ZH_CN_FILE_MANAGER_LABELS: Required<TigerLocaleFileManager> = {
  rootText: '根目录'
}

export function getFileManagerLabels(
  locale?: Partial<TigerLocale>
): Required<TigerLocaleFileManager> {
  const defaultLabels = locale?.locale?.startsWith('zh')
    ? ZH_CN_FILE_MANAGER_LABELS
    : DEFAULT_FILE_MANAGER_LABELS
  return {
    rootText: locale?.fileManager?.rootText ?? defaultLabels.rootText
  }
}

export const DEFAULT_IMAGE_VIEWER_LABELS: Required<TigerLocaleImageViewer> = {
  dialogAriaLabel: 'Image viewer',
  previewDialogAriaLabel: 'Image preview',
  closeAriaLabel: 'Close',
  closePreviewAriaLabel: 'Close preview',
  previousImageAriaLabel: 'Previous image',
  nextImageAriaLabel: 'Next image',
  zoomOutAriaLabel: 'Zoom out',
  resetAriaLabel: 'Reset',
  zoomInAriaLabel: 'Zoom in',
  rotateLeftAriaLabel: 'Rotate left',
  rotateRightAriaLabel: 'Rotate right'
}

export const ZH_CN_IMAGE_VIEWER_LABELS: Required<TigerLocaleImageViewer> = {
  dialogAriaLabel: '图片查看器',
  previewDialogAriaLabel: '图片预览',
  closeAriaLabel: '关闭',
  closePreviewAriaLabel: '关闭预览',
  previousImageAriaLabel: '上一张图片',
  nextImageAriaLabel: '下一张图片',
  zoomOutAriaLabel: '缩小',
  resetAriaLabel: '重置',
  zoomInAriaLabel: '放大',
  rotateLeftAriaLabel: '向左旋转',
  rotateRightAriaLabel: '向右旋转'
}

export function getImageViewerLabels(
  locale?: Partial<TigerLocale>
): Required<TigerLocaleImageViewer> {
  const defaultLabels = locale?.locale?.startsWith('zh')
    ? ZH_CN_IMAGE_VIEWER_LABELS
    : DEFAULT_IMAGE_VIEWER_LABELS
  return {
    dialogAriaLabel: locale?.imageViewer?.dialogAriaLabel ?? defaultLabels.dialogAriaLabel,
    previewDialogAriaLabel:
      locale?.imageViewer?.previewDialogAriaLabel ?? defaultLabels.previewDialogAriaLabel,
    closeAriaLabel:
      locale?.imageViewer?.closeAriaLabel ??
      locale?.common?.closeText ??
      defaultLabels.closeAriaLabel,
    closePreviewAriaLabel:
      locale?.imageViewer?.closePreviewAriaLabel ?? defaultLabels.closePreviewAriaLabel,
    previousImageAriaLabel:
      locale?.imageViewer?.previousImageAriaLabel ?? defaultLabels.previousImageAriaLabel,
    nextImageAriaLabel: locale?.imageViewer?.nextImageAriaLabel ?? defaultLabels.nextImageAriaLabel,
    zoomOutAriaLabel: locale?.imageViewer?.zoomOutAriaLabel ?? defaultLabels.zoomOutAriaLabel,
    resetAriaLabel: locale?.imageViewer?.resetAriaLabel ?? defaultLabels.resetAriaLabel,
    zoomInAriaLabel: locale?.imageViewer?.zoomInAriaLabel ?? defaultLabels.zoomInAriaLabel,
    rotateLeftAriaLabel:
      locale?.imageViewer?.rotateLeftAriaLabel ?? defaultLabels.rotateLeftAriaLabel,
    rotateRightAriaLabel:
      locale?.imageViewer?.rotateRightAriaLabel ?? defaultLabels.rotateRightAriaLabel
  }
}

export const DEFAULT_IMAGE_EDITOR_LABELS: Required<TigerLocaleImageEditor> = {
  selectImageText: 'Select image',
  selectImageAriaLabel: 'Select image to crop and upload',
  cropModalTitle: 'Crop image',
  cropCancelText: 'Cancel',
  cropConfirmText: 'Confirm crop',
  cropperDialogAriaLabel: 'Image cropper',
  imageToCropAriaLabel: 'Image to crop',
  moveCropAreaAriaLabel: 'Move crop area',
  resizeCropAreaAriaLabel: 'Resize crop area {handle}',
  loadingCropImageAriaLabel: 'Loading image for cropping',
  annotationToolbarAriaLabel: 'Annotation tools',
  annotationEditorAriaLabel: 'Image annotation editor',
  annotationCanvasAriaLabel: 'Image annotation canvas',
  loadingAnnotationImageAriaLabel: 'Loading image for annotation',
  selectToolText: 'Select',
  rectangleToolText: 'Rectangle',
  ellipseToolText: 'Ellipse',
  polygonToolText: 'Polygon',
  freehandToolText: 'Freehand',
  deleteText: 'Delete'
}

export const ZH_CN_IMAGE_EDITOR_LABELS: Required<TigerLocaleImageEditor> = {
  selectImageText: '选择图片',
  selectImageAriaLabel: '选择图片进行裁剪并上传',
  cropModalTitle: '裁剪图片',
  cropCancelText: '取消',
  cropConfirmText: '确认裁剪',
  cropperDialogAriaLabel: '图片裁剪器',
  imageToCropAriaLabel: '待裁剪图片',
  moveCropAreaAriaLabel: '移动裁剪区域',
  resizeCropAreaAriaLabel: '调整裁剪区域 {handle}',
  loadingCropImageAriaLabel: '正在加载待裁剪图片',
  annotationToolbarAriaLabel: '标注工具',
  annotationEditorAriaLabel: '图片标注编辑器',
  annotationCanvasAriaLabel: '图片标注画布',
  loadingAnnotationImageAriaLabel: '正在加载待标注图片',
  selectToolText: '选择',
  rectangleToolText: '矩形',
  ellipseToolText: '椭圆',
  polygonToolText: '多边形',
  freehandToolText: '自由绘制',
  deleteText: '删除'
}

export function getImageEditorLabels(
  locale?: Partial<TigerLocale>
): Required<TigerLocaleImageEditor> {
  const defaultLabels = locale?.locale?.startsWith('zh')
    ? ZH_CN_IMAGE_EDITOR_LABELS
    : DEFAULT_IMAGE_EDITOR_LABELS
  return {
    selectImageText: locale?.imageEditor?.selectImageText ?? defaultLabels.selectImageText,
    selectImageAriaLabel:
      locale?.imageEditor?.selectImageAriaLabel ?? defaultLabels.selectImageAriaLabel,
    cropModalTitle: locale?.imageEditor?.cropModalTitle ?? defaultLabels.cropModalTitle,
    cropCancelText:
      locale?.imageEditor?.cropCancelText ??
      locale?.common?.cancelText ??
      defaultLabels.cropCancelText,
    cropConfirmText:
      locale?.imageEditor?.cropConfirmText ??
      locale?.common?.okText ??
      defaultLabels.cropConfirmText,
    cropperDialogAriaLabel:
      locale?.imageEditor?.cropperDialogAriaLabel ?? defaultLabels.cropperDialogAriaLabel,
    imageToCropAriaLabel:
      locale?.imageEditor?.imageToCropAriaLabel ?? defaultLabels.imageToCropAriaLabel,
    moveCropAreaAriaLabel:
      locale?.imageEditor?.moveCropAreaAriaLabel ?? defaultLabels.moveCropAreaAriaLabel,
    resizeCropAreaAriaLabel:
      locale?.imageEditor?.resizeCropAreaAriaLabel ?? defaultLabels.resizeCropAreaAriaLabel,
    loadingCropImageAriaLabel:
      locale?.imageEditor?.loadingCropImageAriaLabel ?? defaultLabels.loadingCropImageAriaLabel,
    annotationToolbarAriaLabel:
      locale?.imageEditor?.annotationToolbarAriaLabel ?? defaultLabels.annotationToolbarAriaLabel,
    annotationEditorAriaLabel:
      locale?.imageEditor?.annotationEditorAriaLabel ?? defaultLabels.annotationEditorAriaLabel,
    annotationCanvasAriaLabel:
      locale?.imageEditor?.annotationCanvasAriaLabel ?? defaultLabels.annotationCanvasAriaLabel,
    loadingAnnotationImageAriaLabel:
      locale?.imageEditor?.loadingAnnotationImageAriaLabel ??
      defaultLabels.loadingAnnotationImageAriaLabel,
    selectToolText: locale?.imageEditor?.selectToolText ?? defaultLabels.selectToolText,
    rectangleToolText: locale?.imageEditor?.rectangleToolText ?? defaultLabels.rectangleToolText,
    ellipseToolText: locale?.imageEditor?.ellipseToolText ?? defaultLabels.ellipseToolText,
    polygonToolText: locale?.imageEditor?.polygonToolText ?? defaultLabels.polygonToolText,
    freehandToolText: locale?.imageEditor?.freehandToolText ?? defaultLabels.freehandToolText,
    deleteText: locale?.imageEditor?.deleteText ?? defaultLabels.deleteText
  }
}

export const DEFAULT_STATUS_LABELS: Required<TigerLocaleStatus> = {
  tagCloseAriaLabel: 'Close tag',
  badgeLabel: 'notification',
  badgeCountLabel: '{count} notifications'
}

export const ZH_CN_STATUS_LABELS: Required<TigerLocaleStatus> = {
  tagCloseAriaLabel: '关闭标签',
  badgeLabel: '通知',
  badgeCountLabel: '{count} 条通知'
}

export function getStatusLabels(locale?: Partial<TigerLocale>): Required<TigerLocaleStatus> {
  const defaultLabels = locale?.locale?.startsWith('zh')
    ? ZH_CN_STATUS_LABELS
    : DEFAULT_STATUS_LABELS
  return {
    tagCloseAriaLabel: locale?.status?.tagCloseAriaLabel ?? defaultLabels.tagCloseAriaLabel,
    badgeLabel: locale?.status?.badgeLabel ?? defaultLabels.badgeLabel,
    badgeCountLabel: locale?.status?.badgeCountLabel ?? defaultLabels.badgeCountLabel
  }
}

// ============================================================================
// Form Validation Labels
// ============================================================================

/**
 * Default English form-validation messages. Range messages use {min}/{max}.
 */
export const DEFAULT_FORM_VALIDATION_LABELS: Required<TigerLocaleFormValidation> = {
  required: 'This field is required',
  typeString: 'Value must be a string',
  typeNumber: 'Value must be a number',
  typeBoolean: 'Value must be a boolean',
  typeArray: 'Value must be an array',
  typeObject: 'Value must be an object',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  date: 'Please enter a valid date',
  idCard: 'Please enter a valid ID card number',
  minLength: 'Minimum length is {min} characters',
  maxLength: 'Maximum length is {max} characters',
  minValue: 'Minimum value is {min}',
  maxValue: 'Maximum value is {max}',
  minItems: 'Minimum {min} items required',
  maxItems: 'Maximum {max} items allowed',
  patternMismatch: 'Value does not match the required pattern',
  validatorFailed: 'Validation failed',
  validatorError: 'Validation error occurred'
}

/**
 * Chinese (Simplified) form-validation messages.
 */
export const ZH_CN_FORM_VALIDATION_LABELS: Required<TigerLocaleFormValidation> = {
  required: '此字段为必填项',
  typeString: '值必须是字符串',
  typeNumber: '值必须是数字',
  typeBoolean: '值必须是布尔值',
  typeArray: '值必须是数组',
  typeObject: '值必须是对象',
  email: '请输入有效的邮箱地址',
  phone: '请输入有效的电话号码',
  url: '请输入有效的网址',
  date: '请输入有效的日期',
  idCard: '请输入有效的身份证号码',
  minLength: '长度不能少于 {min} 个字符',
  maxLength: '长度不能超过 {max} 个字符',
  minValue: '数值不能小于 {min}',
  maxValue: '数值不能大于 {max}',
  minItems: '至少需要 {min} 项',
  maxItems: '最多允许 {max} 项',
  patternMismatch: '格式不正确',
  validatorFailed: '校验未通过',
  validatorError: '校验时发生错误'
}

/**
 * Resolve form-validation messages with fallback to defaults.
 *
 * Priority per field: overrides > locale.formValidation > locale default.
 */
export function getFormValidationLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFormValidation>
): Required<TigerLocaleFormValidation> {
  const isZh = !!locale?.locale?.startsWith('zh')
  const defaultLabels = isZh ? ZH_CN_FORM_VALIDATION_LABELS : DEFAULT_FORM_VALIDATION_LABELS
  const fv = locale?.formValidation
  const resolved = {} as Required<TigerLocaleFormValidation>
  for (const key of Object.keys(defaultLabels) as Array<keyof TigerLocaleFormValidation>) {
    resolved[key] = overrides?.[key] ?? fv?.[key] ?? defaultLabels[key]
  }
  return resolved
}

// ============================================================================
// TimePicker Labels (centralized defaults; see timepicker-utils for the
// per-language map that consumes these for the en/zh baselines)
// ============================================================================

export const DEFAULT_TIME_PICKER_LABELS: TimePickerLabels = {
  hour: 'Hour',
  minute: 'Min',
  second: 'Sec',
  now: 'Now',
  ok: 'OK',
  start: 'Start',
  end: 'End',
  clear: 'Clear time',
  toggle: 'Toggle time picker',
  dialog: 'Time picker',
  selectTime: 'Select time',
  selectTimeRange: 'Select time range'
}

export const ZH_CN_TIME_PICKER_LABELS: TimePickerLabels = {
  hour: '时',
  minute: '分',
  second: '秒',
  now: '现在',
  ok: '确定',
  start: '开始',
  end: '结束',
  clear: '清除时间',
  toggle: '打开时间选择器',
  dialog: '时间选择器',
  selectTime: '请选择时间',
  selectTimeRange: '请选择时间范围'
}

// ============================================================================
// Upload Labels (centralized English defaults consumed by getUploadLabels)
// ============================================================================

export const DEFAULT_UPLOAD_LABELS: UploadLabels = {
  dragAreaAriaLabel: 'Upload file by clicking or dragging',
  buttonAriaLabel: 'Upload file',
  clickToUploadText: 'Click to upload',
  dragAndDropText: 'or drag and drop',
  acceptInfoText: 'Accepted: {accept}',
  maxSizeInfoText: 'Max size: {maxSize}',
  selectFileText: 'Select File',
  uploadedFilesAriaLabel: 'Uploaded files',
  successAriaLabel: 'Success',
  errorAriaLabel: 'Error',
  uploadingAriaLabel: 'Uploading',
  removeFileAriaLabel: 'Remove {fileName}',
  previewFileAriaLabel: 'Preview {fileName}'
}

export const ZH_CN_UPLOAD_LABELS: UploadLabels = {
  dragAreaAriaLabel: '点击或拖拽上传文件',
  buttonAriaLabel: '上传文件',
  clickToUploadText: '点击上传',
  dragAndDropText: '或拖拽到此处',
  acceptInfoText: '支持：{accept}',
  maxSizeInfoText: '最大大小：{maxSize}',
  selectFileText: '选择文件',
  uploadedFilesAriaLabel: '已上传文件',
  successAriaLabel: '成功',
  errorAriaLabel: '错误',
  uploadingAriaLabel: '上传中',
  removeFileAriaLabel: '移除 {fileName}',
  previewFileAriaLabel: '预览 {fileName}'
}
