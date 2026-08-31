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
  TigerLocaleEmpty,
  TigerLocaleQRCode,
  TigerLocalePagination,
  TigerLocaleTable,
  TigerLocaleDataExport,
  TigerLocaleFormWizard,
  TigerLocaleTour,
  TigerLocaleCalendar,
  TigerLocaleFileManager,
  TigerLocaleImageViewer,
  TigerLocaleImageEditor,
  TigerLocaleStatus,
  TigerLocaleTaskBoard,
  TigerLocaleChatWindow,
  TigerLocaleCode,
  TigerLocaleCommentThread,
  TigerLocaleActivityFeed,
  TigerLocaleNotificationCenter,
  TigerLocaleSelect,
  TigerLocaleColorPicker,
  TigerLocaleTabs,
  TigerLocaleRate,
  TigerLocaleAvatarGroup,
  TigerLocaleCarousel,
  TigerLocaleMarquee,
  TigerLocaleImage,
  TigerLocaleImageCompare,
  TigerLocaleDescriptions,
  TigerLocaleList,
  TigerLocaleScrollArea,
  TigerLocalePrintLayout,
  TigerLocaleProgress,
  TigerLocaleSplitter,
  TigerLocaleResizable,
  TigerLocaleTransfer,
  TigerLocaleChart,
  TigerLocaleMarkdownEditor,
  TigerLocaleRichTextEditor,
  TigerLocaleCronEditor,
  TigerLocaleFormValidation,
  TigerLocaleInputOTP,
  TigerLocaleTagsInput,
  TigerLocaleInputLabels,
  TigerLocaleInputNumber,
  TigerLocaleDirection
} from '../types/locale'
import { deepMergeLocale, TIGER_LOCALE_KEYS } from './i18n/locale-merge'
import { enUS } from './i18n/locales/en-US'

export { TIGER_LOCALE_KEYS, mergeTigerLocale } from './i18n/locale-merge'

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

export function formatIntlNumber(
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  if (!locale && !options) return String(value)
  try {
    return new Intl.NumberFormat(locale || undefined, options).format(value)
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

/**
 * Merge `overrides` onto `section` onto `defaults`, skipping `undefined`.
 * Missing keys always fall back to the en-US locale object — never a
 * language-id heuristic.
 */
export function resolveLocaleSection<T extends Record<string, unknown>>(
  defaults: T,
  section?: Partial<T> | null,
  overrides?: Partial<T> | null
): T {
  return deepMergeLocale(
    deepMergeLocale(defaults, section ?? undefined),
    overrides ?? undefined
  ) as T
}

function enSection<K extends keyof TigerLocale>(key: K): Required<NonNullable<TigerLocale[K]>> {
  return enUS[key] as Required<NonNullable<TigerLocale[K]>>
}

export function getEmptyLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleEmpty>
): Required<TigerLocaleEmpty> {
  return resolveLocaleSection(enSection('empty'), locale?.empty, overrides)
}

export function getQRCodeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleQRCode>
): Required<TigerLocaleQRCode> {
  return resolveLocaleSection(enSection('qrcode'), locale?.qrcode, overrides)
}

export function getTourLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTour>
): Required<TigerLocaleTour> {
  const labels = resolveLocaleSection(enSection('tour'), locale?.tour, overrides)
  return {
    ...labels,
    closeAriaLabel:
      overrides?.closeAriaLabel ??
      locale?.tour?.closeAriaLabel ??
      locale?.common?.closeText ??
      labels.closeAriaLabel
  }
}

export function getCalendarLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCalendar>
): Required<TigerLocaleCalendar> {
  return resolveLocaleSection(enSection('calendar'), locale?.calendar, overrides)
}

export function getFormWizardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFormWizard>
): Required<TigerLocaleFormWizard> {
  return resolveLocaleSection(enSection('formWizard'), locale?.formWizard, overrides)
}

export function getPaginationLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocalePagination>
): Required<TigerLocalePagination> {
  return resolveLocaleSection(enSection('pagination'), locale?.pagination, overrides)
}

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

export function getTableLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTable>
): Required<TigerLocaleTable> {
  return resolveLocaleSection(enSection('table'), locale?.table, overrides)
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

export function getDataExportLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleDataExport>
): Required<TigerLocaleDataExport> {
  return resolveLocaleSection(enSection('dataExport'), locale?.dataExport, overrides)
}

export function getTaskBoardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTaskBoard>
): Required<TigerLocaleTaskBoard> {
  return resolveLocaleSection(enSection('taskBoard'), locale?.taskBoard, overrides)
}

export function getChatWindowLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleChatWindow>
): Required<TigerLocaleChatWindow> {
  return resolveLocaleSection(enSection('chatWindow'), locale?.chatWindow, overrides)
}

export function getCodeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCode>
): Required<TigerLocaleCode> {
  return resolveLocaleSection(enSection('code'), locale?.code, overrides)
}

export function getCommentThreadLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCommentThread>
): Required<TigerLocaleCommentThread> {
  return resolveLocaleSection(enSection('commentThread'), locale?.commentThread, overrides)
}

export function getActivityFeedLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleActivityFeed>
): Required<TigerLocaleActivityFeed> {
  return resolveLocaleSection(enSection('activityFeed'), locale?.activityFeed, overrides)
}

export function getNotificationCenterLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleNotificationCenter>
): Required<TigerLocaleNotificationCenter> {
  return resolveLocaleSection(
    enSection('notificationCenter'),
    locale?.notificationCenter,
    overrides
  )
}

export function getSelectLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSelect>
): Required<TigerLocaleSelect> {
  return resolveLocaleSection(enSection('select'), locale?.select, overrides)
}

export function getColorPickerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleColorPicker>
): Required<TigerLocaleColorPicker> {
  return resolveLocaleSection(enSection('colorPicker'), locale?.colorPicker, overrides)
}

export function formatColorPickerSelectPreset(template: string, color: string): string {
  return template.replace('{color}', color)
}

export function getTabsLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTabs>
): Required<TigerLocaleTabs> {
  return resolveLocaleSection(enSection('tabs'), locale?.tabs, overrides)
}

export function getRateLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleRate>
): Required<TigerLocaleRate> {
  return resolveLocaleSection(enSection('rate'), locale?.rate, overrides)
}

/**
 * Fill `{value}` with an Intl number. The rest of the sentence comes from the locale.
 */
export function formatRateValueText(template: string, value: number, locale?: string): string {
  return template.replace('{value}', formatIntlNumber(value, locale))
}

export function getAvatarGroupLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleAvatarGroup>
): Required<TigerLocaleAvatarGroup> {
  return resolveLocaleSection(enSection('avatarGroup'), locale?.avatarGroup, overrides)
}

export function getCarouselLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCarousel>
): Required<TigerLocaleCarousel> {
  return resolveLocaleSection(enSection('carousel'), locale?.carousel, overrides)
}

export function getProgressLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleProgress>
): Required<TigerLocaleProgress> {
  return resolveLocaleSection(enSection('progress'), locale?.progress, overrides)
}

export function getSplitterLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSplitter>
): Required<TigerLocaleSplitter> {
  return resolveLocaleSection(enSection('splitter'), locale?.splitter, overrides)
}

export function getResizableLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleResizable>
): Required<TigerLocaleResizable> {
  return resolveLocaleSection(enSection('resizable'), locale?.resizable, overrides)
}

export function formatResizableHandleLabel(template: string, handle: string): string {
  return template.replace(/\{handle\}/g, handle)
}

export function getMarqueeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleMarquee>
): Required<TigerLocaleMarquee> {
  return resolveLocaleSection(enSection('marquee'), locale?.marquee, overrides)
}

export function getSidebarAriaLabel(locale?: Partial<TigerLocale>): string {
  return resolveLocaleText(
    enUS.common?.sidebarAriaLabel ?? 'Sidebar',
    locale?.common?.sidebarAriaLabel
  )
}

export function getImageLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImage>
): Required<TigerLocaleImage> {
  return resolveLocaleSection(enSection('image'), locale?.image, overrides)
}

export function getImageCompareLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImageCompare>
): Required<TigerLocaleImageCompare> {
  return resolveLocaleSection(enSection('imageCompare'), locale?.imageCompare, overrides)
}

export function getDescriptionsLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleDescriptions>
): Required<TigerLocaleDescriptions> {
  return resolveLocaleSection(enSection('descriptions'), locale?.descriptions, overrides)
}

export function getListLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleList>
): Required<TigerLocaleList> {
  return resolveLocaleSection(enSection('list'), locale?.list, overrides)
}

export function getScrollAreaLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleScrollArea>
): Required<TigerLocaleScrollArea> {
  return resolveLocaleSection(enSection('scrollArea'), locale?.scrollArea, overrides)
}

export function getPrintLayoutLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocalePrintLayout>
): Required<TigerLocalePrintLayout> {
  return resolveLocaleSection(enSection('printLayout'), locale?.printLayout, overrides)
}

export function getTransferLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTransfer>
): Required<TigerLocaleTransfer> {
  return resolveLocaleSection(enSection('transfer'), locale?.transfer, overrides)
}

export function getChartLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleChart>
): Required<TigerLocaleChart> {
  return resolveLocaleSection(enSection('chart'), locale?.chart, overrides)
}

export function getMarkdownEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleMarkdownEditor>
): Required<TigerLocaleMarkdownEditor> {
  return resolveLocaleSection(enSection('markdownEditor'), locale?.markdownEditor, overrides)
}

export function getRichTextEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleRichTextEditor>
): Required<TigerLocaleRichTextEditor> {
  return resolveLocaleSection(enSection('richTextEditor'), locale?.richTextEditor, overrides)
}

export function getCronEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCronEditor>
): Required<TigerLocaleCronEditor> {
  return resolveLocaleSection(enSection('cronEditor'), locale?.cronEditor, overrides)
}

export function getFileManagerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFileManager>
): Required<TigerLocaleFileManager> {
  return resolveLocaleSection(enSection('fileManager'), locale?.fileManager, overrides)
}

export function getImageViewerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImageViewer>
): Required<TigerLocaleImageViewer> {
  return resolveLocaleSection(enSection('imageViewer'), locale?.imageViewer, overrides)
}

export function getImageEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImageEditor>
): Required<TigerLocaleImageEditor> {
  return resolveLocaleSection(enSection('imageEditor'), locale?.imageEditor, overrides)
}

export function getStatusLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleStatus>
): Required<TigerLocaleStatus> {
  return resolveLocaleSection(enSection('status'), locale?.status, overrides)
}

/**
 * Fill `{count}` with an Intl number and `{plural}` with an English suffix
 * (`''` for `one`, `'s'` otherwise). Locales that write a complete sentence
 * omit `{plural}` so they are not given an English `s`.
 */
export function formatBadgeCountLabel(template: string, count: number, locale?: string): string {
  const category = getIntlPluralCategory(count, locale)
  return template
    .replace('{count}', formatIntlNumber(count, locale))
    .replace('{plural}', category === 'one' ? '' : 's')
}

export function getFormValidationLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFormValidation>
): Required<TigerLocaleFormValidation> {
  return resolveLocaleSection(enSection('formValidation'), locale?.formValidation, overrides)
}

export function getInputOTPLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleInputOTP>
): Required<TigerLocaleInputOTP> {
  return resolveLocaleSection(enSection('inputOtp'), locale?.inputOtp, overrides)
}

export function getTagsInputLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTagsInput>
): Required<TigerLocaleTagsInput> {
  return resolveLocaleSection(enSection('tagsInput'), locale?.tagsInput, overrides)
}

export function getInputLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleInputLabels>
): Required<TigerLocaleInputLabels> {
  return resolveLocaleSection(enSection('input'), locale?.input, overrides)
}

export function getInputNumberLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleInputNumber>
): Required<TigerLocaleInputNumber> {
  return resolveLocaleSection(enSection('inputNumber'), locale?.inputNumber, overrides)
}
