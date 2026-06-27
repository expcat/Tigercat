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
  TigerLocaleTaskBoard,
  TigerLocaleFormValidation,
  TigerLocaleDirection
} from '../types/locale'
import type { TimePickerLabels } from '../types/timepicker'
import type { UploadLabels } from '../types/upload'

const TIGER_LOCALE_KEYS = [
  'locale',
  'direction',
  'common',
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
  'taskBoard',
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
    taskBoard: { ...base?.taskBoard, ...override?.taskBoard },
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
  unlockColumnAriaLabel: 'Unlock column {column}'
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
  unlockColumnAriaLabel: '取消锁定{column}列'
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
      defaultLabels.unlockColumnAriaLabel
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
    wipLimitText:
      overrides?.wipLimitText ?? locale?.taskBoard?.wipLimitText ?? defaultLabels.wipLimitText,
    dragHintText:
      overrides?.dragHintText ?? locale?.taskBoard?.dragHintText ?? defaultLabels.dragHintText,
    boardAriaLabel:
      overrides?.boardAriaLabel ?? locale?.taskBoard?.boardAriaLabel ?? defaultLabels.boardAriaLabel
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
